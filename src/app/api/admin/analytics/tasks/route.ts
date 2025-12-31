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

    // OPTIMIZED: Run all queries in parallel using database aggregation functions
    const [
      overviewResult,
      statusCountsResult,
      typeCountsResult,
      priorityCountsResult,
      submissionCountsResult,
      pointsStatsResult,
      dailyCompletionsResult,
      topPerformersResult,
    ] = await Promise.all([
      // 1. Overview stats (aggregated in DB)
      supabase.rpc('get_task_overview_stats'),

      // 2. Status counts (aggregated in DB)
      supabase.rpc('get_task_status_counts'),

      // 3. Type counts (aggregated in DB)
      supabase.rpc('get_task_type_counts'),

      // 4. Priority counts (aggregated in DB)
      supabase.rpc('get_task_priority_counts'),

      // 5. Submission status counts (aggregated in DB)
      supabase.rpc('get_submission_status_counts'),

      // 6. Points stats (aggregated in DB)
      supabase.rpc('get_task_points_stats'),

      // 7. Daily completions (last 30 days, aggregated in DB)
      supabase.rpc('get_daily_task_completions', { p_days: 30 }),

      // 8. Top performers (from existing task leaderboard function)
      supabase.rpc('get_task_leaderboard', { p_limit: 10, p_date_filter: null }),
    ]);

    // Extract overview stats
    const overview = overviewResult.data?.[0] || {
      total_tasks: 0,
      completed_tasks: 0,
      completion_rate: 0,
      avg_completion_hours: 0,
    };

    // Convert status counts array to object
    const statusCounts: Record<string, number> = {};
    (statusCountsResult.data || []).forEach((row: any) => {
      statusCounts[row.status] = parseInt(row.count);
    });

    // Convert type counts array to object
    const typeCounts: Record<string, number> = {};
    (typeCountsResult.data || []).forEach((row: any) => {
      typeCounts[row.type] = parseInt(row.count);
    });

    // Convert priority counts array to object
    const priorityCounts: Record<string, number> = {};
    (priorityCountsResult.data || []).forEach((row: any) => {
      priorityCounts[row.priority] = parseInt(row.count);
    });

    // Convert submission counts to stats object
    const submissionCounts: Record<string, number> = {};
    let totalSubmissions = 0;
    (submissionCountsResult.data || []).forEach((row: any) => {
      const count = parseInt(row.count);
      submissionCounts[row.status] = count;
      totalSubmissions += count;
    });

    const submissionStats = {
      pending: submissionCounts.pending || 0,
      approved: submissionCounts.approved || 0,
      rejected: submissionCounts.rejected || 0,
      total: totalSubmissions,
    };

    // Extract points stats
    const pointsStats = pointsStatsResult.data?.[0] || {
      total_possible_points: 0,
      total_awarded_points: 0,
      award_rate: 0,
    };

    // Build daily trend with all 30 days (fill missing days with 0)
    const dailyCompletionsMap = new Map();
    (dailyCompletionsResult.data || []).forEach((row: any) => {
      dailyCompletionsMap.set(row.date, parseInt(row.count));
    });

    const dailyTrend: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend.push({
        date: dateStr,
        count: dailyCompletionsMap.get(dateStr) || 0,
      });
    }

    // Convert top performers
    const topPerformers = (topPerformersResult.data || []).map((row: any) => ({
      id: row.user_id,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      avatarUrl: row.avatar_url || null,
      completedCount: parseInt(row.task_count),
    }));

    return NextResponse.json({
      overview: {
        totalTasks: parseInt(overview.total_tasks) || 0,
        completedTasks: parseInt(overview.completed_tasks) || 0,
        completionRate: parseFloat(overview.completion_rate) || 0,
        avgCompletionTimeHours: parseFloat(overview.avg_completion_hours) || 0,
      },
      statusCounts,
      typeCounts,
      priorityCounts,
      submissionStats,
      pointsStats: {
        totalAwarded: parseInt(pointsStats.total_awarded_points) || 0,
        totalPossible: parseInt(pointsStats.total_possible_points) || 0,
        awardRate: parseFloat(pointsStats.award_rate) || 0,
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
