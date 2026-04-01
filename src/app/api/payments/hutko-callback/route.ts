import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyHutkoCallback } from '@/lib/payments/hutko';
import { getHutkoConfig } from '@/lib/payments/hutko-config';

export const dynamic = 'force-dynamic';

type PaymentDbStatus = 'pending' | 'completed' | 'failed';

function resolvePaymentStatus(body: Record<string, string>): PaymentDbStatus {
  const orderStatus = body.order_status?.toLowerCase() || '';
  const responseCode = body.response_code?.trim() || '';
  const responseDescription = body.response_description?.toLowerCase() || '';

  let bankResponseDescription = '';
  try {
    const additionalInfo = JSON.parse(body.additional_info || '{}') as {
      bank_response_description?: string | null;
    };
    bankResponseDescription = additionalInfo.bank_response_description?.toLowerCase() || '';
  } catch {
    bankResponseDescription = '';
  }

  if (orderStatus === 'approved') {
    return 'completed';
  }

  const failedOrderStatuses = new Set([
    'declined',
    'expired',
    'rejected',
    'cancelled',
    'canceled',
    'failed',
  ]);

  if (failedOrderStatuses.has(orderStatus)) {
    return 'failed';
  }

  if (responseCode) {
    return 'failed';
  }

  if (
    responseDescription.includes('failed') ||
    bankResponseDescription.includes('failed') ||
    bankResponseDescription.includes('authentication_failed')
  ) {
    return 'failed';
  }

  return 'pending';
}

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

    const hutkoConfig = await getHutkoConfig();
    const secretKey = hutkoConfig.secretKey;

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

    const dbStatus = resolvePaymentStatus(body);

    // Fetch the payment record to get payment type, user_id, membership_tier, and existing provider_data
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, type, user_id, membership_tier, provider_data')
      .eq('provider_transaction_id', orderId)
      .single();

    if (fetchError || !payment) {
      if (orderId.startsWith('don_')) {
        console.warn('HUTKO callback: donation payment not found for order_id', orderId);
        return new Response('OK', { status: 200 });
      }

      console.error('HUTKO callback: payment not found for order_id', orderId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const now = new Date();
    const existingProviderData = (payment.provider_data as Record<string, unknown>) ?? {};
    const existingCallbackEvents = Array.isArray(existingProviderData.callback_events)
      ? existingProviderData.callback_events as unknown[]
      : [];
    const callbackEvent = {
      received_at: now.toISOString(),
      order_status: body.order_status ?? null,
      response_status: body.response_status ?? null,
      response_code: body.response_code ?? null,
      response_description: body.response_description ?? null,
      payment_id: body.payment_id ?? null,
      amount: body.amount ?? null,
      actual_amount: body.actual_amount ?? null,
      payment_system: body.payment_system ?? null,
      masked_card: body.masked_card ?? body.sender_card_mask2 ?? null,
      raw: body,
    };

    let bankResponseCode: string | null = null;
    let bankResponseDescription: string | null = null;

    try {
      const additionalInfo = JSON.parse(body.additional_info || '{}') as {
        bank_response_code?: string | null;
        bank_response_description?: string | null;
      };
      bankResponseCode = additionalInfo.bank_response_code ?? null;
      bankResponseDescription = additionalInfo.bank_response_description ?? null;
    } catch {
      bankResponseCode = null;
      bankResponseDescription = null;
    }

    const isMembershipPayment = payment.type === 'membership';
    const isAnnual = existingProviderData.is_annual === true;
    const periodEnd = isMembershipPayment ? new Date(now) : null;

    if (periodEnd) {
      if (isAnnual) {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    }

    // Update payment record with rectoken, period dates, and HUTKO response fields
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: dbStatus,
        completed_at: dbStatus === 'completed' ? now.toISOString() : null,
        period_start: dbStatus === 'completed' && isMembershipPayment ? now.toISOString() : null,
        period_end: dbStatus === 'completed' && periodEnd ? periodEnd.toISOString() : null,
        provider_data: {
          ...existingProviderData,
          hutko_order_status: orderStatus,
          hutko_payment_id: body.payment_id,
          hutko_response_status: body.response_status ?? null,
          hutko_response_code: body.response_code ?? null,
          hutko_response_description: body.response_description ?? null,
          hutko_bank_response_code: bankResponseCode,
          hutko_bank_response_description: bankResponseDescription,
          hutko_masked_card: body.masked_card ?? body.sender_card_mask2 ?? null,
          hutko_card_type: body.card_type ?? null,
          hutko_payment_system: body.payment_system ?? null,
          hutko_sender_card_mask2: body.sender_card_mask2 ?? null,
          hutko_last_callback_at: now.toISOString(),
          hutko_last_callback: callbackEvent,
          callback_events: [...existingCallbackEvents.slice(-19), callbackEvent],
          rectoken: body.rectoken ?? existingProviderData.rectoken ?? null,
        },
      })
      .eq('id', payment.id);

    if (paymentUpdateError) {
      console.error('HUTKO callback: failed to update payment', paymentUpdateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    // On success — promote the user's membership tier, role, membership_role, and set paid_until
    if (dbStatus === 'completed' && isMembershipPayment && payment.membership_tier && payment.user_id && periodEnd) {
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
