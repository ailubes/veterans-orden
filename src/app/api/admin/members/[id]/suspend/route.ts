import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/members/[id]/suspend
 * Toggle member suspension status
 * Body: { reason?: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access (only super_admin and admin can suspend)
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can suspend members' },
        { status: 403 }
      );
    }

    // Get current member data
    const { data: member, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent suspending super_admin unless you are super_admin
    if (member.role === 'super_admin' && adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can suspend super admins' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const reason = body.reason || 'No reason provided';

    // Toggle suspension
    const newStatus = member.status === 'suspended' ? 'active' : 'suspended';
    const action = newStatus === 'suspended' ? AUDIT_ACTIONS.SUSPEND_MEMBER : AUDIT_ACTIONS.UNSUSPEND_MEMBER;

    // Update member status
    const { data: updatedMember, error: updateError } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/admin/members/[id]/suspend] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member status' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      oldData: { status: member.status },
      newData: { status: newStatus },
      metadata: { reason },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    // Log suspension in activity_log
    await supabase.from('activity_log').insert({
      user_id: id,
      action_type: newStatus === 'suspended' ? 'suspended' : 'unsuspended',
      description: `Акаунт ${newStatus === 'suspended' ? 'призупинено' : 'відновлено'}. Причина: ${reason}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        data: updatedMember,
        message:
          newStatus === 'suspended'
            ? 'Member suspended successfully'
            : 'Member unsuspended successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/admin/members/[id]/suspend]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
