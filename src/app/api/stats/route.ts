import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'; // Mark as dynamic because we use cookies

export async function GET() {
  try {
    const supabase = await createClient();

    // Get total member count
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get members joined in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: weeklyGrowth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('created_at', oneWeekAgo.toISOString());

    return NextResponse.json({
      totalMembers: totalMembers || 0,
      weeklyGrowth: weeklyGrowth || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return fallback values if there's an error
    return NextResponse.json({
      totalMembers: 0,
      weeklyGrowth: 0,
    });
  }
}
