import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import { hasAdminAccess } from '@/lib/permissions-utils';
import { isCommanderyCoordinator } from '@/lib/commanderies/permissions';

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
      .from('events')
      .select('id, title, description, type, scope, status, is_online, online_url, location, start_date, end_date, commandery_id, organizer_id, created_at')
      .eq('commandery_id', commanderyId)
      .order('start_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[Commandery Events] Fetch failed:', error);
      return NextResponse.json({ error: 'Failed to fetch commandery events' }, { status: 500 });
    }

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    console.error('[Commandery Events] GET unexpected error:', error);
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
    const type = String(body?.type || 'meeting').trim();
    const isOnline = !!body?.isOnline;
    const onlineUrl = String(body?.onlineUrl || '').trim();
    const locationAddress = String(body?.locationAddress || '').trim();
    const startDate = String(body?.startDate || '').trim();
    const endDate = String(body?.endDate || '').trim();
    const status = String(body?.status || 'published').trim();

    if (!commanderyId || !title || !startDate || !endDate) {
      return NextResponse.json({ error: 'commanderyId, title, startDate, endDate are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Only commandery coordinator can create events' }, { status: 403 });
    }

    const service = createServiceClient();
    const { data, error } = await service
      .from('events')
      .insert({
        title,
        description: description || null,
        type,
        scope: 'local',
        status: ['draft', 'published'].includes(status) ? status : 'published',
        is_online: isOnline,
        online_url: isOnline ? onlineUrl || null : null,
        location: isOnline ? null : (locationAddress ? { address: locationAddress } : null),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        commandery_id: commanderyId,
        organizer_id: profile.id,
      })
      .select('id, title, description, type, scope, status, is_online, online_url, location, start_date, end_date, commandery_id, organizer_id, created_at')
      .single();

    if (error) {
      console.error('[Commandery Events] Create failed:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    console.error('[Commandery Events] POST unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
