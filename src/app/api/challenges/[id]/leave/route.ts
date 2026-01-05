import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { leaveChallenge } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/challenges/[id]/leave
 *
 * Leave a challenge (only if not completed)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    try {
      await leaveChallenge(id, profile.id);
      return NextResponse.json({
        success: true,
        message: 'Ви вийшли з челенджу',
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to leave challenge' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Leave Challenge API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
