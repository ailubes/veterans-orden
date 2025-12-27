import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * PUT /api/admin/help/tooltips/[id]
 * Update an existing tooltip
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }


    // Verify admin/leader role
    if (!profile || !['admin', 'leader', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      pageSlug,
      elementId,
      content,
      articleId,
      audience,
      isActive,
    } = body;

    // Check if tooltip exists
    const { data: existingTooltip } = await supabase
      .from('help_tooltips')
      .select('id, page_slug, element_id')
      .eq('id', id)
      .single();

    if (!existingTooltip) {
      return NextResponse.json({ error: 'Tooltip not found' }, { status: 404 });
    }

    // Check if page_slug/element_id is being changed and if new combination already exists
    if (
      (pageSlug && pageSlug !== existingTooltip.page_slug) ||
      (elementId && elementId !== existingTooltip.element_id)
    ) {
      const newPageSlug = pageSlug || existingTooltip.page_slug;
      const newElementId = elementId || existingTooltip.element_id;

      const { data: duplicateCheck } = await supabase
        .from('help_tooltips')
        .select('id')
        .eq('page_slug', newPageSlug)
        .eq('element_id', newElementId)
        .neq('id', id)
        .single();

      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Tooltip already exists for this page and element' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (pageSlug !== undefined) updateData.page_slug = pageSlug;
    if (elementId !== undefined) updateData.element_id = elementId;
    if (content !== undefined) updateData.content = content;
    if (articleId !== undefined) updateData.article_id = articleId || null;
    if (audience !== undefined) updateData.audience = audience;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Update tooltip
    const { data: tooltip, error: dbError } = await supabase
      .from('help_tooltips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ tooltip });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/help/tooltips/[id]
 * Delete a tooltip
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, profile, supabase, error } = await getAuthenticatedUserWithProfile(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }


    // Verify admin role (only admins can delete)
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { id } = await params;

    // Check if tooltip exists
    const { data: existingTooltip } = await supabase
      .from('help_tooltips')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingTooltip) {
      return NextResponse.json({ error: 'Tooltip not found' }, { status: 404 });
    }

    // Delete tooltip
    const { error: dbError } = await supabase
      .from('help_tooltips')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tooltip deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
