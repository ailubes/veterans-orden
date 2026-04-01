import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 *
 * Returns list of published events, ordered by start_date ASC.
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

    const { data: profile } = await supabase
      .from('users')
      .select('commandery_id')
      .eq('auth_id', user.id)
      .single();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('events')
      .select(
        'id, title, description, start_date, end_date, going_count, maybe_count, is_online, online_url, location, image_url, commandery_id'
      )
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (profile?.commandery_id) {
      query = query.or(`commandery_id.is.null,commandery_id.eq.${profile.commandery_id}`);
    } else {
      query = query.is('commandery_id', null);
    }

    const { data: events, error: dbError } = await query.range(offset, offset + limit - 1);

    if (dbError) {
      console.error('[Events API] Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('[Events API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
