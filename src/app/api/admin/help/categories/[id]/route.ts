import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * PUT /api/admin/help/categories/[id]
 * Update an existing category
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
      nameUk,
      nameEn,
      slug,
      description,
      icon,
      parentId,
      order,
      isVisible,
    } = body;

    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('help_categories')
      .select('id, slug, parent_id')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingCategory.slug) {
      const { data: slugCheck } = await supabase
        .from('help_categories')
        .select('id')
        .eq('slug', slug)
        .single();

      if (slugCheck) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Prevent circular parent relationships
    if (parentId) {
      // Can't be its own parent
      if (parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 }
        );
      }

      // Check if parentId is a child of this category (would create circular ref)
      const { data: potentialParent } = await supabase
        .from('help_categories')
        .select('parent_id')
        .eq('id', parentId)
        .single();

      if (potentialParent?.parent_id === id) {
        return NextResponse.json(
          { error: 'Cannot create circular parent relationship' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (nameUk !== undefined) updateData.name_uk = nameUk;
    if (nameEn !== undefined) updateData.name_en = nameEn;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (parentId !== undefined) updateData.parent_id = parentId || null;
    if (order !== undefined) updateData.order = order;
    if (isVisible !== undefined) updateData.is_visible = isVisible;

    // Update category
    const { data: category, error: dbError } = await supabase
      .from('help_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/help/categories/[id]
 * Delete a category (only if it has no articles)
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

    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('help_categories')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if category has articles
    const { data: articles } = await supabase
      .from('help_articles')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (articles && articles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing articles. Move or delete articles first.' },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const { data: subcategories } = await supabase
      .from('help_categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (subcategories && subcategories.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Delete or reassign subcategories first.' },
        { status: 400 }
      );
    }

    // Delete category
    const { error: dbError } = await supabase
      .from('help_categories')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
