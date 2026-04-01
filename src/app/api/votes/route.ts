import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/votes
 *
 * Returns active votes eligible for the current user's role.
 *
 * Query params:
 * - limit: number (default: 20, max: 50)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile (need role + membership + commandery for eligibility filter)
    const { data: profile } = await supabase
      .from('users')
      .select('id, role, membership_role, commandery_id, status')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch active votes and filter by eligibility in code
    const { data: votes, error: dbError } = await supabase
      .from('votes')
      .select(
        `
        id,
        title,
        description,
        is_election,
        position_type,
        commandery_scope,
        eligible_roles,
        end_date,
        vote_options (id, text)
      `
      )
      .eq('status', 'active')
      .order('end_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (dbError) {
      console.error('[Votes API] Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const membership = profile.membership_role as string | null;
    const legacyRole = profile.role as string | null;
    const eligibleMembershipForPrimaries = new Set([
      'member',
      'honorary_member',
      'network_leader',
      'regional_leader',
      'national_leader',
      'network_guide',
    ]);

    const filteredVotes = (votes || []).filter((vote) => {
      if (vote.is_election && vote.commandery_scope) {
        if (profile.status !== 'active') return false;
        if (!profile.commandery_id || profile.commandery_id !== vote.commandery_scope) return false;
        return !!membership && eligibleMembershipForPrimaries.has(membership);
      }

      if (vote.commandery_scope) {
        if (profile.status !== 'active') return false;
        return !!profile.commandery_id && profile.commandery_id === vote.commandery_scope;
      }

      const eligibleRoles = (vote.eligible_roles || []) as string[];
      if (eligibleRoles.length === 0) return true;
      return (legacyRole ? eligibleRoles.includes(legacyRole) : false)
        || (membership ? eligibleRoles.includes(membership) : false);
    });

    return NextResponse.json({ votes: filteredVotes });
  } catch (error) {
    console.error('[Votes API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
