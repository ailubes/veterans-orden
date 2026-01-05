import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ArticlesListResponse } from '@/lib/help/types';
import { MEMBERSHIP_ROLES, type MembershipRole } from '@/lib/constants';
import { hasAdminAccess } from '@/lib/permissions-utils';

/**
 * GET /api/help/articles
 * Get list of published help articles with server-side permission filtering
 * Query params:
 *  - categoryId: UUID filter by category
 *  - limit: number (default: 20, max: 100)
 *  - offset: number (default: 0)
 *  - search: text search in title/content
 *
 * NOTE: audience filtering is now SERVER-ENFORCED based on user's roles
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const categoryId = searchParams.get('categoryId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // SERVER-SIDE PERMISSION CHECK: Determine allowed audiences based on user's roles
    let allowedAudiences: string[] = ['all'];

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Get user's roles from database
      const { data: dbUser } = await supabase
        .from('users')
        .select('staff_role, membership_role')
        .eq('auth_id', authUser.id)
        .single();

      if (dbUser) {
        // All authenticated users can see 'members' content
        allowedAudiences.push('members');

        // Check membership level for leaders content
        const membershipRole = (dbUser.membership_role || 'supporter') as MembershipRole;
        const roleLevel = MEMBERSHIP_ROLES[membershipRole]?.level || 0;

        if (roleLevel >= 4) {
          // Network leader+ (level 4+) can see leader content
          allowedAudiences.push('leaders');
        }

        // Check admin access (staff admin OR regional leader+)
        if (hasAdminAccess(dbUser.staff_role, membershipRole)) {
          allowedAudiences.push('admins');
        }
      }
    }

    // Build query with SERVER-ENFORCED audience filtering
    let query = supabase
      .from('help_articles')
      .select(`
        *,
        category:help_categories!inner(
          id,
          name_uk,
          name_en,
          slug,
          icon
        ),
        author:users!help_articles_author_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .in('audience', allowedAudiences)  // SERVER-SIDE: Only show articles user has permission to see
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply optional filters
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }

    const response: ArticlesListResponse = {
      articles: articles || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[GET /api/help/articles]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
