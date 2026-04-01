import { NextResponse } from 'next/server';
import { createHutkoToken } from '@/lib/payments/hutko';
import { getHutkoConfig } from '@/lib/payments/hutko-config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
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

    const hutkoConfig = await getHutkoConfig();

    if (!hutkoConfig.enabled || !hutkoConfig.merchantId || !hutkoConfig.secretKey) {
      return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
    }

    const orderId = generateDonationOrderId(amount);
    const amountKopiyki = Math.round(amount * 100);

    await db.execute(sql`
      INSERT INTO payments (
        type,
        amount,
        currency,
        provider,
        provider_transaction_id,
        status,
        provider_data
      ) VALUES (
        'donation'::payment_type,
        ${amount},
        'UAH',
        'hutko'::payment_provider,
        ${orderId},
        'pending'::payment_status,
        ${JSON.stringify({ source: 'public_support_page' })}::jsonb
      )
    `);

    const { token: hutkoToken, checkoutUrl } = await createHutkoToken(
      { merchantId: Number(hutkoConfig.merchantId), secretKey: hutkoConfig.secretKey },
      {
        orderId,
        orderDesc: 'Підтримка Ордену Ветеранів',
        amount: amountKopiyki,
        currency: 'UAH',
        serverCallbackUrl: `${hutkoConfig.baseUrl}/api/payments/hutko-callback`,
        responseUrl: `${hutkoConfig.baseUrl}/?donate=success`,
        requiredRectoken: 'N',
      }
    );

    return NextResponse.json({ hutkoToken, checkoutUrl, orderId, amount });
  } catch (error) {
    console.error('Donate payment error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
