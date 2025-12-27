import { createClient } from '@/lib/supabase/server';
import { spendPoints, getUserBalance } from '@/lib/points';
import type { CreateOrderParams, OrderWithItems, CheckoutResult } from './types';

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-NNN
 */
async function generateOrderNumber(): Promise<string> {
  const supabase = await createClient();
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Get today's order count
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay);

  const orderNum = (count || 0) + 1;
  return `ORD-${dateStr}-${orderNum.toString().padStart(3, '0')}`;
}

/**
 * Create a new order and spend points
 */
export async function createOrder(params: CreateOrderParams): Promise<CheckoutResult> {
  const supabase = await createClient();
  const { userId, items, shippingAddress, customerNotes } = params;

  // Validate user has enough points
  const balance = await getUserBalance(userId);

  // Get products and validate
  const productIds = items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('status', 'active');

  if (productsError || !products || products.length !== productIds.length) {
    throw new Error('One or more products not found or unavailable');
  }

  // Calculate totals and validate stock
  let totalPoints = 0;
  let totalUah = 0;
  let requiresShipping = false;

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    // Check stock
    if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name_uk}`);
    }

    // Check max per user
    if (item.quantity > product.max_per_user) {
      throw new Error(`Maximum ${product.max_per_user} items allowed for ${product.name_uk}`);
    }

    // Check user level
    const pointsForItem = product.price_points * item.quantity;
    const uahForItem = (product.price_uah || 0) * item.quantity;

    totalPoints += pointsForItem;
    totalUah += uahForItem;

    if (product.requires_shipping) {
      requiresShipping = true;
    }

    return {
      product_id: product.id,
      quantity: item.quantity,
      price_points: product.price_points,
      price_uah: product.price_uah,
      product_name: product.name_uk,
      product_type: product.type,
      variant: item.variant || null,
    };
  });

  // Validate user has enough points
  if (balance.total < totalPoints) {
    throw new Error(`Insufficient points. You have ${balance.total}, need ${totalPoints}`);
  }

  // Validate shipping address if required
  if (requiresShipping && !shippingAddress && !params.novaPoshtaBranch) {
    throw new Error('Shipping address or Nova Poshta branch required');
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      status: 'pending',
      total_points: totalPoints,
      total_uah: totalUah,
      requires_shipping: requiresShipping,
      shipping_address: shippingAddress || null,
      nova_poshta_city: params.novaPoshtaCity || null,
      nova_poshta_city_ref: params.novaPoshtaCityRef || null,
      nova_poshta_branch: params.novaPoshtaBranch || null,
      nova_poshta_branch_ref: params.novaPoshtaBranchRef || null,
      customer_notes: customerNotes || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error('Failed to create order: ' + orderError?.message);
  }

  // Create order items
  const orderItemsWithOrderId = orderItemsData.map((item) => ({
    ...item,
    order_id: order.id,
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsWithOrderId)
    .select();

  if (itemsError || !createdItems) {
    // Rollback order
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error('Failed to create order items: ' + itemsError?.message);
  }

  // Spend points
  let pointsTransaction;
  try {
    pointsTransaction = await spendPoints({
      userId,
      amount: totalPoints,
      type: 'spend_marketplace',
      referenceType: 'order',
      referenceId: order.id,
      description: `Замовлення #${orderNumber}`,
      metadata: {
        orderNumber,
        itemCount: items.length,
      },
    });
  } catch (pointsError) {
    // Rollback order and items
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    throw pointsError;
  }

  // Update product stock
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (product && product.stock_quantity !== null) {
      await supabase
        .from('products')
        .update({
          stock_quantity: product.stock_quantity - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);
    }
  }

  // Return complete order with items
  return {
    order: {
      ...order,
      items: createdItems.map((item) => ({
        ...item,
        createdAt: item.created_at,
      })),
    },
    pointsTransaction: {
      id: pointsTransaction.id,
      amount: pointsTransaction.amount,
      balanceAfter: pointsTransaction.balanceAfter,
    },
  };
}

/**
 * Get order with items
 */
export async function getOrderWithItems(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  return {
    ...order,
    items: items || [],
  };
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<OrderWithItems[]> {
  const { limit = 20, offset = 0 } = options;
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error('Failed to fetch orders: ' + error.message);
  }

  return (orders || []).map((order) => ({
    ...order,
    items: order.order_items || [],
  }));
}

/**
 * Cancel order and refund points
 */
export async function cancelOrder(orderId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found');
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled');
  }

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  // Note: Points refund would be handled separately through admin interface
  // or automatically via a refund transaction
}
