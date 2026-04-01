import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import { hasAdminAccess } from '@/lib/permissions-utils';
import { isCommanderyCoordinator } from '@/lib/commanderies/permissions';

type PreparedVoteOption = {
  text: string;
  order: number;
  description: string | null;
  candidateUserId: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commanderyId = searchParams.get('commanderyId');

    if (!commanderyId) {
      return NextResponse.json({ error: 'commanderyId is required' }, { status: 400 });
    }

    const canCoordinate = await isCommanderyCoordinator(supabase, profile.id, commanderyId);
    const isAdmin = hasAdminAccess(
      profile.staff_role as 'none' | 'news_editor' | 'admin' | 'super_admin' | null,
      profile.membership_role as
        | 'supporter'
        | 'candidate'
        | 'member'
        | 'honorary_member'
        | 'network_leader'
        | 'regional_leader'
        | 'national_leader'
        | 'network_guide'
        | null
    );

    if (!canCoordinate && !isAdmin && profile.commandery_id !== commanderyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('votes')
      .select('id, title, description, type, scope, status, is_election, position_type, max_winners, start_date, end_date, total_votes, commandery_scope, created_by_id, created_at')
      .eq('commandery_scope', commanderyId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Commandery Votes] Fetch failed:', error);
      return NextResponse.json({ error: 'Failed to fetch commandery votes' }, { status: 500 });
    }

    return NextResponse.json({ votes: data || [] });
  } catch (error) {
    console.error('[Commandery Votes] GET unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const commanderyId = String(body?.commanderyId || '').trim();
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();
    const type = String(body?.type || 'multiple_choice').trim();
    const transparency = String(body?.transparency || 'anonymous').trim();
    const startDate = String(body?.startDate || '').trim();
    const endDate = String(body?.endDate || '').trim();
    const status = String(body?.status || 'active').trim();
    const options = Array.isArray(body?.options) ? body.options : [];
    const isElection = !!body?.isElection;
    const positionType = String(body?.positionType || '').trim();
    const maxWinners = Math.max(1, Math.min(Number(body?.maxWinners || 1), 2));
    const allowedElectionPositionTypes = ['deputy_commander'];

    if (!commanderyId || !title || !startDate || !endDate || options.length < 2) {
      return NextResponse.json({ error: 'commanderyId, title, startDate, endDate and at least 2 options are required' }, { status: 400 });
    }

    if (isElection) {
      if (!allowedElectionPositionTypes.includes(positionType)) {
        return NextResponse.json({ error: 'Unsupported election position type for commandery vote' }, { status: 400 });
      }

      if (maxWinners < 1 || maxWinners > 2) {
        return NextResponse.json({ error: 'maxWinners must be between 1 and 2' }, { status: 400 });
      }
    }

    const canCoordinate = await isCommanderyCoordinator(supabase, profile.id, commanderyId);
    const isAdmin = hasAdminAccess(
      profile.staff_role as 'none' | 'news_editor' | 'admin' | 'super_admin' | null,
      profile.membership_role as
        | 'supporter'
        | 'candidate'
        | 'member'
        | 'honorary_member'
        | 'network_leader'
        | 'regional_leader'
        | 'national_leader'
        | 'network_guide'
        | null
    );

    if (!canCoordinate && !isAdmin) {
      return NextResponse.json({ error: 'Only commandery coordinator can create local votes' }, { status: 403 });
    }

    const service = createServiceClient();
    const { data: vote, error: voteError } = await service
      .from('votes')
      .insert({
        title,
        description: description || null,
        type: isElection ? 'multiple_choice' : type,
        transparency,
        scope: 'regional',
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status: ['draft', 'active'].includes(status) ? status : 'active',
        created_by_id: profile.id,
        commandery_scope: commanderyId,
        is_election: isElection,
        position_type: isElection ? positionType : null,
        max_winners: isElection ? maxWinners : 1,
        eligible_roles: ['member', 'honorary_member', 'network_leader', 'regional_leader', 'national_leader', 'network_guide'],
      })
      .select('id, title, description, scope, status, start_date, end_date, commandery_scope, created_by_id')
      .single();

    if (voteError || !vote) {
      console.error('[Commandery Votes] Create vote failed:', voteError);
      return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
    }

    const preparedOptions: PreparedVoteOption[] = options
      .map((option: unknown, index: number) => {
        if (typeof option === 'string') {
          const text = option.trim();
          return { text, order: index, description: null, candidateUserId: null };
        }

        const objectOption = option as {
          text?: unknown;
          description?: unknown;
          candidateUserId?: unknown;
          candidate_user_id?: unknown;
        };
        const text = String(objectOption.text || '').trim();
        const descriptionValue = String(objectOption.description || '').trim();
        const candidateUserIdRaw = objectOption.candidateUserId || objectOption.candidate_user_id;
        const candidateUserId = String(candidateUserIdRaw || '').trim() || null;

        return {
          text,
          order: index,
          description: descriptionValue || null,
          candidateUserId,
        };
      })
      .filter((option: PreparedVoteOption) => option.text.length > 0);

    if (preparedOptions.length < 2) {
      return NextResponse.json({ error: 'At least 2 non-empty options are required' }, { status: 400 });
    }

    if (isElection) {
      if (preparedOptions.some((option) => !option.candidateUserId)) {
        return NextResponse.json({ error: 'Each election option must have candidateUserId' }, { status: 400 });
      }

      const candidateIds = Array.from(
        new Set(preparedOptions.map((option) => option.candidateUserId).filter(Boolean) as string[])
      );

      if (candidateIds.length < 2) {
        return NextResponse.json({ error: 'At least 2 unique candidates are required' }, { status: 400 });
      }

      const { data: candidates, error: candidatesError } = await service
        .from('users')
        .select('id, commandery_id, status')
        .in('id', candidateIds);

      if (candidatesError || !candidates || candidates.length !== candidateIds.length) {
        return NextResponse.json({ error: 'Some candidates were not found' }, { status: 400 });
      }

      const allFromCommandery = candidates.every(
        (candidate) => candidate.status === 'active' && candidate.commandery_id === commanderyId
      );

      if (!allFromCommandery) {
        return NextResponse.json(
          { error: 'All candidates must be active members of this commandery' },
          { status: 400 }
        );
      }
    }

    const { error: optionsError } = await service
      .from('vote_options')
      .insert(preparedOptions.map((option: PreparedVoteOption) => ({
        vote_id: vote.id,
        text: option.text,
        description: option.description || null,
        candidate_user_id: option.candidateUserId || null,
        order: option.order,
      })));

    if (optionsError) {
      console.error('[Commandery Votes] Create options failed:', optionsError);
      return NextResponse.json({ error: 'Vote was created but options failed to save' }, { status: 500 });
    }

    return NextResponse.json({ vote }, { status: 201 });
  } catch (error) {
    console.error('[Commandery Votes] POST unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
