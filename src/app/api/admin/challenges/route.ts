import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { listChallenges, createChallenge } from '@/lib/challenges/challenge-service';
import type { ChallengeType, ChallengeStatus } from '@/lib/challenges';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/challenges
 * List all challenges (admin view with all statuses)
 */
export async function GET(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const type = searchParams.get('type') as ChallengeType | null;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let status: ChallengeStatus | ChallengeStatus[] | undefined;
    if (statusParam && ['upcoming', 'active', 'completed', 'cancelled'].includes(statusParam)) {
      status = statusParam as ChallengeStatus;
    } else {
      // Admin sees all by default
      status = ['upcoming', 'active', 'completed', 'cancelled'];
    }

    const challenges = await listChallenges({
      status,
      type: type || undefined,
      limit,
      offset,
      orderBy: 'createdAt',
      orderDir: 'desc',
    });

    return NextResponse.json({
      challenges,
      pagination: {
        limit,
        offset,
        total: challenges.length,
      },
    });
  } catch (error) {
    console.error('[Admin Challenges API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/challenges
 * Create a new challenge
 */
export async function POST(request: NextRequest) {
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const challenge = await createChallenge({
      ...body,
      createdById: profile.id,
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('[Admin Challenges API] POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
