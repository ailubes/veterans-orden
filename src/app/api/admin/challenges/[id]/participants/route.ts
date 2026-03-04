import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { getChallengeLeaderboard } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/challenges/[id]/participants
 * Get challenge participants with progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const effectiveAdminRole =
    profile?.staff_role && profile.staff_role !== 'none'
      ? profile.staff_role
      : profile?.role;

  const adminRoles = ['admin', 'super_admin'];
  if (!effectiveAdminRole || !adminRoles.includes(effectiveAdminRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    const participants = await getChallengeLeaderboard(id, limit);

    return NextResponse.json({
      participants,
      pagination: {
        limit,
        offset: 0,
        total: participants.length,
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('[Admin Challenges API] Get participants error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get participants' },
      { status: 500 }
    );
  }
}
