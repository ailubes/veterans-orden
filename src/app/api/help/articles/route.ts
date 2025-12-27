import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ArticlesListResponse } from '@/lib/help/types';

/**
 * GET /api/help/articles
 * Get list of published help articles with filters
 * Query params:
 *  - categoryId: UUID filter by category
 *  - audience: 'all' | 'members' | 'leaders' | 'admins'
 *  - limit: number (default: 20, max: 100)
 *  - offset: number (default: 0)
 *  - search: text search in title/content
 *  - featured: boolean
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const categoryId = searchParams.get('categoryId');
    const audience = searchParams.get('audience');
    const featured = searchParams.get('featured') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query - only published articles
    let query = supabase
      .from('help_articles')
      .select(`
        *,
        category:help_categories!inner(
          id,
          name_uk,
          name_en,
          slug,
          icon
        ),
        author:users!help_articles_author_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (audience && audience !== 'all') {
      query = query.in('audience', ['all', audience]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }

    const response: ArticlesListResponse = {
      articles: articles || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/help/articles]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
