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
      // Leaderboard by completed tasks
      let tasksQuery = supabase
        .from('tasks')
        .select('assignee_id')
        .eq('status', 'completed')
        .not('assignee_id', 'is', null);

      if (dateFilter) {
        tasksQuery = tasksQuery.gte('completed_at', dateFilter);
      }

      const { data: completedTasks } = await tasksQuery;

      if (completedTasks) {
        // Count tasks per user
        const taskCounts = new Map<string, number>();
        completedTasks.forEach(t => {
          if (t.assignee_id) {
            taskCounts.set(t.assignee_id, (taskCounts.get(t.assignee_id) || 0) + 1);
          }
        });

        // Get user IDs sorted by count
        const sortedUserIds = Array.from(taskCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit);

        if (sortedUserIds.length > 0) {
          // Fetch user details
          const { data: users } = await supabase
            .from('users')
            .select('id, first_name, last_name, avatar_url')
            .in('id', sortedUserIds.map(([id]) => id));

          if (users) {
            const userMap = new Map(users.map(u => [u.id, u]));

            leaderboard = sortedUserIds.map(([userId, count], index) => {
              const user = userMap.get(userId);
              return {
                rank: index + 1,
                userId,
                firstName: user?.first_name || '',
                lastName: user?.last_name || '',
                avatarUrl: user?.avatar_url || null,
                value: count,
                isCurrentUser: currentUserProfile?.id === userId,
              };
            });
          }
        }

        // Get current user's rank if not in top list
        if (currentUserProfile && !leaderboard.some(l => l.isCurrentUser)) {
          const userTaskCount = taskCounts.get(currentUserProfile.id) || 0;
          const higherCount = Array.from(taskCounts.values()).filter(c => c > userTaskCount).length;

          currentUserRank = {
            rank: higherCount + 1,
            value: userTaskCount,
          };
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
