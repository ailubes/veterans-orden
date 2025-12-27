import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * GET /api/admin/help/tooltips
 * Get all tooltips with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }


    // Verify admin/leader role
    if (!profile || !['admin', 'leader', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const pageSlug = searchParams.get('pageSlug');
    const isActive = searchParams.get('isActive');

    // Build query
    let query = supabase
      .from('help_tooltips')
      .select(`
        *,
        article:help_articles(id, title, slug)
      `)
      .order('page_slug', { ascending: true })
      .order('element_id', { ascending: true });

    // Apply filters
    if (pageSlug) {
      query = query.eq('page_slug', pageSlug);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: tooltips, error: dbError } = await query;

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ tooltips: tooltips || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/help/tooltips
 * Create a new tooltip
 */
export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }


    // Verify admin/leader role
    if (!profile || !['admin', 'leader', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      pageSlug,
      elementId,
      content,
      articleId,
      audience,
      isActive,
    } = body;

    // Validate required fields
    if (!pageSlug || !elementId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: pageSlug, elementId, content' },
        { status: 400 }
      );
    }

    // Check if tooltip already exists for this page/element
    const { data: existingTooltip } = await supabase
      .from('help_tooltips')
      .select('id')
      .eq('page_slug', pageSlug)
      .eq('element_id', elementId)
      .single();

    if (existingTooltip) {
      return NextResponse.json(
        { error: 'Tooltip already exists for this page and element' },
        { status: 409 }
      );
    }

    // Create tooltip
    const { data: tooltip, error: dbError } = await supabase
      .from('help_tooltips')
      .insert({
        page_slug: pageSlug,
        element_id: elementId,
        content,
        article_id: articleId || null,
        audience: audience || 'all',
        is_active: isActive ?? true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ tooltip }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
