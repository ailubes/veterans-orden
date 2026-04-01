import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { hasAdminAccess } from '@/lib/permissions-utils';
import { isCommanderyCoordinator } from '@/lib/commanderies/permissions';

function toMonthDate(raw: string) {
  const normalized = raw?.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get('mine') !== 'false';

    let query = supabase
      .from('commandery_mvp_reports')
      .select('id, commandery_id, report_month, active_members_count, monthly_meetings_count, monthly_local_actions_count, what_done, what_planned, what_needed, is_mvp_compliant, submitted_by_id, created_at, updated_at, commandery:commanderies(id, name, code, leader_id)')
      .order('report_month', { ascending: false })
      .limit(24);

    if (mineOnly) {
      const { data: ledCommanderies } = await supabase
        .from('commanderies')
        .select('id')
        .eq('leader_id', profile.id);

      const { data: coordinatedRoles } = await supabase
        .from('user_org_roles')
        .select('commandery_id')
        .eq('user_id', profile.id)
        .in('role_type', ['regional_coordinator', 'komandant', 'deputy_commander'])
        .eq('is_active', true)
        .not('commandery_id', 'is', null);

      const ids = Array.from(
        new Set([
          ...(ledCommanderies || []).map((item) => item.id),
          ...(coordinatedRoles || []).map((item) => item.commandery_id).filter(Boolean),
        ])
      );
      if (ids.length === 0) {
        return NextResponse.json({ reports: [] });
      }

      query = query.in('commandery_id', ids);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Commandery MVP] Failed to fetch reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    return NextResponse.json({ reports: data || [] });
  } catch (error) {
    console.error('[Commandery MVP] GET unexpected error:', error);
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
    const commanderyId = String(body?.commanderyId || body?.commandery_id || '').trim();
    const reportMonth = toMonthDate(String(body?.reportMonth || body?.report_month || '').trim());

    const activeMembersCount = Number(body?.activeMembersCount ?? body?.active_members_count);
    const monthlyMeetingsCount = Number(body?.monthlyMeetingsCount ?? body?.monthly_meetings_count);
    const monthlyLocalActionsCount = Number(body?.monthlyLocalActionsCount ?? body?.monthly_local_actions_count);

    const whatDone = String(body?.whatDone || body?.what_done || '').trim();
    const whatPlanned = String(body?.whatPlanned || body?.what_planned || '').trim();
    const whatNeeded = String(body?.whatNeeded || body?.what_needed || '').trim();

    if (!commanderyId) {
      return NextResponse.json({ error: 'commanderyId is required' }, { status: 400 });
    }

    if (!reportMonth) {
      return NextResponse.json({ error: 'reportMonth must be YYYY-MM-DD' }, { status: 400 });
    }

    if (!Number.isInteger(activeMembersCount) || activeMembersCount < 0) {
      return NextResponse.json({ error: 'activeMembersCount must be non-negative integer' }, { status: 400 });
    }

    if (!Number.isInteger(monthlyMeetingsCount) || monthlyMeetingsCount < 0) {
      return NextResponse.json({ error: 'monthlyMeetingsCount must be non-negative integer' }, { status: 400 });
    }

    if (!Number.isInteger(monthlyLocalActionsCount) || monthlyLocalActionsCount < 0) {
      return NextResponse.json({ error: 'monthlyLocalActionsCount must be non-negative integer' }, { status: 400 });
    }

    if (!whatDone || !whatPlanned || !whatNeeded) {
      return NextResponse.json({ error: 'Report text fields are required' }, { status: 400 });
    }

    const { data: commandery, error: commanderyError } = await supabase
      .from('commanderies')
      .select('id, leader_id')
      .eq('id', commanderyId)
      .single();

    if (commanderyError || !commandery) {
      return NextResponse.json({ error: 'Commandery not found' }, { status: 404 });
    }

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

    const canCoordinate = await isCommanderyCoordinator(supabase, profile.id, commanderyId);
    if (!isAdmin && !canCoordinate) {
      return NextResponse.json({ error: 'Only commandery coordinator can submit this report' }, { status: 403 });
    }

    const isMvpCompliant =
      activeMembersCount >= 2
      && activeMembersCount <= 5
      && monthlyMeetingsCount >= 1
      && monthlyLocalActionsCount >= 1;

    const { data, error } = await supabase
      .from('commandery_mvp_reports')
      .upsert({
        commandery_id: commanderyId,
        report_month: reportMonth,
        active_members_count: activeMembersCount,
        monthly_meetings_count: monthlyMeetingsCount,
        monthly_local_actions_count: monthlyLocalActionsCount,
        what_done: whatDone,
        what_planned: whatPlanned,
        what_needed: whatNeeded,
        is_mvp_compliant: isMvpCompliant,
        submitted_by_id: profile.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'commandery_id,report_month',
      })
      .select('id, commandery_id, report_month, active_members_count, monthly_meetings_count, monthly_local_actions_count, what_done, what_planned, what_needed, is_mvp_compliant, submitted_by_id, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Commandery MVP] Failed to upsert report:', error);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    console.error('[Commandery MVP] POST unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
