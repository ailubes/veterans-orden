import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';
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
      .from('users')
      .select('id, first_name, last_name, email, membership_role, status')
      .eq('commandery_id', commanderyId)
      .eq('status', 'active')
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .limit(300);

    if (error) {
      console.error('[Commandery Members] Fetch failed:', error);
      return NextResponse.json({ error: 'Failed to fetch commandery members' }, { status: 500 });
    }

    return NextResponse.json({ members: data || [] });
  } catch (error) {
    console.error('[Commandery Members] GET unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
