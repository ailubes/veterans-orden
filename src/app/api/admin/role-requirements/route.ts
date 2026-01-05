import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, roleRequirements } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAllRoleRequirements } from '@/lib/services/role-progression';

/**
 * GET /api/admin/role-requirements
 * Get all role requirements (admin access required)
 */
export async function GET() {
  try {
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
      .where(eq(users.authId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const requirements = await getAllRoleRequirements();

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Error getting role requirements:', error);
    return NextResponse.json(
      { error: 'Failed to get role requirements' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/role-requirements
 * Update role requirements (super_admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const dbUser = await db
      .select({
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.authId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (dbUser[0].staffRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, updates } = body;

    if (!role || !updates) {
      return NextResponse.json(
        { error: 'Role and updates are required' },
        { status: 400 }
      );
    }

    // Update requirements
    await db
      .update(roleRequirements)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(roleRequirements.role, role));

    const updatedRequirements = await getAllRoleRequirements();

    return NextResponse.json({
      message: 'Role requirements updated',
      requirements: updatedRequirements,
    });
  } catch (error) {
    console.error('Error updating role requirements:', error);
    return NextResponse.json(
      { error: 'Failed to update role requirements' },
      { status: 500 }
    );
  }
}
