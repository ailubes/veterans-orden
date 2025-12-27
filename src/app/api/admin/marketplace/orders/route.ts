import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/marketplace/orders
 * Get all orders with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can view orders' },
        { status: 403 }
      );
    }

    // Parse filters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('orders')
      .select('*, order_items(*), users!inner(first_name, last_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/marketplace/orders]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
