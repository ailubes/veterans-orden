import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface OblastResult {
  code: string;
  name: string;
  category: string;
}

export interface OblastsResponse {
  oblasts: OblastResult[];
  total: number;
}

/**
 * GET /api/katottg/oblasts
 * List all Ukrainian oblasts (regions) for filtering and election purposes
 * Returns both regular oblasts (category O) and special cities (category K like Kyiv)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get all oblasts (category O) and special cities (category K)
    const { data, error } = await supabase
      .from('katottg')
      .select('code, name, category')
      .in('category', ['O', 'K'])
      .eq('level', 1)
      .order('name', { ascending: true });

    if (error) {
      console.error('[GET /api/katottg/oblasts] Database error:', error);
      throw error;
    }

    const oblasts: OblastResult[] = (data || []).map((row: Record<string, unknown>) => ({
      code: row.code as string,
      name: row.name as string,
      category: row.category as string,
    }));

    // Sort with special cities (K) first, then oblasts alphabetically
    oblasts.sort((a, b) => {
      // Kyiv and Sevastopol first
      if (a.category === 'K' && b.category !== 'K') return -1;
      if (a.category !== 'K' && b.category === 'K') return 1;
      return a.name.localeCompare(b.name, 'uk');
    });

    const response: OblastsResponse = {
      oblasts,
      total: oblasts.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/katottg/oblasts]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
