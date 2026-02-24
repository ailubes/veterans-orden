import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['jobs', 'legal', 'support', 'healthcare'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    if (!VALID_CATEGORIES.includes(category as any)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('veteran_resources')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('title', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resources: data || [], category });
  } catch (error) {
    console.error('Resources category API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
