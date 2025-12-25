import { getAdminProfileFromRequest, canChangeRole, UserRole } from '@/lib/permissions';
import { createAuditLog } from '@/lib/audit';
import { NextResponse } from 'next/server';

// POST - Assign/change user role
export async function POST(request: Request) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Regional leaders cannot change roles
    if (adminProfile.role === 'regional_leader') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body as { userId: string; newRole: UserRole };

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'userId and newRole are required' },
        { status: 400 }
      );
    }

    // Get current user data
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if admin can change this role
    const canChange = canChangeRole(adminProfile.role, targetUser.role as UserRole, newRole);
    if (!canChange) {
      return NextResponse.json(
        { error: 'You do not have permission to change this role' },
        { status: 403 }
      );
    }

    // Update the role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: 'update_user_role',
      entityType: 'user',
      entityId: userId,
      oldData: { role: targetUser.role },
      newData: { role: newRole },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...targetUser,
        role: newRole,
      },
    });
  } catch (error) {
    console.error('[Role Assignment Error]', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}
