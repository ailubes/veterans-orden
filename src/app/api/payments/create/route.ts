import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLiqPayData, createLiqPaySignature, generateOrderId } from '@/lib/liqpay';
import { MEMBERSHIP_TIERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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
      currency: 'UAH',
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

    // Create LiqPay data
    const data = createLiqPayData({
      action: 'pay',
      amount: tier.price,
      description: `Членство в Мережі Вільних Людей: ${tier.name}`,
      order_id: orderId,
      result_url: `${baseUrl}/dashboard/settings?payment=success`,
      server_url: `${baseUrl}/api/payments/callback`,
    });

    const signature = createLiqPaySignature(data);

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
