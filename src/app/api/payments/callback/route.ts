import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyLiqPayCallback, decodeLiqPayData, parseOrderId } from '@/lib/liqpay';
import { parsePaymentSettings } from '@/lib/settings/parser';

export const dynamic = 'force-dynamic'; // Mark as dynamic because we use cookies

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    if (!data || !signature) {
      return NextResponse.json({ error: 'Missing data or signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch payment settings to verify signature
    const { data: settings, error: settingsError } = await supabase
      .from('organization_settings')
      .select('key, value')
      .in('key', ['payment_liqpay_private_key', 'payment_success_bonus_points']);

    if (settingsError) {
      console.error('Error fetching payment settings:', settingsError);
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Parse payment settings with type safety
    const settingsMap = new Map(settings?.map((s) => [s.key, s.value]) || []);
    const paymentSettings = parsePaymentSettings(settingsMap);

    if (!paymentSettings.payment_liqpay_private_key) {
      console.error('LiqPay private key not configured');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    // Verify signature
    if (!verifyLiqPayCallback(data, signature, paymentSettings.payment_liqpay_private_key)) {
      console.error('Invalid LiqPay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const bonusPoints = paymentSettings.payment_success_bonus_points;

    const callbackData = decodeLiqPayData(data);
    const { status, order_id, amount, payment_id } = callbackData;

    console.log('LiqPay callback:', { status, order_id, amount, payment_id });

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: status === 'success' || status === 'sandbox' ? 'completed' : status,
        liqpay_payment_id: payment_id?.toString(),
        completed_at: status === 'success' || status === 'sandbox' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id)
      .select('user_id, metadata')
      .single();

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If payment successful, update user's membership
    if (status === 'success' || status === 'sandbox') {
      const parsedOrder = parseOrderId(order_id);
      const tierId = parsedOrder?.tierId || payment.metadata?.tier_id;

      if (tierId && payment.user_id) {
        try {
          // Update user membership - CRITICAL OPERATION
          const { error: userError } = await supabase
            .from('users')
            .update({
              membership_tier: tierId,
              role: 'full_member', // Upgrade to full member on payment
              membership_started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.user_id);

          if (userError) {
            console.error('[CRITICAL] User update failed after payment:', userError);

            // Mark payment for manual review
            await supabase
              .from('payments')
              .update({
                status: 'pending_review',
                metadata: {
                  ...payment.metadata,
                  error: 'User update failed',
                  error_details: userError.message,
                  requires_manual_processing: true,
                },
                updated_at: new Date().toISOString(),
              })
              .eq('order_id', order_id);

            return NextResponse.json(
              { error: 'Payment processed but user update failed. Contact support.' },
              { status: 500 }
            );
          }

          // Award points for becoming a paid member
          const { error: pointsError } = await supabase.rpc('increment_user_points', {
            user_id: payment.user_id,
            points_to_add: bonusPoints,
          });

          if (pointsError) {
            console.error('[WARNING] Points increment failed after payment:', pointsError);

            // Log to audit log for admin review but don't fail the payment
            await supabase.from('audit_log').insert({
              action: 'payment_points_failed',
              user_id: payment.user_id,
              metadata: {
                order_id,
                points: bonusPoints,
                error: pointsError.message,
                payment_id,
              },
              created_at: new Date().toISOString(),
            });
          }

          // Log payment success for analytics
          console.log('[Analytics] Payment completed:', {
            user_id: payment.user_id,
            tier: tierId,
            amount,
            order_id,
            points_awarded: pointsError ? 0 : bonusPoints,
          });
        } catch (error) {
          console.error('[CRITICAL] Payment callback exception:', error);
          return NextResponse.json(
            { error: 'Payment processing failed' },
            { status: 500 }
          );
        }
      }
    } else {
      // Log payment failure
      console.log('[Analytics] Payment failed:', {
        user_id: payment.user_id,
        status,
        order_id,
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
