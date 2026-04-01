import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';
import { createServiceClient } from '@/lib/supabase/server';

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

    let electionAssignment: {
      assigned: boolean;
      winnerUserId?: string;
      winnerUserIds?: string[];
      warning?: string;
    } | null = null;

    if (
      vote.is_election
      && ['regional_coordinator', 'deputy_commander'].includes(vote.position_type)
      && vote.commandery_scope
    ) {
      const serviceSupabase = createServiceClient();
      const { data: rankedOptions, error: optionsError } = await serviceSupabase
        .from('vote_options')
        .select('id, vote_count, candidate_user_id, order')
        .eq('vote_id', id)
        .order('vote_count', { ascending: false })
        .order('order', { ascending: true })
        .limit(50);

      const desiredWinners = vote.position_type === 'deputy_commander'
        ? Math.max(1, Math.min(Number(vote.max_winners || 2), 2))
        : 1;
      const roleScope = vote.position_type === 'deputy_commander' ? 'local' : 'regional';

      const positiveCandidates = (rankedOptions || []).filter(
        (option) => (option.vote_count || 0) > 0 && !!option.candidate_user_id
      );

      if (optionsError || !rankedOptions || rankedOptions.length === 0) {
        electionAssignment = {
          assigned: false,
          warning: 'Праймеріз закрито, але не вдалося визначити переможця',
        };
      } else if (positiveCandidates.length === 0) {
        electionAssignment = {
          assigned: false,
          warning: 'Праймеріз закрито без голосів',
        };
      } else if (positiveCandidates.length <= desiredWinners) {
        const winnerUserIds = positiveCandidates.map((candidate) => candidate.candidate_user_id as string);

        await serviceSupabase
          .from('user_org_roles')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
            deactivation_reason: `Replaced by primaries vote ${id}`,
          })
          .eq('role_type', vote.position_type)
          .eq('scope', roleScope)
          .eq('commandery_id', vote.commandery_scope)
          .eq('is_active', true);

        await serviceSupabase
          .from('user_org_roles')
          .insert(
            winnerUserIds.map((winnerUserId) => ({
              user_id: winnerUserId,
              role_type: vote.position_type,
              scope: roleScope,
              commandery_id: vote.commandery_scope,
              appointed_by: adminProfile.id,
              election_id: id,
              appointment_notes: `Elected by primaries vote ${id}`,
              term_start: new Date().toISOString(),
              is_active: true,
            }))
          );

        if (vote.position_type === 'regional_coordinator' && winnerUserIds[0]) {
          const winnerUserId = winnerUserIds[0];

          await serviceSupabase
            .from('commanderies')
            .update({
              leader_id: winnerUserId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', vote.commandery_scope);

          await serviceSupabase
            .from('users')
            .update({
              membership_role: 'regional_leader',
              role_advanced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', winnerUserId)
            .in('membership_role', ['supporter', 'candidate', 'member', 'honorary_member', 'network_leader']);

          electionAssignment = {
            assigned: true,
            winnerUserId,
            winnerUserIds,
          };
        } else {
          electionAssignment = {
            assigned: true,
            winnerUserIds,
          };
        }
      } else if (
        (positiveCandidates[desiredWinners - 1]?.vote_count || 0)
        === (positiveCandidates[desiredWinners]?.vote_count || -1)
      ) {
        electionAssignment = {
          assigned: false,
          warning: 'Виявлено нічию на межі переможців. Призначення потрібно зробити вручну',
        };
      } else {
        const winnerUserIds = positiveCandidates
          .slice(0, desiredWinners)
          .map((candidate) => candidate.candidate_user_id as string);

        await serviceSupabase
          .from('user_org_roles')
          .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
            deactivation_reason: `Replaced by primaries vote ${id}`,
          })
          .eq('role_type', vote.position_type)
          .eq('scope', roleScope)
          .eq('commandery_id', vote.commandery_scope)
          .eq('is_active', true);

        await serviceSupabase
          .from('user_org_roles')
          .insert(
            winnerUserIds.map((winnerUserId) => ({
              user_id: winnerUserId,
              role_type: vote.position_type,
              scope: roleScope,
              commandery_id: vote.commandery_scope,
              appointed_by: adminProfile.id,
              election_id: id,
              appointment_notes: `Elected by primaries vote ${id}`,
              term_start: new Date().toISOString(),
              is_active: true,
            }))
          );

        if (vote.position_type === 'regional_coordinator' && winnerUserIds[0]) {
          const winnerUserId = winnerUserIds[0];

          await serviceSupabase
            .from('commanderies')
            .update({
              leader_id: winnerUserId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', vote.commandery_scope);

          await serviceSupabase
            .from('users')
            .update({
              membership_role: 'regional_leader',
              role_advanced_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', winnerUserId)
            .in('membership_role', ['supporter', 'candidate', 'member', 'honorary_member', 'network_leader']);

          electionAssignment = {
            assigned: true,
            winnerUserId,
            winnerUserIds,
          };
        } else {
          electionAssignment = {
            assigned: true,
            winnerUserIds,
          };
        }
      }
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
        electionAssignment,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    console.error('[POST /api/admin/votes/[id]/close]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
