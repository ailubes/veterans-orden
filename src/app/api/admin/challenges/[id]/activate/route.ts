import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { updateChallenge } from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/challenges/[id]/activate
 * Activate a challenge (change status from upcoming to active)
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

  const effectiveAdminRole =
    profile?.staff_role && profile.staff_role !== 'none'
      ? profile.staff_role
      : profile?.role;

  const adminRoles = ['admin', 'super_admin'];
  if (!effectiveAdminRole || !adminRoles.includes(effectiveAdminRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const challenge = await updateChallenge(id, { status: 'active' });
    return NextResponse.json({ challenge });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('[Admin Challenges API] Activate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate challenge' },
      { status: 500 }
    );
  }
}
