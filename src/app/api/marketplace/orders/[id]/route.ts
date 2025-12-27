import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { getOrderWithItems } from '@/lib/marketplace';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/marketplace/orders/[id]
 * Get order details with items
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: orderId } = await context.params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get order
    const order = await getOrderWithItems(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order belongs to user
    if (order.userId !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[GET /api/marketplace/orders/[id]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
