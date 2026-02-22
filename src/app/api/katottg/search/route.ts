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

// Map ISO 3166-2:UA codes → KATOTTG oblast code prefix (UA{XX})
// Most match by stripping the dash; exceptions listed explicitly.
const ISO_TO_KATOTTG_PREFIX: Record<string, string> = {
  'UA-05': 'UA05', // Вінницька
  'UA-07': 'UA07', // Волинська
  'UA-09': 'UA44', // Луганська  (ISO 09 ≠ KATOTTG 44)
  'UA-12': 'UA12', // Дніпропетровська
  'UA-14': 'UA14', // Донецька
  'UA-18': 'UA18', // Житомирська
  'UA-21': 'UA21', // Закарпатська
  'UA-23': 'UA23', // Запорізька
  'UA-26': 'UA26', // Івано-Франківська
  'UA-30': 'UA80', // Київ (місто)  (ISO 30 ≠ KATOTTG 80)
  'UA-32': 'UA32', // Київська
  'UA-35': 'UA35', // Кіровоградська
  'UA-40': 'UA85', // Севастополь   (ISO 40 ≠ KATOTTG 85)
  'UA-43': 'UA01', // АРК Крим      (ISO 43 ≠ KATOTTG 01)
  'UA-46': 'UA46', // Львівська
  'UA-48': 'UA48', // Миколаївська
  'UA-51': 'UA51', // Одеська
  'UA-53': 'UA53', // Полтавська
  'UA-56': 'UA56', // Рівненська
  'UA-59': 'UA59', // Сумська
  'UA-61': 'UA61', // Тернопільська
  'UA-63': 'UA63', // Харківська
  'UA-65': 'UA65', // Херсонська
  'UA-68': 'UA68', // Хмельницька
  'UA-71': 'UA71', // Черкаська
  'UA-74': 'UA74', // Чернігівська
  'UA-77': 'UA73', // Чернівецька   (ISO 77 ≠ KATOTTG 73)
};

/**
 * GET /api/katottg/search
 * Search KATOTTG settlements using trigram similarity
 * Query params:
 *  - q: string (required, min 2 chars)
 *  - limit: number (optional, default: 20, max: 50)
 *  - category: string (optional, filter by category: M, T, C, X)
 *  - oblastCode: string (optional, ISO 3166-2 or KATOTTG code to filter by oblast)
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
      // Convert ISO 3166-2 code (e.g. "UA-32") to KATOTTG prefix (e.g. "UA32")
      const katottgPrefix = ISO_TO_KATOTTG_PREFIX[oblastCode]
        ?? oblastCode.replace('-', ''); // fallback: strip dash
      dbQuery = dbQuery.ilike('oblast_code', `${katottgPrefix}%`);
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
