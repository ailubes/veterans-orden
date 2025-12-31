import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CategoriesTreeResponse, HelpCategory } from '@/lib/help/types';
import { hasAdminAccess } from '@/lib/permissions-utils';
import type { MembershipRole } from '@/lib/constants';

/**
 * GET /api/help/categories
 * Get all visible help categories in hierarchical structure
 *
 * NOTE: Admin category filtering is SERVER-ENFORCED based on user's roles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // SERVER-SIDE PERMISSION CHECK: Determine if user has admin access
    let hasAdminAccessFlag = false;

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Get user's roles from database
      const { data: dbUser } = await supabase
        .from('users')
        .select('staff_role, membership_role')
        .eq('clerk_id', authUser.id)
        .single();

      if (dbUser) {
        const membershipRole = (dbUser.membership_role || 'supporter') as MembershipRole;
        hasAdminAccessFlag = hasAdminAccess(dbUser.staff_role, membershipRole);
      }
    }

    // Get all visible categories with article counts
    const { data: categories, error } = await supabase
      .from('help_categories')
      .select(`
        *,
        articles:help_articles(count)
      `)
      .eq('is_visible', true)
      .order('order', { ascending: true })
      .order('name_uk', { ascending: true });

    if (error) {
      throw error;
    }

    // SERVER-SIDE: Filter out admin category if user doesn't have admin access
    const filteredCategories = categories?.filter((cat: any) => {
      // Hide "Для адміністраторів" category from non-admins
      if (cat.slug === 'dlia-administratoriv') {
        return hasAdminAccessFlag;
      }
      return true;
    }) || [];

    // Build hierarchical tree structure
    const categoriesMap = new Map<string, HelpCategory>();
    const rootCategories: HelpCategory[] = [];

    // First pass: create all category objects
    filteredCategories.forEach((cat: any) => {
      const category: HelpCategory = {
        id: cat.id,
        nameUk: cat.name_uk,
        nameEn: cat.name_en,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        parentId: cat.parent_id,
        order: cat.order,
        isVisible: cat.is_visible,
        createdAt: new Date(cat.created_at),
        subcategories: [],
        // Add article count from join
        // Note: articles is an array with one object containing count
        // e.g., articles: [{ count: 5 }]
      };

      categoriesMap.set(cat.id, category);
    });

    // Second pass: build hierarchy
    categoriesMap.forEach((category) => {
      if (category.parentId) {
        const parent = categoriesMap.get(category.parentId);
        if (parent) {
          if (!parent.subcategories) {
            parent.subcategories = [];
          }
          parent.subcategories.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    const response: CategoriesTreeResponse = {
      categories: rootCategories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/help/categories]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
