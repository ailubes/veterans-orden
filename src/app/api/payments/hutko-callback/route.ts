import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyHutkoCallback } from '@/lib/payments/hutko';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // HUTKO may send JSON or form-encoded
    const contentType = request.headers.get('content-type') ?? '';
    let body: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const json = await request.json();
      for (const [k, v] of Object.entries(json)) body[k] = String(v);
    } else {
      const text = await request.text();
      // Try JSON first, then fall back to form-encoded
      try {
        const json = JSON.parse(text);
        for (const [k, v] of Object.entries(json)) body[k] = String(v);
      } catch {
        const params = new URLSearchParams(text);
        params.forEach((v, k) => { body[k] = v; });
      }
    }

    console.log('HUTKO callback body:', JSON.stringify(body));

    const supabase = createServiceClient();

    // Fetch secret key
    const { data: settings } = await supabase
      .from('organization_settings')
      .select('key, value')
      .eq('key', 'payment_hutko_secret_key');

    const secretKey = String(settings?.find((s) => s.key === 'payment_hutko_secret_key')?.value ?? '');

    if (!secretKey) {
      console.error('HUTKO callback: secret key not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    // Verify signature (tries both SHA1 formats)
    if (!verifyHutkoCallback(body, secretKey)) {
      console.error('HUTKO callback: invalid signature. Body keys:', Object.keys(body).sort().join(','));
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const orderId = body.order_id;
    const orderStatus = body.order_status;

    if (!orderId) {
      console.error('HUTKO callback: missing order_id');
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const dbStatus = orderStatus === 'approved' ? 'completed' : 'failed';

    // Fetch the payment record to get user_id, membership_tier, and existing provider_data
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, user_id, membership_tier, provider_data')
      .eq('provider_transaction_id', orderId)
      .single();

    if (fetchError || !payment) {
      console.error('HUTKO callback: payment not found for order_id', orderId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const now = new Date();
    const existingProviderData = (payment.provider_data as Record<string, unknown>) ?? {};
    const isAnnual = existingProviderData.is_annual === true;
    const periodEnd = new Date(now);
    if (isAnnual) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update payment record with rectoken, period dates, and HUTKO response fields
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: dbStatus,
        completed_at: dbStatus === 'completed' ? now.toISOString() : null,
        period_start: dbStatus === 'completed' ? now.toISOString() : null,
        period_end: dbStatus === 'completed' ? periodEnd.toISOString() : null,
        provider_data: {
          ...existingProviderData,
          hutko_order_status: orderStatus,
          hutko_payment_id: body.payment_id,
          hutko_sender_card_mask2: body.sender_card_mask2,
          rectoken: body.rectoken ?? existingProviderData.rectoken ?? null,
        },
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('HUTKO callback: failed to update payment', paymentUpdateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    // On success — promote the user's membership tier, role, membership_role, and set paid_until
    if (dbStatus === 'completed' && payment.membership_tier && payment.user_id) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          membership_tier: payment.membership_tier,
          role: 'full_member',
          membership_role: 'candidate',
          membership_paid_until: periodEnd.toISOString(),
          status: 'active',
          updated_at: now.toISOString(),
        })
        .eq('id', payment.user_id);

      if (userUpdateError) {
        console.error('HUTKO callback: failed to update user membership', userUpdateError);
        // Don't fail the callback — payment is recorded, manual fix possible
      } else {
        console.log(`HUTKO callback: user ${payment.user_id} promoted to ${payment.membership_tier}, paid until ${periodEnd.toISOString()}`);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('HUTKO callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
