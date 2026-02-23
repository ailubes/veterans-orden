import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  console.log('HUTKO chargeback:', JSON.stringify(body));

  const supabase = createServiceClient();
  const orderId = body.order_id as string | undefined;

  if (orderId) {
    const { data: payment } = await supabase
      .from('payments')
      .select('id, user_id')
      .eq('provider_transaction_id', orderId)
      .single();

    if (payment) {
      await supabase
        .from('payments')
        .update({ status: 'chargeback', provider_data: { ...body } })
        .eq('id', payment.id);

      await supabase
        .from('users')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', payment.user_id);

      console.log(`HUTKO chargeback: suspended user ${payment.user_id} for order ${orderId}`);
    } else {
      console.warn(`HUTKO chargeback: no payment found for order_id ${orderId}`);
    }
  }

  return new Response('OK', { status: 200 });
}
