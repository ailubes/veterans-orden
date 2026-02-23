/**
 * PUMB PayHub2 webhook callback handler.
 *
 * PUMB POSTs JSON to this endpoint after a payment succeeds or fails.
 * Expected payload structure (from PUMB PayHub2 docs):
 * {
 *   order_id: string,
 *   status: 'success' | 'failed' | 'pending',
 *   amount: number,
 *   currency: string,
 *   transaction_id: string,
 *   signature: string  // HMAC-SHA256 of canonical payload using client_secret
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { parseOrderId } from '@/lib/liqpay';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function verifyPumbSignature(
  payload: Record<string, unknown>,
  receivedSignature: string,
  clientSecret: string
): boolean {
  // PUMB signature: HMAC-SHA256 of sorted JSON keys excluding 'signature' field
  const { signature: _sig, ...rest } = payload;
  const canonical = JSON.stringify(
    Object.fromEntries(Object.entries(rest).sort(([a], [b]) => a.localeCompare(b)))
  );
  const expected = crypto
    .createHmac('sha256', clientSecret)
    .update(canonical)
    .digest('hex');
  return expected === receivedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status, amount, currency, transaction_id, signature } = body;

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch PUMB credentials for signature verification
    const { data: settings } = await supabase
      .from('organization_settings')
      .select('key, value')
      .in('key', ['payment_pumb_client_secret', 'payment_success_bonus_points']);

    const map = new Map(settings?.map((s: { key: string; value: string }) => [s.key, s.value]) || []);
    const pumbClientSecret = map.get('payment_pumb_client_secret') || '';
    const bonusPoints = parseInt(map.get('payment_success_bonus_points') || '100', 10);

    // Verify signature if client secret is configured
    if (pumbClientSecret && signature) {
      if (!verifyPumbSignature(body, signature, pumbClientSecret)) {
        console.error('[PUMB] Invalid callback signature for order:', order_id);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const isSuccess = status === 'success' || status === 'paid';

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: isSuccess ? 'completed' : status,
        completed_at: isSuccess ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        metadata: { transaction_id, provider: 'pumb' },
      })
      .eq('order_id', order_id)
      .select('user_id, metadata')
      .single();

    if (paymentError) {
      console.error('[PUMB] Payment record not found:', order_id, paymentError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (isSuccess && payment?.user_id) {
      const parsedOrder = parseOrderId(order_id);
      const tierId = parsedOrder?.tierId || payment.metadata?.tier_id;

      if (tierId) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            membership_tier: tierId,
            role: 'full_member',
            membership_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.user_id);

        if (userError) {
          console.error('[PUMB][CRITICAL] User update failed:', userError);
          // Mark for manual review
          await supabase
            .from('payments')
            .update({
              status: 'pending_review',
              updated_at: new Date().toISOString(),
            })
            .eq('order_id', order_id);
          return NextResponse.json({ error: 'User update failed' }, { status: 500 });
        }

        // Award bonus points
        await supabase.rpc('increment_user_points', {
          user_id: payment.user_id,
          points_to_add: bonusPoints,
        }).then(({ error }) => {
          if (error) console.error('[PUMB] Points award failed:', error);
        });
      }
    }

    console.log('[PUMB] Callback processed:', { order_id, status, amount, currency });
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[PUMB] Callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
