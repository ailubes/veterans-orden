import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories/[id]
 *
 * Get single category metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: category, error } = await supabase
      .from('news_category_meta')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!category) {
      return NextResponse.json({ error: 'Категорію не знайдено' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('[Category API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/categories/[id]
 *
 * Update category metadata (super_admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    // Check role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Тільки super_admin може редагувати категорії' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name_uk, name_en, description, icon, color, order, is_active } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name_uk !== undefined) updateData.name_uk = name_uk;
    if (name_en !== undefined) updateData.name_en = name_en;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (order !== undefined) updateData.order = order;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update category
    const { data: category, error } = await supabase
      .from('news_category_meta')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!category) {
      return NextResponse.json({ error: 'Категорію не знайдено' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('[Category API] Error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id]
 *
 * Deactivate category (soft delete, super_admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
    }

    // Check role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Тільки super_admin може видаляти категорії' },
        { status: 403 }
      );
    }

    // Soft delete (deactivate)
    const { data: category, error } = await supabase
      .from('news_category_meta')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!category) {
      return NextResponse.json({ error: 'Категорію не знайдено' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Категорію деактивовано',
      category,
    });
  } catch (error) {
    console.error('[Category API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
