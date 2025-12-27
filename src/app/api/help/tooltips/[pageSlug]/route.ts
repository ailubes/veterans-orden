import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/db/supabase-server';

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
    const supabase = await createClient();

    // Get user role for audience filtering
    let userRole = 'all';
    const { userId } = await auth();

    if (userId) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', userId)
        .single();

      if (userData) {
        userRole = userData.role;
      }
    }

    // Fetch active tooltips for this page
    // Filter by audience: show if audience is 'all' OR matches user role
    const { data: tooltips, error } = await supabase
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

    if (error) {
      console.error('[Get Tooltips] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    console.error('[Get Tooltips] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
