import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SearchResponse } from '@/lib/help/types';

/**
 * POST /api/help/articles/search
 * Search help articles using PostgreSQL full-text search with Ukrainian language support
 * Body:
 *  - query: string (required)
 *  - categoryId: string (optional)
 *  - limit: number (optional, default: 20, max: 50)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { query, categoryId, limit = 20 } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchLimit = Math.min(limit, 50);

    // Use the PostgreSQL search function for ranked results
    const { data: searchResults, error } = await supabase
      .rpc('search_help_articles', {
        search_query: query.trim(),
        max_results: searchLimit,
      });

    if (error) {
      throw error;
    }

    // Filter by category if specified
    let results = searchResults || [];
    if (categoryId) {
      // Need to get category info to filter
      const { data: articles } = await supabase
        .from('help_articles')
        .select('id, category_id')
        .eq('category_id', categoryId)
        .eq('status', 'published');

      const articleIds = new Set(articles?.map(a => a.id) || []);
      results = results.filter((r: any) => articleIds.has(r.id));
    }

    const response: SearchResponse = {
      results: results.map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        slug: r.slug,
        categoryName: r.category_name,
        rank: r.rank,
      })),
      query: query.trim(),
      total: results.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[POST /api/help/articles/search]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/help/articles/search
 * Alternative GET method for search (query params)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use POST handler logic
    const supabase = await createClient();
    const searchLimit = Math.min(limit, 50);

    const { data: searchResults, error } = await supabase
      .rpc('search_help_articles', {
        search_query: query.trim(),
        max_results: searchLimit,
      });

    if (error) {
      throw error;
    }

    let results = searchResults || [];
    if (categoryId) {
      const { data: articles } = await supabase
        .from('help_articles')
        .select('id, category_id')
        .eq('category_id', categoryId)
        .eq('status', 'published');

      const articleIds = new Set(articles?.map(a => a.id) || []);
      results = results.filter((r: any) => articleIds.has(r.id));
    }

    const response: SearchResponse = {
      results: results.map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        slug: r.slug,
        categoryName: r.category_name,
        rank: r.rank,
      })),
      query: query.trim(),
      total: results.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/help/articles/search]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
