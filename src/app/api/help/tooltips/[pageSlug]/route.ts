import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * GET /api/help/tooltips/[pageSlug]
 * Get active tooltips for a specific page
 * Filters by user role (audience targeting)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageSlug: string }> }
) {
  try {
    const { pageSlug } = await params;

    // Get user role for audience filtering
    let userRole = 'all';
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);

    if (user && profile) {
      userRole = profile.role;
    }

    // Fetch active tooltips for this page
    // Filter by audience: show if audience is 'all' OR matches user role
    const { data: tooltips, error: dbError } = await supabase
      .from('help_tooltips')
      .select(`
        id,
        page_slug,
        element_id,
        content,
        article_id,
        audience,
        article:help_articles(id, title, slug)
      `)
      .eq('page_slug', pageSlug)
      .eq('is_active', true)
      .or(`audience.eq.all,audience.eq.${userRole === 'admin' ? 'admins' : userRole === 'leader' ? 'leaders' : 'members'}`)
      .order('element_id', { ascending: true });

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Transform to a map for easy lookup by elementId
    const tooltipsMap: Record<string, any> = {};
    (tooltips || []).forEach((tooltip) => {
      tooltipsMap[tooltip.element_id] = {
        id: tooltip.id,
        content: tooltip.content,
        article: tooltip.article,
      };
    });

    return NextResponse.json({ tooltips: tooltipsMap });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
