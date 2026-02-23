import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHutkoRecurringCharge } from '@/lib/payments/hutko';
import { parseSettingValue } from '@/lib/settings/parser';
import { generateOrderId } from '@/lib/liqpay';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Auth: verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch HUTKO settings
  const { data: settings } = await supabase
    .from('organization_settings')
    .select('key, value')
    .in('key', [
      'payment_hutko_enabled',
      'payment_hutko_merchant_id',
      'payment_hutko_secret_key',
    ]);

  const settingsMap = new Map((settings || []).map((s) => [s.key, s.value]));
  const hutkoEnabled = parseSettingValue<boolean>(settingsMap.get('payment_hutko_enabled'), 'boolean');
  const hutkoMerchantId = parseSettingValue<string>(settingsMap.get('payment_hutko_merchant_id'), 'string');
  const hutkoSecretKey = parseSettingValue<string>(settingsMap.get('payment_hutko_secret_key'), 'string');

  if (!hutkoEnabled || !hutkoMerchantId || !hutkoSecretKey) {
    return NextResponse.json({ skipped: true, reason: 'HUTKO not configured' });
  }

  const config = { merchantId: Number(hutkoMerchantId), secretKey: hutkoSecretKey };
  const now = new Date();

  // ── Step 1: Charge members whose membership expires within 5 days ──────────
  // membership_paid_until < now + 5 days AND status = 'active' AND paid tier

  const chargeWindow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const paidTiers = ['basic_49', 'supporter_100', 'supporter_200', 'patron_500'];

  const { data: dueMembers, error: dueMembersError } = await supabase
    .from('users')
    .select('id, membership_tier')
    .eq('status', 'active')
    .in('membership_tier', paidTiers)
    .lt('membership_paid_until', chargeWindow)
    .gte('membership_paid_until', now.toISOString()); // not yet expired

  if (dueMembersError) {
    console.error('Billing cron: failed to fetch due members', dueMembersError);
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 });
  }

  let charged = 0;
  let failed = 0;

  for (const member of dueMembers ?? []) {
    // Get most recent completed HUTKO payment with a rectoken
    const { data: lastPayment } = await supabase
      .from('payments')
      .select('id, membership_tier, amount, provider_data')
      .eq('user_id', member.id)
      .eq('status', 'completed')
      .eq('provider', 'hutko')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    const rectoken = (lastPayment?.provider_data as Record<string, unknown>)?.rectoken as string | undefined;

    if (!rectoken) {
      console.warn(`Billing cron: no rectoken for user ${member.id}, skipping`);
      continue;
    }

    const providerData = lastPayment?.provider_data as Record<string, unknown>;
    const wasAnnual = providerData?.is_annual === true;
    const tierPrices: Record<string, number> = {
      basic_49: 49,
      supporter_100: 100,
      supporter_200: 200,
      patron_500: 500,
    };
    const monthlyPrice = tierPrices[member.membership_tier] ?? 0;
    const renewAmount = wasAnnual ? monthlyPrice * 10 : monthlyPrice;
    const amountKopiyki = Math.round(renewAmount * 100);

    const orderId = generateOrderId(member.id, `${member.membership_tier}-renewal`);
    const periodEnd = new Date(now);
    if (wasAnnual) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Insert pending payment record
    const { data: newPayment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: member.id,
        type: 'membership',
        amount: renewAmount,
        currency: 'UAH',
        membership_tier: member.membership_tier,
        provider: 'hutko',
        provider_transaction_id: orderId,
        status: 'pending',
        provider_data: {
          is_annual: wasAnnual,
          is_renewal: true,
          tier_name: member.membership_tier,
        },
      })
      .select('id')
      .single();

    if (insertError || !newPayment) {
      console.error(`Billing cron: failed to insert payment for user ${member.id}`, insertError);
      failed++;
      continue;
    }

    // Attempt recurring charge
    const result = await createHutkoRecurringCharge(config, {
      orderId,
      orderDesc: `Поновлення членства в Ордені Ветеранів`,
      amount: amountKopiyki,
      currency: 'UAH',
      rectoken,
    });

    if (result.success) {
      // Update payment as completed, set period dates
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: now.toISOString(),
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
          provider_data: {
            is_annual: wasAnnual,
            is_renewal: true,
            tier_name: member.membership_tier,
            hutko_payment_id: result.paymentId,
          },
        })
        .eq('id', newPayment.id);

      // Extend membership_paid_until
      await supabase
        .from('users')
        .update({
          membership_paid_until: periodEnd.toISOString(),
          status: 'active',
          updated_at: now.toISOString(),
        })
        .eq('id', member.id);

      console.log(`Billing cron: charged user ${member.id} — ${renewAmount} UAH, paid until ${periodEnd.toISOString()}`);
      charged++;
    } else {
      // Mark payment as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          provider_data: {
            is_annual: wasAnnual,
            is_renewal: true,
            tier_name: member.membership_tier,
            error_message: result.errorMessage,
          },
        })
        .eq('id', newPayment.id);

      console.error(`Billing cron: charge failed for user ${member.id}: ${result.errorMessage}`);
      failed++;
    }
  }

  // ── Step 2: Suspend members past the grace period (3 days after expiry) ────
  // membership_paid_until < now - 3 days AND status = 'active' AND paid tier

  const graceExpired = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: overdueMembers, error: overdueError } = await supabase
    .from('users')
    .select('id')
    .eq('status', 'active')
    .in('membership_tier', paidTiers)
    .lt('membership_paid_until', graceExpired);

  if (overdueError) {
    console.error('Billing cron: failed to fetch overdue members', overdueError);
  }

  let suspended = 0;

  for (const member of overdueMembers ?? []) {
    const { error: suspendError } = await supabase
      .from('users')
      .update({ status: 'suspended', updated_at: now.toISOString() })
      .eq('id', member.id);

    if (suspendError) {
      console.error(`Billing cron: failed to suspend user ${member.id}`, suspendError);
    } else {
      console.log(`Billing cron: suspended user ${member.id} (membership expired)`);
      suspended++;
    }
  }

  return NextResponse.json({ ok: true, charged, failed, suspended });
}
