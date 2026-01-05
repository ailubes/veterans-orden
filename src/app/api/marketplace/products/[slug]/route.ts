import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/marketplace/products/[slug]
 * Get product details by slug
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = await createClient();

    // Get product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check availability
    const now = new Date();
    if (product.available_from && new Date(product.available_from) > now) {
      return NextResponse.json({ error: 'Product not yet available' }, { status: 404 });
    }
    if (product.available_until && new Date(product.available_until) < now) {
      return NextResponse.json({ error: 'Product no longer available' }, { status: 404 });
    }

    // Get user's purchase count if authenticated
    let userPurchaseCount = 0;
    const { user } = await getAuthenticatedUser(request);

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (profile) {
        // Count how many of this product the user has ordered
        const { data: userOrders } = await supabase
          .from('order_items')
          .select('quantity, orders!inner(user_id, status)')
          .eq('product_id', product.id)
          .eq('orders.user_id', profile.id)
          .in('orders.status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered']);

        if (userOrders) {
          userPurchaseCount = userOrders.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }
      }
    }

    // Transform snake_case to camelCase for frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      nameUk: product.name_uk,
      description: product.description,
      descriptionUk: product.description_uk,
      slug: product.slug,
      type: product.type,
      status: product.status,
      pricePoints: product.price_points,
      priceUah: product.price_uah,
      stockQuantity: product.stock_quantity,
      maxPerUser: product.max_per_user,
      imageUrl: product.image_url,
      images: product.images,
      requiresShipping: product.requires_shipping,
      weight: product.weight,
      dimensions: product.dimensions,
      digitalAssetUrl: product.digital_asset_url,
      downloadLimit: product.download_limit,
      requiredLevel: product.required_level,
      requiredRole: product.required_role,
      availableFrom: product.available_from,
      availableUntil: product.available_until,
      featured: product.featured,
      sortOrder: product.sort_order,
      tags: product.tags,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      createdById: product.created_by_id,
    };

    return NextResponse.json({
      product: transformedProduct,
      userPurchaseCount,
      canPurchase: product.max_per_user > userPurchaseCount,
      remainingQuantity: product.max_per_user - userPurchaseCount,
    });
  } catch (error) {
    console.error('[GET /api/marketplace/products/[slug]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
