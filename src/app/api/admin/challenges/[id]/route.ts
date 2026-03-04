import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import {
  getChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeTaskIds,
  getChallengeLinkedTasks,
  getChallengeRegionalProgress,
} from '@/lib/challenges/challenge-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/challenges/[id]
 * Get challenge details
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
    const challenge = await getChallenge(id);

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.goalType === 'tasks') {
      challenge.linkedTaskIds = await getChallengeTaskIds(id);
      challenge.linkedTasks = await getChallengeLinkedTasks(id);
    }
    challenge.regionalProgress = await getChallengeRegionalProgress(id, 7);

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('[Admin Challenges API] GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/challenges/[id]
 * Update challenge
 */
export async function PATCH(
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
    const body = await request.json();
    const taskIds = Array.isArray(body.taskIds) ? body.taskIds : undefined;
    const challenge = await updateChallenge(id, body);

    if (challenge.goalType === 'tasks') {
      if (taskIds !== undefined) {
        challenge.linkedTaskIds = taskIds;
      } else {
        challenge.linkedTaskIds = await getChallengeTaskIds(id);
      }
      challenge.linkedTasks = await getChallengeLinkedTasks(id);
    } else {
      challenge.linkedTaskIds = [];
      challenge.linkedTasks = [];
    }
    challenge.regionalProgress = await getChallengeRegionalProgress(id, 7);

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('[Admin Challenges API] PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update challenge' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

/**
 * DELETE /api/admin/challenges/[id]
 * Delete challenge (only if not started or has participants)
 */
export async function DELETE(
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
    await deleteChallenge(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Challenges API] DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete challenge' },
      { status: 500 }
    );
  }
}
