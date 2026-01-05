import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createOrder } from '@/lib/marketplace';
import type { CreateOrderParams } from '@/lib/marketplace/types';

/**
 * POST /api/marketplace/checkout
 * Create order and spend points
 * Body: {
 *   items: [{ productId, quantity, variant? }],
 *   shippingAddress?: { fullName, phone, street, city, oblast, postalCode },
 *   novaPoshtaCity?, novaPoshtaCityRef?, novaPoshtaBranch?, novaPoshtaBranchRef?,
 *   customerNotes?
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id, points, level')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const {
      items,
      shippingAddress,
      novaPoshtaCity,
      novaPoshtaCityRef,
      novaPoshtaBranch,
      novaPoshtaBranchRef,
      customerNotes,
    } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid item in cart' },
          { status: 400 }
        );
      }
    }

    // Create order
    const orderParams: CreateOrderParams = {
      userId: profile.id,
      items,
      shippingAddress,
      novaPoshtaCity,
      novaPoshtaCityRef,
      novaPoshtaBranch,
      novaPoshtaBranchRef,
      customerNotes,
    };

    const result = await createOrder(orderParams);

    return NextResponse.json({
      success: true,
      order: result.order,
      pointsTransaction: result.pointsTransaction,
      message: `Замовлення #${result.order.orderNumber} створено успішно!`,
    });
  } catch (error) {
    console.error('[POST /api/marketplace/checkout]', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Insufficient points')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Maximum') && error.message.includes('items allowed')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Shipping address') || error.message.includes('required')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
