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
 * GET /api/admin/votes/[id]
 * Get vote details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vote data
    const { data: vote, error } = await supabase
      .from('votes')
      .select('*, created_by_user:users!votes_created_by_fkey(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (error || !vote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    return NextResponse.json({ data: vote }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/votes/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/votes/[id]
 * Update vote (only draft votes can be edited)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access (only super_admin and admin can edit votes)
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can edit votes' },
        { status: 403 }
      );
    }

    // Get current vote data
    const { data: currentVote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentVote) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Only draft votes can be edited
    if (currentVote.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft votes can be edited' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.question !== undefined) updateData.question = body.question;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.vote_type !== undefined) updateData.vote_type = body.vote_type;
    if (body.transparency !== undefined) updateData.transparency = body.transparency;
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.requires_quorum !== undefined) updateData.requires_quorum = body.requires_quorum;
    if (body.quorum_percentage !== undefined) updateData.quorum_percentage = body.quorum_percentage;
    if (body.allow_change_vote !== undefined) updateData.allow_change_vote = body.allow_change_vote;
    if (body.status !== undefined) updateData.status = body.status;

    // Update vote
    const { data: updatedVote, error: updateError } = await supabase
      .from('votes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH /api/admin/votes/[id]] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vote' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.UPDATE_VOTE,
      entityType: AUDIT_ENTITY_TYPES.VOTE,
      entityId: id,
      oldData: currentVote,
      newData: updatedVote,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: updatedVote }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/admin/votes/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/votes/[id]
 * Delete vote (only if no votes have been cast)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check admin access
    const adminProfile = await getAdminProfile();
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can delete votes' },
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

    // Check if any votes have been cast
    const { count: ballotsCount } = await supabase
      .from('vote_ballots')
      .select('*', { count: 'exact', head: true })
      .eq('vote_id', id);

    if (ballotsCount && ballotsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete vote with ${ballotsCount} cast ballots` },
        { status: 400 }
      );
    }

    // Delete vote options first
    await supabase
      .from('vote_options')
      .delete()
      .eq('vote_id', id);

    // Delete vote
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[DELETE /api/admin/votes/[id]] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete vote' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.DELETE_VOTE,
      entityType: AUDIT_ENTITY_TYPES.VOTE,
      entityId: id,
      oldData: vote,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      { message: 'Vote deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/votes/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
