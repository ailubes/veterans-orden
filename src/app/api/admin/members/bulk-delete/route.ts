import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, isSuperAdmin } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/members/bulk-delete
 * Bulk delete members (super admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Only super admins can bulk delete
    if (!isSuperAdmin(adminProfile.role)) {
      return NextResponse.json(
        { error: 'Only super admins can delete members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberIds } = body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: 'Member IDs are required' },
        { status: 400 }
      );
    }

    // Prevent deleting other super admins or yourself
    const { data: membersToDelete } = await supabase
      .from('users')
      .select('id, role, email')
      .in('id', memberIds);

    if (membersToDelete) {
      // Check for super admins
      const hasSuperAdmin = membersToDelete.some((m) => m.role === 'super_admin');
      if (hasSuperAdmin) {
        return NextResponse.json(
          { error: 'Cannot delete super admin accounts' },
          { status: 403 }
        );
      }

      // Check if trying to delete self
      const isSelf = membersToDelete.some((m) => m.id === adminProfile.id);
      if (isSelf) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 403 }
        );
      }
    }

    // Delete members
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .in('id', memberIds);

    if (deleteError) {
      console.error('Bulk delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete members' },
        { status: 500 }
      );
    }

    // Create audit log entries
    const auditEntries = memberIds.map((memberId) => ({
      admin_id: adminProfile.id,
      action: 'bulk_delete',
      entity_type: 'user',
      entity_id: memberId,
      metadata: { deleted_count: memberIds.length },
    }));

    await supabase.from('audit_logs').insert(auditEntries);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${memberIds.length} members`,
    });
  } catch (error) {
    console.error('[Bulk Delete Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
