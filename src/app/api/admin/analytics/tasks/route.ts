import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/tasks
 *
 * Returns comprehensive task statistics:
 * - Overall task counts by status
 * - Tasks by type and priority
 * - Completion rates
 * - Points distribution
 * - Submission stats
 * - Daily completion trends (last 30 days)
 * - Top performers
 */
export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all queries in parallel
    const [
      tasksResult,
      submissionsResult,
      dailyCompletionsResult,
      topPerformersResult,
      pointsStatsResult,
    ] = await Promise.all([
      // 1. All tasks with status counts
      supabase
        .from('tasks')
        .select('id, status, type, priority, points, created_at, completed_at'),

      // 2. Submission stats
      supabase
        .from('task_submissions')
        .select('id, status, points_awarded, created_at, reviewed_at'),

      // 3. Daily completions (last 30 days)
      supabase
        .from('tasks')
        .select('completed_at')
        .eq('status', 'completed')
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .not('completed_at', 'is', null),

      // 4. Top performers (users with most completed tasks)
      supabase
        .from('tasks')
        .select('assignee_id, users!tasks_assignee_id_users_id_fk(first_name, last_name, avatar_url)')
        .eq('status', 'completed')
        .not('assignee_id', 'is', null),

      // 5. Total points awarded
      supabase
        .from('task_submissions')
        .select('points_awarded')
        .eq('status', 'approved'),
    ]);

    const tasks = tasksResult.data || [];
    const submissions = submissionsResult.data || [];
    const dailyCompletions = dailyCompletionsResult.data || [];
    const completedTasks = topPerformersResult.data || [];
    const approvedSubmissions = pointsStatsResult.data || [];

    // Calculate overall stats
    const statusCounts = {
      open: tasks.filter(t => t.status === 'open').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      pending_review: tasks.filter(t => t.status === 'pending_review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };

    // Tasks by type
    const typeCounts: Record<string, number> = {};
    tasks.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });

    // Tasks by priority
    const priorityCounts: Record<string, number> = {};
    tasks.forEach(t => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    // Completion rate
    const totalTasks = tasks.length;
    const completedTasksCount = statusCounts.completed;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasksCount / totalTasks) * 100)
      : 0;

    // Submission stats
    const submissionStats = {
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      total: submissions.length,
    };

    // Points stats
    const totalPointsAwarded = approvedSubmissions.reduce(
      (sum, s) => sum + (s.points_awarded || 0),
      0
    );
    const totalPossiblePoints = tasks.reduce(
      (sum, t) => sum + (t.points || 0),
      0
    );

    // Daily completions trend (last 30 days)
    const dailyTrend: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = dailyCompletions.filter(t => {
        if (!t.completed_at) return false;
        return t.completed_at.split('T')[0] === dateStr;
      }).length;

      dailyTrend.push({ date: dateStr, count });
    }

    // Top performers (group by assignee)
    const performerMap = new Map<string, {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      completedCount: number;
    }>();

    completedTasks.forEach(task => {
      if (!task.assignee_id || !task.users) return;

      const existing = performerMap.get(task.assignee_id);
      if (existing) {
        existing.completedCount++;
      } else {
        performerMap.set(task.assignee_id, {
          id: task.assignee_id,
          firstName: task.users.first_name || '',
          lastName: task.users.last_name || '',
          avatarUrl: task.users.avatar_url,
          completedCount: 1,
        });
      }
    });

    const topPerformers = Array.from(performerMap.values())
      .sort((a, b) => b.completedCount - a.completedCount)
      .slice(0, 10);

    // Average completion time (in hours)
    const completedWithDates = tasks.filter(
      t => t.status === 'completed' && t.created_at && t.completed_at
    );
    let avgCompletionTimeHours = 0;
    if (completedWithDates.length > 0) {
      const totalHours = completedWithDates.reduce((sum, t) => {
        const created = new Date(t.created_at).getTime();
        const completed = new Date(t.completed_at).getTime();
        return sum + (completed - created) / (1000 * 60 * 60);
      }, 0);
      avgCompletionTimeHours = Math.round(totalHours / completedWithDates.length);
    }

    return NextResponse.json({
      overview: {
        totalTasks,
        completedTasks: completedTasksCount,
        completionRate,
        avgCompletionTimeHours,
      },
      statusCounts,
      typeCounts,
      priorityCounts,
      submissionStats,
      pointsStats: {
        totalAwarded: totalPointsAwarded,
        totalPossible: totalPossiblePoints,
        awardRate: totalPossiblePoints > 0
          ? Math.round((totalPointsAwarded / totalPossiblePoints) * 100)
          : 0,
      },
      dailyTrend,
      topPerformers,
    });
  } catch (error) {
    console.error('[Task Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
