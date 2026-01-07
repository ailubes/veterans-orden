import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pages
 * List all pages (admin view - all statuses)
 */
export async function GET(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: pages, error: pagesError, count } = await query;

    if (pagesError) {
      console.error('[Pages API] GET error:', pagesError);
      return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }

    return NextResponse.json({
      pages,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('[Pages API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pages
 * Create a new page
 */
export async function POST(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Sanitize slug
    const slug = body.slug
      .toLowerCase()
      .replace(/[^a-z0-9\-\/]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for duplicate slug
    const { data: existingPage } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    // Create page
    const { data: page, error: createError } = await supabase
      .from('pages')
      .insert({
        title: body.title,
        slug,
        label: body.label || null,
        description: body.description || null,
        content: body.content || '',
        featured_image_url: body.featuredImageUrl || null,
        parent_slug: body.parentSlug || null,
        status: body.status || 'draft',
        show_in_nav: body.showInNav || false,
        nav_label: body.navLabel || null,
        sort_order: body.sortOrder || 0,
        meta_title: body.metaTitle || null,
        meta_description: body.metaDescription || null,
        author_id: profile.id,
        published_at: body.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Pages API] POST error:', createError);
      return NextResponse.json(
        { error: 'Failed to create page' },
        { status: 500 }
      );
    }

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error('[Pages API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create page' },
      { status: 500 }
    );
  }
}
