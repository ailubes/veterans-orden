import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, organizationSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/admin/settings/advancement-mode
 * Get the current advancement mode setting
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
      .where(eq(users.clerkId, authUser.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const staffRole = dbUser[0].staffRole;
    if (!['admin', 'super_admin'].includes(staffRole || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get the advancement mode setting
    const setting = await db
      .select()
      .from(organizationSettings)
      .where(eq(organizationSettings.key, 'role_advancement_mode'))
      .limit(1);

    const mode = setting[0]?.value
      ? (typeof setting[0].value === 'string'
          ? setting[0].value
          : (setting[0].value as { mode?: string }).mode || 'automatic')
      : 'automatic';

    return NextResponse.json({ mode });
  } catch (error) {
    console.error('Error getting advancement mode:', error);
    return NextResponse.json(
      { error: 'Failed to get advancement mode' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings/advancement-mode
 * Update the advancement mode setting (super_admin only)
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
        id: users.id,
        staffRole: users.staffRole,
      })
      .from(users)
      .where(eq(users.clerkId, authUser.id))
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
    const { mode } = body;

    if (!mode || !['automatic', 'approval_required'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "automatic" or "approval_required"' },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existing = await db
      .select()
      .from(organizationSettings)
      .where(eq(organizationSettings.key, 'role_advancement_mode'))
      .limit(1);

    if (existing.length > 0) {
      // Update existing setting
      await db
        .update(organizationSettings)
        .set({
          value: mode,
          updatedAt: new Date(),
          updatedBy: dbUser[0].id,
        })
        .where(eq(organizationSettings.key, 'role_advancement_mode'));
    } else {
      // Insert new setting
      await db.insert(organizationSettings).values({
        key: 'role_advancement_mode',
        value: mode,
        updatedBy: dbUser[0].id,
      });
    }

    return NextResponse.json({
      success: true,
      mode,
    });
  } catch (error) {
    console.error('Error updating advancement mode:', error);
    return NextResponse.json(
      { error: 'Failed to update advancement mode' },
      { status: 500 }
    );
  }
}
