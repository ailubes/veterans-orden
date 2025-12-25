import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/categories
 *
 * Get all news categories with metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const { data: categories, error } = await supabase
      .from('news_category_meta')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 *
 * Create new category metadata (super_admin only)
 * Note: This does NOT add to the enum - requires manual migration
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Тільки super_admin може створювати категорії' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, name_uk, name_en, description, icon, color } = body;

    if (!id || !name_uk || !name_en) {
      return NextResponse.json(
        { error: 'id, name_uk та name_en є обов\'язковими' },
        { status: 400 }
      );
    }

    // Get current max order
    const { data: maxOrderData } = await supabase
      .from('news_category_meta')
      .select('order')
      .order('order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrderData?.order || 0) + 1;

    // Insert category metadata
    const { data: category, error } = await supabase
      .from('news_category_meta')
      .insert({
        id,
        name_uk,
        name_en,
        description: description || null,
        icon: icon || 'file-text',
        color: color || '#6b7280',
        order: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      category,
      warning:
        'Категорія додана до метаданих. Щоб використовувати її в статтях, додайте значення до enum через міграцію.',
    });
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
