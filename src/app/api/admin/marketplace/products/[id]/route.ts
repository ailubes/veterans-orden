import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/marketplace/products/[id]
 * Get product by ID
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
        { error: 'Only admins can view products' },
        { status: 403 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[GET /api/admin/marketplace/products/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/marketplace/products/[id]
 * Update product
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
        { error: 'Only admins can update products' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if slug is being changed and if it's unique
    if (body.slug) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name;
    if (body.nameUk !== undefined) updates.name_uk = body.nameUk;
    if (body.description !== undefined) updates.description = body.description;
    if (body.descriptionUk !== undefined) updates.description_uk = body.descriptionUk;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.type !== undefined) updates.type = body.type;
    if (body.status !== undefined) updates.status = body.status;
    if (body.pricePoints !== undefined) updates.price_points = body.pricePoints;
    if (body.priceUah !== undefined) updates.price_uah = body.priceUah;
    if (body.stockQuantity !== undefined) updates.stock_quantity = body.stockQuantity;
    if (body.maxPerUser !== undefined) updates.max_per_user = body.maxPerUser;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.images !== undefined) updates.images = body.images;
    if (body.requiresShipping !== undefined) updates.requires_shipping = body.requiresShipping;
    if (body.weight !== undefined) updates.weight = body.weight;
    if (body.dimensions !== undefined) updates.dimensions = body.dimensions;
    if (body.digitalAssetUrl !== undefined) updates.digital_asset_url = body.digitalAssetUrl;
    if (body.downloadLimit !== undefined) updates.download_limit = body.downloadLimit;
    if (body.requiredLevel !== undefined) updates.required_level = body.requiredLevel;
    if (body.requiredRole !== undefined) updates.required_role = body.requiredRole;
    if (body.availableFrom !== undefined) updates.available_from = body.availableFrom;
    if (body.availableUntil !== undefined) updates.available_until = body.availableUntil;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
    if (body.tags !== undefined) updates.tags = body.tags;

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[PATCH /api/admin/marketplace/products/[id]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/marketplace/products/[id]
 * Delete product (soft delete by setting status to discontinued)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can delete products' },
        { status: 403 }
      );
    }

    // Check if product has orders
    const { count: orderCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id);

    if (orderCount && orderCount > 0) {
      // Soft delete - set to discontinued
      const { error } = await supabase
        .from('products')
        .update({
          status: 'discontinued',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        message: 'Product has orders, status set to discontinued',
        softDelete: true,
      });
    } else {
      // Hard delete if no orders
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        message: 'Product deleted successfully',
        softDelete: false,
      });
    }
  } catch (error) {
    console.error('[DELETE /api/admin/marketplace/products/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
