import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  manuallyAdvanceRole,
  getUserRoleProgress,
  type MembershipRole,
} from '@/lib/services/role-progression';
import { MEMBERSHIP_ROLES } from '@/lib/constants';

/**
 * POST /api/admin/members/[id]/advance-role
 * Manually advance a member's role (admin access required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await db
      .select({
        id: users.id,
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { toRole, reason } = body;

    if (!toRole) {
      return NextResponse.json(
        { error: 'Target role is required' },
        { status: 400 }
      );
    }

    // Validate the role
    if (!Object.keys(MEMBERSHIP_ROLES).includes(toRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const result = await manuallyAdvanceRole(
      memberId,
      toRole as MembershipRole,
      dbUser[0].id,
      reason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to advance role' },
        { status: 400 }
      );
    }

    // Get updated progress
    const progress = await getUserRoleProgress(memberId);

    return NextResponse.json({
      success: true,
      message: `Користувача підвищено до рівня "${MEMBERSHIP_ROLES[toRole as MembershipRole]?.label || toRole}"`,
      progress,
    });
  } catch (error) {
    console.error('Error advancing member role:', error);
    return NextResponse.json(
      { error: 'Failed to advance member role' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/members/[id]/advance-role
 * Get member's role progress (admin access required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const dbUser = await db
      .select({
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const progress = await getUserRoleProgress(memberId);

    if (!progress) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error getting member role progress:', error);
    return NextResponse.json(
      { error: 'Failed to get member role progress' },
      { status: 500 }
    );
  }
}
