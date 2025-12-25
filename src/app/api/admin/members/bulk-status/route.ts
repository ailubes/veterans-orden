import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, canSuspendMembers } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/members/bulk-status
 * Bulk update member status (activate or suspend)
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const body = await request.json();
    const { memberIds, status } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }

    if (!status || !['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "suspended"' },
        { status: 400 }
      );
    }

    // Check permission for suspend
    if (status === 'suspended' && !canSuspendMembers(adminProfile.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to suspend members' },
        { status: 403 }
      );
    }

    // Update member statuses
    const { error: updateError } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', memberIds);

    if (updateError) {
      console.error('Bulk status update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member statuses' },
        { status: 500 }
      );
    }

    // Create audit log entry for each member
    const auditEntries = memberIds.map((memberId) => ({
      admin_id: adminProfile.id,
      action: `bulk_${status}`,
      entity_type: 'user',
      entity_id: memberId,
      metadata: { status },
    }));

    await supabase.from('audit_logs').insert(auditEntries);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${memberIds.length} members to ${status}`,
    });
  } catch (error) {
    console.error('[Bulk Status Update Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
