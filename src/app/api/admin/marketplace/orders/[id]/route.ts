import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { awardPoints } from '@/lib/points';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/marketplace/orders/[id]
 * Get order details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), users!inner(id, first_name, last_name, email, phone)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[GET /api/admin/marketplace/orders/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/marketplace/orders/[id]
 * Update order status, tracking, etc.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can update orders' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      updates.status = body.status;

      // Set timestamps based on status
      if (body.status === 'shipped' && !body.shippedAt) {
        updates.shipped_at = new Date().toISOString();
      }
      if (body.status === 'delivered' && !body.deliveredAt) {
        updates.delivered_at = new Date().toISOString();
      }
      if (body.status === 'cancelled' && !body.cancelledAt) {
        updates.cancelled_at = new Date().toISOString();
      }
      if (body.status === 'refunded' && !body.refundedAt) {
        updates.refunded_at = new Date().toISOString();
      }
    }

    if (body.trackingNumber !== undefined) updates.tracking_number = body.trackingNumber;
    if (body.shippedAt !== undefined) updates.shipped_at = body.shippedAt;
    if (body.deliveredAt !== undefined) updates.delivered_at = body.deliveredAt;
    if (body.adminNotes !== undefined) updates.admin_notes = body.adminNotes;

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      throw error;
    }

    // If refunding, award points back to user
    if (body.status === 'refunded' && order) {
      try {
        await awardPoints({
          userId: order.user_id,
          amount: order.total_points,
          type: 'refund',
          referenceType: 'order',
          referenceId: order.id,
          description: `Повернення коштів за замовленням #${order.order_number}`,
          createdById: adminProfile.id,
        });

        // Restore stock if products still exist
        for (const item of order.order_items || []) {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (product && product.stock_quantity !== null) {
            await supabase
              .from('products')
              .update({
                stock_quantity: product.stock_quantity + item.quantity,
                updated_at: new Date().toISOString(),
              })
              .eq('id', item.product_id);
          }
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // Continue even if refund fails
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[PATCH /api/admin/marketplace/orders/[id]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
