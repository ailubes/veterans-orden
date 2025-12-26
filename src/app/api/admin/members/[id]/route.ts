import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { checkReferralTreeAccess } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/members/[id]
 * Get member details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check regional leader access
    if (adminProfile.role === 'regional_leader') {
      const hasAccess = await checkReferralTreeAccess(adminProfile.id, id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get member data
    const { data: member, error } = await supabase
      .from('users')
      .select('*, oblast:oblasts(name)')
      .eq('id', id)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ data: member }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/members/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/members/[id]
 * Update member details
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check regional leader access
    if (adminProfile.role === 'regional_leader') {
      const hasAccess = await checkReferralTreeAccess(adminProfile.id, id);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get current member data (for audit log)
    const { data: oldMember, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !oldMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate role change permissions
    if (body.role && body.role !== oldMember.role) {
      if (adminProfile.role === 'regional_leader') {
        return NextResponse.json(
          { error: 'Regional leaders cannot change roles' },
          { status: 403 }
        );
      }

      if (
        adminProfile.role === 'admin' &&
        (oldMember.role === 'super_admin' || body.role === 'super_admin')
      ) {
        return NextResponse.json(
          { error: 'Only super admins can modify super admin role' },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Personal info
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.patronymic !== undefined) updateData.patronymic = body.patronymic;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.date_of_birth !== undefined)
      updateData.date_of_birth = body.date_of_birth;

    // Location
    if (body.oblast_id !== undefined) updateData.oblast_id = body.oblast_id;
    if (body.city !== undefined) updateData.city = body.city;

    // Role and status (with permission checks)
    if (
      body.role !== undefined &&
      adminProfile.role !== 'regional_leader'
    ) {
      updateData.role = body.role;
    }
    if (
      body.status !== undefined &&
      adminProfile.role !== 'regional_leader'
    ) {
      updateData.status = body.status;
    }

    // Verification
    if (body.is_email_verified !== undefined)
      updateData.is_email_verified = body.is_email_verified;
    if (body.is_phone_verified !== undefined)
      updateData.is_phone_verified = body.is_phone_verified;
    if (
      body.is_identity_verified !== undefined &&
      adminProfile.role !== 'regional_leader'
    ) {
      updateData.is_identity_verified = body.is_identity_verified;
    }

    // Membership
    if (body.membership_tier !== undefined)
      updateData.membership_tier = body.membership_tier;
    if (body.paid_until !== undefined) updateData.paid_until = body.paid_until;

    // Update member
    const { data: updatedMember, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH /api/admin/members/[id]] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update member' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.UPDATE_MEMBER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      oldData: oldMember,
      newData: updatedMember,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: updatedMember }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/admin/members/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/members/[id]
 * Soft delete member (set status to 'deleted')
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can delete members' },
        { status: 403 }
      );
    }

    // Get current member data (for audit log)
    const { data: member, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent deleting super_admin unless you are super_admin
    if (member.role === 'super_admin' && adminProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can delete super admins' },
        { status: 403 }
      );
    }

    // Soft delete (set status to deleted)
    const { error: deleteError } = await supabase
      .from('users')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (deleteError) {
      console.error('[DELETE /api/admin/members/[id]] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete member' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.DELETE_MEMBER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      oldData: member,
      newData: { status: 'deleted' },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      { message: 'Member deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/members/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
