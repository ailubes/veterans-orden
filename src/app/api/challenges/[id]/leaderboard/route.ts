import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChallengeLeaderboard, getChallenge } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges/[id]/leaderboard
 *
 * Returns leaderboard for a competitive challenge
 *
 * Query params:
 * - limit: number (default: 10, max: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const supabase = await createClient();

    // Verify challenge exists
    const challenge = await getChallenge(id);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    let currentUserId: string | undefined;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      currentUserId = profile?.id;
    }

    const leaderboard = await getChallengeLeaderboard(id, limit, currentUserId);

    // Get current user's position if not in top list
    let currentUserPosition: {
      rank: number;
      progress: number;
    } | null = null;

    if (currentUserId && !leaderboard.some(l => l.isCurrentUser)) {
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('progress')
        .eq('challenge_id', id)
        .eq('user_id', currentUserId)
        .single();

      if (participation) {
        // Count how many have higher progress
        const { count } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', id)
          .gt('progress', participation.progress || 0);

        currentUserPosition = {
          rank: (count || 0) + 1,
          progress: participation.progress || 0,
        };
      }
    }

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        isCompetitive: challenge.isCompetitive,
        maxWinners: challenge.maxWinners,
        goalTarget: challenge.goalTarget,
        goalType: challenge.goalType,
      },
      leaderboard,
      currentUserPosition: currentUserPosition || (
        leaderboard.find(l => l.isCurrentUser)
          ? { rank: leaderboard.find(l => l.isCurrentUser)!.rank, progress: leaderboard.find(l => l.isCurrentUser)!.progress }
          : null
      ),
    });
  } catch (error) {
    console.error('[Challenge Leaderboard API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
