import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface KatottgSearchResult {
  code: string;
  name: string;
  category: string;
  level: number;
  oblastCode: string | null;
  raionCode: string | null;
  hromadaCode: string | null;
  oblastName: string | null;
  raionName: string | null;
  hromadaName: string | null;
  fullPath: string;
}

export interface KatottgSearchResponse {
  results: KatottgSearchResult[];
  query: string;
  total: number;
}

/**
 * GET /api/katottg/search
 * Search KATOTTG settlements using trigram similarity
 * Query params:
 *  - q: string (required, min 2 chars)
 *  - limit: number (optional, default: 20, max: 50)
 *  - category: string (optional, filter by category: M, T, C, X)
 *  - oblastCode: string (optional, filter by oblast)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');
    const oblastCode = searchParams.get('oblastCode');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const normalizedQuery = query
      .toLowerCase()
      .replace(/['ʼ`']/g, '')
      .trim();

    // Build the query
    let dbQuery = supabase
      .from('katottg')
      .select('code, name, category, level, oblast_code, raion_code, hromada_code, oblast_name, raion_name, hromada_name, full_path, name_normalized')
      .or(`name_normalized.ilike.%${normalizedQuery}%,name.ilike.%${query.trim()}%`)
      .order('level', { ascending: false }) // Prioritize settlements (level 4)
      .order('name', { ascending: true })
      .limit(limit);

    // Filter to settlements only by default (categories M, T, C, X)
    if (category) {
      dbQuery = dbQuery.eq('category', category);
    } else {
      // Default: only settlements
      dbQuery = dbQuery.in('category', ['M', 'T', 'C', 'X']);
    }

    // Filter by oblast if specified
    if (oblastCode) {
      dbQuery = dbQuery.eq('oblast_code', oblastCode);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('[GET /api/katottg/search] Database error:', error);
      throw error;
    }

    // Sort results: exact matches first, then by similarity
    const results: KatottgSearchResult[] = (data || [])
      .map((row: Record<string, unknown>) => ({
        code: row.code as string,
        name: row.name as string,
        category: row.category as string,
        level: row.level as number,
        oblastCode: row.oblast_code as string | null,
        raionCode: row.raion_code as string | null,
        hromadaCode: row.hromada_code as string | null,
        oblastName: row.oblast_name as string | null,
        raionName: row.raion_name as string | null,
        hromadaName: row.hromada_name as string | null,
        fullPath: row.full_path as string,
      }))
      .sort((a: KatottgSearchResult, b: KatottgSearchResult) => {
        // Exact name match first
        const aExact = a.name.toLowerCase() === query.toLowerCase();
        const bExact = b.name.toLowerCase() === query.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then starts with query
        const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
        const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then by name
        return a.name.localeCompare(b.name, 'uk');
      });

    const response: KatottgSearchResponse = {
      results,
      query: query.trim(),
      total: results.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/katottg/search]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
