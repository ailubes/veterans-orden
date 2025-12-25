import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/members/[id]/adjust-points
 * Manually adjust member points
 * Body: { adjustment: number, reason: string }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can adjust points' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { adjustment, reason } = body;

    // Validate inputs
    if (typeof adjustment !== 'number' || adjustment === 0) {
      return NextResponse.json(
        { error: 'Adjustment must be a non-zero number' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required for points adjustment' },
        { status: 400 }
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

    // Calculate new points
    const oldPoints = member.points || 0;
    const newPoints = Math.max(0, oldPoints + adjustment); // Ensure points don't go below 0

    // Update member points
    const { data: updatedMember, error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/admin/members/[id]/adjust-points] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to adjust points' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.ADJUST_POINTS,
      entityType: AUDIT_ENTITY_TYPES.USER,
      entityId: id,
      oldData: { points: oldPoints },
      newData: { points: newPoints },
      metadata: { adjustment, reason },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    // Log adjustment in activity_log
    await supabase.from('activity_log').insert({
      user_id: id,
      action_type: 'points_adjustment',
      description: `Адмін змінив бали: ${adjustment > 0 ? '+' : ''}${adjustment}. Причина: ${reason}`,
      points_earned: adjustment,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        data: updatedMember,
        message: 'Points adjusted successfully',
        adjustment: {
          old: oldPoints,
          new: newPoints,
          change: adjustment,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/admin/members/[id]/adjust-points]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
