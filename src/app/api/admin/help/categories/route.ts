import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/db/supabase-server';

/**
 * GET /api/admin/help/categories
 * Get all categories (including hidden ones for admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify admin/leader role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!userData || !['admin', 'leader'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all categories with article counts
    const { data: categories, error } = await supabase
      .from('help_categories')
      .select(`
        *,
        articleCount:help_articles(count)
      `)
      .order('order', { ascending: true });

    if (error) {
      console.error('[Admin Get Categories] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to include article count
    const categoriesWithCount = categories?.map((cat: any) => ({
      ...cat,
      articleCount: cat.articleCount?.[0]?.count || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount || [] });
  } catch (error) {
    console.error('[Admin Get Categories] Error:', error);
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify admin/leader role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!userData || !['admin', 'leader'].includes(userData.role)) {
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
    const { data: category, error } = await supabase
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

    if (error) {
      console.error('[Admin Create Category] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('[Admin Create Category] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
