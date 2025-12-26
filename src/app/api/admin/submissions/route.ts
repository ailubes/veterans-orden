import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, getRegionalLeaderFilter } from '@/lib/permissions';
import { isRegionalLeader } from '@/lib/permissions-utils';

export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check admin access
    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    // Get filter params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('task_submissions')
      .select(`
        *,
        task:tasks!task_submissions_task_id_fkey(
          id, title, points, type, priority
        ),
        user:users!task_submissions_user_id_fkey(
          id, first_name, last_name, email, avatar_url
        ),
        reviewer:users!task_submissions_reviewed_by_fkey(
          first_name, last_name
        )
      `, { count: 'exact' });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Regional leaders can only see submissions from their referral tree
    if (isRegionalLeader(adminProfile.role)) {
      const filter = await getRegionalLeaderFilter(adminProfile);
      if (filter.filterType === 'referral_tree' && filter.userIds) {
        query = query.in('user_id', filter.userIds);
      }
    }

    // Order and paginate (using id as it's UUID v4 which is time-ordered)
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: submissions, error, count } = await query;

    if (error) {
      console.error('Submissions fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submissions: submissions || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Submissions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
