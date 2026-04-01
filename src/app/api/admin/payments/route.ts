import { NextRequest, NextResponse } from 'next/server';
import { getPaymentsAdminProfileFromRequest } from '@/lib/permissions';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await getPaymentsAdminProfileFromRequest(request);

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const provider = searchParams.get('provider');
    const query = searchParams.get('query');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    let paymentsQuery = supabase
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
        users (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      paymentsQuery = paymentsQuery.eq('status', status);
    }

    if (type && type !== 'all') {
      paymentsQuery = paymentsQuery.eq('type', type);
    }

    if (provider && provider !== 'all') {
      paymentsQuery = paymentsQuery.eq('provider', provider);
    }

    if (query) {
      paymentsQuery = paymentsQuery.ilike('provider_transaction_id', `%${query}%`);
    }

    const { data: payments, error, count } = await paymentsQuery;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      payments: payments || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[GET /api/admin/payments]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
