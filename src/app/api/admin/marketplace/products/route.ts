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

    return NextResponse.json({ product: transformedProduct }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/marketplace/products]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
