import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('news_articles')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    // Exclude current article when editing
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    // If no data found, slug is unique
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({ unique: true });
    }

    // If data exists, slug is not unique
    return NextResponse.json({ unique: !data });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
