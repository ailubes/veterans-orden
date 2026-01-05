import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me/stats
 *
 * Returns current user's personal statistics:
 * - Task stats (completed, in progress, pending review)
 * - Points earned
 * - Leaderboard position
 * - Recent activity
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, points, created_at')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Run all queries in parallel
    const [
      tasksResult,
      submissionsResult,
      rankResult,
      recentActivityResult,
    ] = await Promise.all([
      // User's tasks
      supabase
        .from('tasks')
        .select('id, status, points, completed_at, title')
        .eq('assignee_id', profile.id),

      // User's submissions
      supabase
        .from('task_submissions')
        .select('id, status, points_awarded, created_at')
        .eq('user_id', profile.id),

      // Rank by points
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('points', profile.points || 0),

      // Recent completed tasks
      supabase
        .from('tasks')
        .select('id, title, points, completed_at')
        .eq('assignee_id', profile.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5),
    ]);

    const tasks = tasksResult.data || [];
    const submissions = submissionsResult.data || [];
    const rankCount = rankResult.count || 0;
    const recentActivity = recentActivityResult.data || [];

    // Calculate task stats
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pendingReview: tasks.filter(t => t.status === 'pending_review').length,
    };

    // Calculate points stats
    const pointsFromTasks = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.points || 0), 0);

    const pointsStats = {
      total: profile.points || 0,
      fromTasks: pointsFromTasks,
    };

    // Submission stats
    const submissionStats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
    };

    // Calculate weekly/monthly activity
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedThisWeek = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      return new Date(t.completed_at) >= weekAgo;
    }).length;

    const completedThisMonth = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      return new Date(t.completed_at) >= monthAgo;
    }).length;

    // Get total active users for rank context
    const { count: totalActiveUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('points', 0);

    return NextResponse.json({
      taskStats,
      pointsStats,
      submissionStats,
      activity: {
        completedThisWeek,
        completedThisMonth,
        recentCompleted: recentActivity.map(t => ({
          id: t.id,
          title: t.title,
          points: t.points,
          completedAt: t.completed_at,
        })),
      },
      rank: {
        position: rankCount + 1,
        totalParticipants: totalActiveUsers || 0,
        percentile: totalActiveUsers
          ? Math.round(((totalActiveUsers - rankCount) / totalActiveUsers) * 100)
          : 0,
      },
      memberSince: profile.created_at,
    });
  } catch (error) {
    console.error('[User Stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
