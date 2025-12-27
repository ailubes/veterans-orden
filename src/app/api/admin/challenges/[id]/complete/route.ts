import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { completeChallenge } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/challenges/[id]/complete
 * Complete a challenge and award rewards to winners
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, profile, error } = await getAuthenticatedUserWithProfile(request);

  if (!user || error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminRoles = ['admin', 'super_admin'];
  if (!profile || !adminRoles.includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await completeChallenge(id);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('[Admin Challenges API] Complete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete challenge' },
      { status: 500 }
    );
  }
}
