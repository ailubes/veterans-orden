import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/user/activity
 * Updates user's daily activity streak
 * Called when user visits dashboard or performs any activity
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || !dbUser) {
      console.error('[Activity] Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update streak using PostgreSQL function
    const { error: streakError } = await supabase
      .rpc('update_user_streak', { p_user_id: dbUser.id });

    if (streakError) {
      console.error('[Activity] Error updating streak:', streakError);
      return NextResponse.json(
        { error: 'Failed to update activity streak' },
        { status: 500 }
      );
    }

    // Fetch updated streak data
    const { data: streak, error: fetchError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', dbUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[Activity] Error fetching streak:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch streak data' },
        { status: 500 }
      );
    }

    // Check for new uncelebrated milestones
    const { data: milestones } = await supabase
      .from('progression_milestones')
      .select('id, milestone_type, title_uk, message_uk')
      .eq('user_id', dbUser.id)
      .eq('is_celebrated', false)
      .eq('milestone_type', 'streak_milestone')
      .order('created_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        streak: {
          current: streak?.current_streak || 0,
          longest: streak?.longest_streak || 0,
          totalDays: streak?.total_days || 0,
          lastActivityDate: streak?.last_activity_date,
        },
        newMilestone: milestones && milestones.length > 0 ? milestones[0] : null,
      },
    });

  } catch (error) {
    console.error('[Activity] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
