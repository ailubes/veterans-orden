import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

/**
 * GET /api/admin/help/categories
 * Get all categories (including hidden ones for admin view)
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

    // Fetch all categories with article counts
    const { data: categories, error: dbError } = await supabase
      .from('help_categories')
      .select(`
        *,
        articleCount:help_articles(count)
      `)
      .order('order', { ascending: true });

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Transform to include article count
    const categoriesWithCount = categories?.map((cat: any) => ({
      ...cat,
      articleCount: cat.articleCount?.[0]?.count || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/help/categories
 * Create a new category
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
      nameUk,
      nameEn,
      slug,
      description,
      icon,
      parentId,
      order,
      isVisible,
    } = body;

    // Validate required fields
    if (!nameUk || !nameEn || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: nameUk, nameEn, slug' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingCategory } = await supabase
      .from('help_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    // Create category
    const { data: category, error: dbError } = await supabase
      .from('help_categories')
      .insert({
        name_uk: nameUk,
        name_en: nameEn,
        slug,
        description: description || null,
        icon: icon || null,
        parent_id: parentId || null,
        order: order ?? 0,
        is_visible: isVisible ?? true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error:', error);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
