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
 * POST /api/admin/members/[id]/verify
 * Manually verify member identity
 * Body: { verifyType: 'email' | 'phone' | 'identity', method?: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Identity verification requires admin or super_admin
    const body = await request.json();
    const { verifyType, method = 'Manual verification by admin' } = body;

    if (
      verifyType === 'identity' &&
      adminProfile.role === 'regional_leader'
    ) {
      return NextResponse.json(
        { error: 'Only admins can verify identity' },
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

    // Determine which field to update
    const updateField =
      verifyType === 'email'
        ? 'email_verified'
        : verifyType === 'phone'
        ? 'phone_verified'
        : 'identity_verified';

    // Toggle verification status
    const newValue = !member[updateField];

    // Update member
    const { data: updatedMember, error: updateError } = await supabase
      .from('users')
      .update({ [updateField]: newValue })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/admin/members/[id]/verify] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.VERIFY_MEMBER,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      oldData: { [updateField]: member[updateField] },
      newData: { [updateField]: newValue },
      metadata: { verifyType, method },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    // Log verification in activity_log
    const verifyTypeLabels = {
      email: 'Email',
      phone: 'Телефон',
      identity: 'Особу',
    };

    await supabase.from('activity_log').insert({
      user_id: id,
      action_type: 'verification_update',
      description: `${verifyTypeLabels[verifyType as keyof typeof verifyTypeLabels]} ${newValue ? 'підтверджено' : 'скасовано підтвердження'}. Метод: ${method}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        data: updatedMember,
        message: `${verifyType} verification ${newValue ? 'enabled' : 'disabled'} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/admin/members/[id]/verify]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
