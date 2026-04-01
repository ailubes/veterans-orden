import { NextRequest, NextResponse } from 'next/server';
import { getPaymentsAdminProfileFromRequest } from '@/lib/permissions';
import { createServiceClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await getPaymentsAdminProfileFromRequest(request);

    const { id } = await context.params;
    const supabase = createServiceClient();

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        id,
        user_id,
        type,
        amount,
        currency,
        membership_tier,
        provider,
        provider_transaction_id,
        provider_data,
        status,
        created_at,
        completed_at,
        period_start,
        period_end,
        users (
          id,
          first_name,
          last_name,
          email,
          phone,
          membership_tier,
          membership_role,
          staff_role
        )
      `)
      .eq('id', id)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[GET /api/admin/payments/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
