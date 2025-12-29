import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface KatottgDetails {
  code: string;
  name: string;
  category: string;
  categoryName: string;
  level: number;
  oblastCode: string | null;
  raionCode: string | null;
  hromadaCode: string | null;
  oblastName: string | null;
  raionName: string | null;
  hromadaName: string | null;
  fullPath: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  'O': 'Область',
  'K': 'Місто спеціального статусу',
  'P': 'Район',
  'B': 'Район міста',
  'H': 'Громада',
  'M': 'Місто',
  'T': 'Селище міського типу',
  'C': 'Село',
  'X': 'Селище',
};

/**
 * GET /api/katottg/[code]
 * Get details for a specific KATOTTG code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length < 10) {
      return NextResponse.json(
        { error: 'Invalid KATOTTG code' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('katottg')
      .select('code, name, category, level, oblast_code, raion_code, hromada_code, oblast_name, raion_name, hromada_name, full_path')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'KATOTTG code not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    const result: KatottgDetails = {
      code: data.code,
      name: data.name,
      category: data.category,
      categoryName: CATEGORY_NAMES[data.category] || data.category,
      level: data.level,
      oblastCode: data.oblast_code,
      raionCode: data.raion_code,
      hromadaCode: data.hromada_code,
      oblastName: data.oblast_name,
      raionName: data.raion_name,
      hromadaName: data.hromada_name,
      fullPath: data.full_path,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/katottg/[code]]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
