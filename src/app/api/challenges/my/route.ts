import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserChallenges } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges/my
 *
 * Returns challenges the current user has joined
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const challenges = await getUserChallenges(profile.id);

    // Separate by status
    const active = challenges.filter(c => c.status === 'active');
    const upcoming = challenges.filter(c => c.status === 'upcoming');
    const completed = challenges.filter(c => c.status === 'completed');

    return NextResponse.json({
      challenges,
      summary: {
        active: active.length,
        upcoming: upcoming.length,
        completed: completed.length,
        inProgress: active.filter(c => !c.userCompleted).length,
        completedByUser: challenges.filter(c => c.userCompleted).length,
      },
    });
  } catch (error) {
    console.error('[My Challenges API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
