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
    console.error('[GET /api/marketplace/products]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
