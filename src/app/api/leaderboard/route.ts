import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard
 *
 * Returns leaderboard data:
 * - Top users by points
 * - Top users by completed tasks
 * - Current user's rank (if authenticated)
 *
 * Query params:
 * - type: 'points' | 'tasks' (default: 'points')
 * - limit: number (default: 10, max: 50)
 * - period: 'all' | 'month' | 'week' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'points';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const period = searchParams.get('period') || 'all';

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    let currentUserProfile = null;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, points')
        .eq('clerk_id', user.id)
        .single();
      currentUserProfile = profile;
    }

    // Calculate date filter
    let dateFilter: string | null = null;
    if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = monthAgo.toISOString();
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo.toISOString();
    }

    let leaderboard: Array<{
      rank: number;
      userId: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      value: number;
      isCurrentUser: boolean;
    }> = [];

    let currentUserRank: {
      rank: number;
      value: number;
    } | null = null;

    if (type === 'points') {
      // Leaderboard by total points
      let query = supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, points')
        .eq('status', 'active')
        .gt('points', 0)
        .order('points', { ascending: false })
        .limit(limit);

      const { data: users } = await query;

      if (users) {
        leaderboard = users.map((u, index) => ({
          rank: index + 1,
          userId: u.id,
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          avatarUrl: u.avatar_url,
          value: u.points || 0,
          isCurrentUser: currentUserProfile?.id === u.id,
        }));

        // Get current user's rank if not in top list
        if (currentUserProfile && !leaderboard.some(l => l.isCurrentUser)) {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .gt('points', currentUserProfile.points || 0);

          currentUserRank = {
            rank: (count || 0) + 1,
            value: currentUserProfile.points || 0,
          };
        }
      }
    } else if (type === 'tasks') {
      // Leaderboard by completed tasks - OPTIMIZED with database aggregation
      const { data: taskLeaderboard, error: taskError } = await supabase
        .rpc('get_task_leaderboard', {
          p_limit: limit,
          p_date_filter: dateFilter,
        });

      if (taskError) {
        console.error('[Leaderboard] Error fetching task leaderboard:', taskError);
      }

      if (taskLeaderboard) {
        leaderboard = taskLeaderboard.map((row: any, index: number) => ({
          rank: index + 1,
          userId: row.user_id,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          avatarUrl: row.avatar_url || null,
          value: parseInt(row.task_count) || 0,
          isCurrentUser: currentUserProfile?.id === row.user_id,
        }));

        // Get current user's rank if not in top list
        if (currentUserProfile && !leaderboard.some(l => l.isCurrentUser)) {
          const { data: userCount } = await supabase
            .rpc('get_user_task_count', {
              p_user_id: currentUserProfile.id,
              p_date_filter: dateFilter,
            });

          const { data: userRank } = await supabase
            .rpc('get_user_task_rank', {
              p_user_id: currentUserProfile.id,
              p_date_filter: dateFilter,
            });

          if (userCount !== null && userRank !== null) {
            currentUserRank = {
              rank: typeof userRank === 'number' ? userRank : parseInt(String(userRank)),
              value: typeof userCount === 'number' ? userCount : parseInt(String(userCount)),
            };
          }
        }
      }
    }

    // Get total participants count
    const { count: totalParticipants } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('points', 0);

    return NextResponse.json({
      type,
      period,
      leaderboard,
      currentUserRank: currentUserRank || (
        leaderboard.find(l => l.isCurrentUser)
          ? { rank: leaderboard.find(l => l.isCurrentUser)!.rank, value: leaderboard.find(l => l.isCurrentUser)!.value }
          : null
      ),
      totalParticipants: totalParticipants || 0,
    });
  } catch (error) {
    console.error('[Leaderboard] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
