import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/votes/[id]/close
 * Close an active vote early
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check admin access
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can close votes' },
        { status: 403 }
      );
    }

    // Get current vote data
    const { data: vote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Only active votes can be closed
    if (vote.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active votes can be closed' },
        { status: 400 }
      );
    }

    // Close vote
    const { data: closedVote, error: updateError } = await supabase
      .from('votes')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/admin/votes/[id]/close] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to close vote' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.CLOSE_VOTE,
      entityType: AUDIT_ENTITY_TYPES.VOTE,
      entityId: id,
      oldData: { status: vote.status },
      newData: { status: 'closed' },
      metadata: { reason: 'Closed early by admin' },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        data: closedVote,
        message: 'Vote closed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/admin/votes/[id]/close]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
