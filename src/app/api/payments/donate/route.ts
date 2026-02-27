import { NextResponse } from 'next/server';
import { createHutkoToken } from '@/lib/payments/hutko';
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

    const hutkoMerchantId = process.env.HUTKO_MERCHANT_ID;
    const hutkoSecretKey = process.env.HUTKO_SECRET_KEY;

    if (!hutkoMerchantId || !hutkoSecretKey) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    const orderId = generateDonationOrderId(amount);
    const amountKopiyki = Math.round(amount * 100);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ordenv.org';

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
