import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import type { CreateProductParams, UpdateProductParams } from '@/lib/marketplace/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/marketplace/products
 * Get all products (including drafts) with filters
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
        { error: 'Only admins can manage products' },
        { status: 403 }
      );
    }

    // Parse filters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/marketplace/products]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/marketplace/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can create products' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.nameUk || !body.slug || !body.type || body.pricePoints === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        name_uk: body.nameUk,
        description: body.description || null,
        description_uk: body.descriptionUk || null,
        slug: body.slug,
        type: body.type,
        status: body.status || 'draft',
        price_points: body.pricePoints,
        price_uah: body.priceUah || null,
        stock_quantity: body.stockQuantity || null,
        max_per_user: body.maxPerUser || 1,
        image_url: body.imageUrl || null,
        images: body.images || null,
        requires_shipping: body.requiresShipping || false,
        weight: body.weight || null,
        dimensions: body.dimensions || null,
        digital_asset_url: body.digitalAssetUrl || null,
        download_limit: body.downloadLimit || null,
        required_level: body.requiredLevel || 1,
        required_role: body.requiredRole || null,
        available_from: body.availableFrom || null,
        available_until: body.availableUntil || null,
        featured: body.featured || false,
        sort_order: body.sortOrder || 0,
        tags: body.tags || null,
        created_by_id: adminProfile.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/marketplace/products]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
