import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/growth
 * Get member growth data over time
 */
export async function GET(request: NextRequest) {
  try {
    const { auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Get last 30 days of growth data
    const { data, error } = await supabase.rpc('get_member_growth_30_days');

    if (error) {
      console.error('Error fetching growth data:', error);

      // Fallback: generate data manually if RPC doesn't exist
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: members } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at');

      // Group by day
      const dailyData: Record<string, number> = {};
      members?.forEach((member) => {
        const date = new Date(member.created_at).toISOString().split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + 1;
      });

      // Get total before period
      const { count: totalBefore } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', thirtyDaysAgo.toISOString());

      // Build cumulative data
      let cumulative = totalBefore || 0;
      const chartData = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        cumulative += dailyData[dateStr] || 0;

        chartData.push({
          date: dateStr,
          new_members: dailyData[dateStr] || 0,
          total_members: cumulative,
          label: date.toLocaleDateString('uk-UA', { month: 'short', day: 'numeric' }),
        });
      }

      return NextResponse.json({ data: chartData });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Analytics Growth Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
