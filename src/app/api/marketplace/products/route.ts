import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/marketplace/products
 * Get list of active marketplace products with filters
 * Query params:
 *  - type: product_type filter (physical, digital, event_ticket)
 *  - featured: boolean
 *  - limit: number (default: 50, max: 100)
 *  - offset: number (default: 0)
 *  - search: text search in name/description
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const type = searchParams.get('type');
    const featured = searchParams.get('featured') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_uk.ilike.%${search}%,description.ilike.%${search}%,description_uk.ilike.%${search}%`);
    }

    // Check availability dates
    const now = new Date().toISOString();
    query = query.or(`available_from.is.null,available_from.lte.${now}`);
    query = query.or(`available_until.is.null,available_until.gte.${now}`);

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform snake_case to camelCase for frontend
    const transformedProducts = (products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      nameUk: p.name_uk,
      description: p.description,
      descriptionUk: p.description_uk,
      slug: p.slug,
      type: p.type,
      status: p.status,
      pricePoints: p.price_points,
      priceUah: p.price_uah,
      stockQuantity: p.stock_quantity,
      maxPerUser: p.max_per_user,
      imageUrl: p.image_url,
      images: p.images,
      requiresShipping: p.requires_shipping,
      weight: p.weight,
      dimensions: p.dimensions,
      digitalAssetUrl: p.digital_asset_url,
      downloadLimit: p.download_limit,
      requiredLevel: p.required_level,
      requiredRole: p.required_role,
      availableFrom: p.available_from,
      availableUntil: p.available_until,
      featured: p.featured,
      sortOrder: p.sort_order,
      tags: p.tags,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      createdById: p.created_by_id,
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[GET /api/marketplace/products]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
