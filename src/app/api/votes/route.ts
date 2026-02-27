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

    // Get user profile (need id and role for eligibility filter)
    const { data: profile } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch active votes where eligible_roles contains the user's role
    const { data: votes, error: dbError } = await supabase
      .from('votes')
      .select(
        `
        id,
        title,
        description,
        end_date,
        vote_options (id, text)
      `
      )
      .eq('status', 'active')
      .contains('eligible_roles', [profile.role])
      .order('end_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (dbError) {
      console.error('[Votes API] Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ votes: votes || [] });
  } catch (error) {
    console.error('[Votes API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
