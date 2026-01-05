import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createLiqPayData, createLiqPaySignature, generateOrderId, type LiqPayConfig } from '@/lib/liqpay';
import { MEMBERSHIP_TIERS } from '@/lib/constants';
import { parsePaymentSettings } from '@/lib/settings/parser';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch payment settings from organization_settings
    const { data: settings, error: settingsError } = await supabase
      .from('organization_settings')
      .select('key, value')
      .in('key', [
        'payment_liqpay_enabled',
        'payment_liqpay_public_key',
        'payment_liqpay_private_key',
        'payment_liqpay_sandbox_mode',
        'payment_currency',
      ]);

    if (settingsError) {
      console.error('Error fetching payment settings:', settingsError);
      return NextResponse.json(
        { error: 'Payment system configuration error' },
        { status: 500 }
      );
    }

    // Parse payment settings with type safety
    const settingsMap = new Map(settings?.map((s) => [s.key, s.value]) || []);
    const paymentSettings = parsePaymentSettings(settingsMap);

    // Validate payment system is configured
    if (!paymentSettings.payment_liqpay_enabled) {
      return NextResponse.json(
        { error: 'Payment system is currently disabled' },
        { status: 503 }
      );
    }

    if (!paymentSettings.payment_liqpay_public_key || !paymentSettings.payment_liqpay_private_key) {
      console.error('LiqPay keys not configured');
      return NextResponse.json(
        { error: 'Payment system is not properly configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const { tierId } = await request.json();

    // Validate tier
    const tier = MEMBERSHIP_TIERS[tierId as keyof typeof MEMBERSHIP_TIERS];
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const orderId = generateOrderId(profile.id, tierId);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://merezha.org.ua';

    // Create payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: profile.id,
      order_id: orderId,
      amount: tier.price,
      currency: paymentSettings.payment_currency,
      status: 'pending',
      payment_type: 'membership',
      metadata: {
        tier_id: tierId,
        tier_name: tier.name,
      },
    });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
      throw paymentError;
    }

    // Build LiqPay config from database settings
    const liqpayConfig: LiqPayConfig = {
      publicKey: paymentSettings.payment_liqpay_public_key,
      privateKey: paymentSettings.payment_liqpay_private_key,
      currency: paymentSettings.payment_currency,
      sandboxMode: paymentSettings.payment_liqpay_sandbox_mode,
    };

    // Create LiqPay data
    const data = createLiqPayData({
      action: 'pay',
      amount: tier.price,
      description: `Членство в Мережі Вільних Людей: ${tier.name}`,
      order_id: orderId,
      result_url: `${baseUrl}/dashboard/settings?payment=success`,
      server_url: `${baseUrl}/api/payments/callback`,
    }, liqpayConfig);

    const signature = createLiqPaySignature(data, paymentSettings.payment_liqpay_private_key);

    return NextResponse.json({
      data,
      signature,
      checkoutUrl: 'https://www.liqpay.ua/api/3/checkout',
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
