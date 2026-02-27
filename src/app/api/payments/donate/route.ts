import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHutkoToken } from '@/lib/payments/hutko';
import { parseSettingValue } from '@/lib/settings/parser';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function generateDonationOrderId(amount: number): string {
  const ts = Date.now();
  const rand = crypto.randomBytes(4).toString('hex');
  return `don_${amount}_${ts}_${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount < 10 || amount > 50000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
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
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    const orderId = generateDonationOrderId(amount);
    const amountKopiyki = Math.round(amount * 100);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ordenv.org';

    // Record donation payment
    await supabase.from('payments').insert({
      type: 'donation',
      amount,
      currency: 'UAH',
      provider: 'hutko',
      provider_transaction_id: orderId,
      status: 'pending',
      provider_data: { type: 'donation' },
    });

    const hutkoToken = await createHutkoToken(
      { merchantId: Number(hutkoMerchantId), secretKey: hutkoSecretKey },
      {
        orderId,
        orderDesc: 'Підтримка Ордену Ветеранів',
        amount: amountKopiyki,
        currency: 'UAH',
        serverCallbackUrl: `${baseUrl}/api/payments/hutko-callback`,
        requiredRectoken: 'N',
      }
    );

    return NextResponse.json({ hutkoToken, orderId, amount });
  } catch (error) {
    console.error('Donate payment error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
