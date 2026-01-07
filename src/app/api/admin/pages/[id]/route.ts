import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/pages/[id]
 * Get a single page by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('[Pages API] GET [id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pages/[id]
 * Update a page
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // Check if page exists
    const { data: existingPage, error: findError } = await supabase
      .from('pages')
      .select('id, slug, status')
      .eq('id', id)
      .single();

    if (findError || !existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // If slug is changing, check for duplicates
    if (body.slug && body.slug !== existingPage.slug) {
      const slug = body.slug
        .toLowerCase()
        .replace(/[^a-z0-9\-\/]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: duplicatePage } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (duplicatePage) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 409 }
        );
      }

      body.slug = slug;
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      last_edited_by: profile.id,
      updated_at: new Date().toISOString(),
    };

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      title: 'title',
      slug: 'slug',
      label: 'label',
      description: 'description',
      content: 'content',
      featuredImageUrl: 'featured_image_url',
      parentSlug: 'parent_slug',
      status: 'status',
      showInNav: 'show_in_nav',
      navLabel: 'nav_label',
      sortOrder: 'sort_order',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description',
    };

    for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
      if (body[camelKey] !== undefined) {
        updateData[snakeKey] = body[camelKey];
      }
    }

    // Handle published_at
    if (body.status === 'published' && existingPage.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data: page, error: updateError } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Pages API] PUT error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update page' },
        { status: 500 }
      );
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('[Pages API] PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update page' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pages/[id]
 * Delete a page
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if page exists
    const { data: existingPage, error: findError } = await supabase
      .from('pages')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (findError || !existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if page has children
    const { data: childPages } = await supabase
      .from('pages')
      .select('id')
      .eq('parent_slug', existingPage.slug);

    if (childPages && childPages.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete page with child pages. Delete or reassign children first.' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Pages API] DELETE error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete page' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pages API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete page' },
      { status: 500 }
    );
  }
}
