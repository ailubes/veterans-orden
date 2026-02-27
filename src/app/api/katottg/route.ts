import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    if (search.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search settlements (level 4 = city/town/village) in katottg
    const { data, error } = await supabase
      .from('katottg')
      .select('code, name, hromada_name, raion_name, oblast_name, full_path')
      .eq('level', 4)
      .ilike('name_normalized', `%${search.toLowerCase()}%`)
      .order('name')
      .limit(20);

    if (error) {
      console.error('Katottg search error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
