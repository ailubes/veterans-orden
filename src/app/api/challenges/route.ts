import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listChallenges } from '@/lib/challenges';
import type { ChallengeType, ChallengeStatus } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges
 *
 * Returns list of challenges with optional filters
 *
 * Query params:
 * - status: 'upcoming' | 'active' | 'completed' | 'all' (default: 'active')
 * - type: 'weekly' | 'monthly' | 'special' (optional)
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const statusParam = searchParams.get('status') || 'active';
    const type = searchParams.get('type') as ChallengeType | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get current user for progress tracking
    const { data: { user } } = await supabase.auth.getUser();
    let userId: string | undefined;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();
      userId = profile?.id;
    }

    // Determine status filter
    let status: ChallengeStatus | ChallengeStatus[] | undefined;
    if (statusParam === 'all') {
      status = ['upcoming', 'active', 'completed'];
    } else if (['upcoming', 'active', 'completed'].includes(statusParam)) {
      status = statusParam as ChallengeStatus;
    } else {
      status = 'active';
    }

    const challenges = await listChallenges({
      status,
      type: type || undefined,
      userId,
      limit,
      offset,
      orderBy: 'startDate',
      orderDir: statusParam === 'completed' ? 'desc' : 'asc',
    });

    return NextResponse.json({
      challenges,
      pagination: {
        limit,
        offset,
        hasMore: challenges.length === limit,
      },
    });
  } catch (error) {
    console.error('[Challenges API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
