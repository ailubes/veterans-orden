import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

/**
 * GET /api/navigation
 * Get navigation items from published pages
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: pages, error } = await supabase
      .from('pages')
      .select('slug, title, nav_label, parent_slug, sort_order')
      .eq('status', 'published')
      .eq('show_in_nav', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[Navigation API] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 });
    }

    // Transform to navigation format
    const navItems = (pages || []).map((page) => ({
      href: `/${page.slug}`,
      label: page.nav_label || page.title.toUpperCase(),
      parentSlug: page.parent_slug,
      sortOrder: page.sort_order,
    }));

    return NextResponse.json({
      items: navItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Navigation API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
