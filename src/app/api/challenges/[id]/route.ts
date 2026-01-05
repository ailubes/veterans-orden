import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChallengeWithProgress } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges/[id]
 *
 * Returns a single challenge with user progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user for progress tracking
    const { data: { user } } = await supabase.auth.getUser();
    let userId: string | undefined;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      userId = profile?.id;
    }

    const challenge = await getChallengeWithProgress(id, userId);

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('[Challenge API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
