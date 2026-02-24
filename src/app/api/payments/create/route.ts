import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { generateOrderId } from '@/lib/liqpay';
import { MEMBERSHIP_TIERS } from '@/lib/constants';
import { createHutkoToken } from '@/lib/payments/hutko';
import { parseSettingValue } from '@/lib/settings/parser';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse + validate tier before any settings fetch
    const body = await request.json();
    const { tierId, isAnnual = false } = body;

    const tier = MEMBERSHIP_TIERS[tierId as keyof typeof MEMBERSHIP_TIERS];
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const monthlyAmount = tier.price;
    const amount = isAnnual ? monthlyAmount * 10 : monthlyAmount;
    const orderId = generateOrderId(profile.id, tierId);

    // Always create a pending payment record first
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: profile.id,
      type: 'membership',
      amount,
      currency: 'UAH',
      membership_tier: tierId,
      provider: 'hutko',
      provider_transaction_id: orderId,
      status: 'pending',
      provider_data: {
        tier_name: tier.name,
        is_annual: isAnnual,
      },
    });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      throw paymentError;
    }

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

    if (hutkoEnabled && hutkoMerchantId && hutkoSecretKey) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ordenv.org';

      // Amount in kopiyki (UAH × 100)
      const amountKopiyki = Math.round(amount * 100);

      try {
        const hutkoToken = await createHutkoToken(
          { merchantId: Number(hutkoMerchantId), secretKey: hutkoSecretKey },
          {
            orderId,
            orderDesc: `Членство в Ордені Ветеранів: ${tier.name}`,
            amount: amountKopiyki,
            currency: 'UAH',
            serverCallbackUrl: `${baseUrl}/api/payments/hutko-callback`,
          }
        );

        return NextResponse.json({ hutkoToken, orderId, isAnnual, amount });
      } catch (hutkoError) {
        console.error('HUTKO token creation failed:', hutkoError);
        // Fall through to payLater response so the user isn't blocked
      }
    }

    // HUTKO not configured (or token creation failed) — pay later
    return NextResponse.json({ success: true, payLater: true, orderId });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
