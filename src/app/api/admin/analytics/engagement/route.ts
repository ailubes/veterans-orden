import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/engagement
 * Get engagement metrics (events, votes, tasks)
 */
export async function GET(request: NextRequest) {
  try {
    const { auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Event RSVPs
    const { data: eventRsvps } = await supabase
      .from('event_rsvps')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Vote submissions
    const { data: votes } = await supabase
      .from('vote_submissions')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Task claims
    const { data: tasks } = await supabase
      .from('task_claims')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Group by day
    const dailyEngagement: Record<string, { events: number; votes: number; tasks: number }> = {};

    [eventRsvps, votes, tasks].forEach((dataset, index) => {
      const key = ['events', 'votes', 'tasks'][index] as 'events' | 'votes' | 'tasks';
      dataset?.forEach((item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        if (!dailyEngagement[date]) {
          dailyEngagement[date] = { events: 0, votes: 0, tasks: 0 };
        }
        dailyEngagement[date][key]++;
      });
    });

    // Build chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      chartData.push({
        date: dateStr,
        label: date.toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric' }),
        events: dailyEngagement[dateStr]?.events || 0,
        votes: dailyEngagement[dateStr]?.votes || 0,
        tasks: dailyEngagement[dateStr]?.tasks || 0,
      });
    }

    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error('[Analytics Engagement Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
