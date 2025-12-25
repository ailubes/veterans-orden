import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyLiqPayCallback, decodeLiqPayData, parseOrderId } from '@/lib/liqpay';

export const dynamic = 'force-dynamic'; // Mark as dynamic because we use cookies

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;

    if (!data || !signature) {
      return NextResponse.json({ error: 'Missing data or signature' }, { status: 400 });
    }

    // Verify signature
    if (!verifyLiqPayCallback(data, signature)) {
      console.error('Invalid LiqPay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const callbackData = decodeLiqPayData(data);
    const { status, order_id, amount, payment_id } = callbackData;

    console.log('LiqPay callback:', { status, order_id, amount, payment_id });

    const supabase = await createClient();

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
          console.error('User update error:', userError);
        }

        // Award points for becoming a paid member
        await supabase.rpc('increment_user_points', {
          user_id: payment.user_id,
          points_to_add: 50, // Bonus for becoming paid member
        });

        // Log payment success for analytics
        console.log('[Analytics] Payment completed:', {
          user_id: payment.user_id,
          tier: tierId,
          amount,
          order_id,
        });
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
