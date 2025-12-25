import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, getRegionalLeaderFilter } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/search?q=query
 * Global search across members, events, votes, tasks, news
 */
export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const leaderFilter = await getRegionalLeaderFilter(adminProfile);

    // Search members
    let membersQuery = supabase
      .from('users')
      .select('id, first_name, last_name, email, role, status')
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
      )
      .limit(5);

    if (leaderFilter.filterType === 'referral_tree' && leaderFilter.userIds) {
      membersQuery = membersQuery.in('id', leaderFilter.userIds);
    }

    const { data: members } = await membersQuery;

    // Search events
    const { data: events } = await supabase
      .from('events')
      .select('id, title, status, start_date')
      .ilike('title', `%${query}%`)
      .limit(5);

    // Search votes
    const { data: votes } = await supabase
      .from('votes')
      .select('id, title, status, end_date')
      .ilike('title', `%${query}%`)
      .limit(5);

    // Search tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, points')
      .ilike('title', `%${query}%`)
      .limit(5);

    // Search news
    const { data: news } = await supabase
      .from('news')
      .select('id, title, status, published_at')
      .ilike('title', `%${query}%`)
      .limit(5);

    // Format results
    const results = [
      ...(members || []).map((m) => ({
        id: m.id,
        type: 'member' as const,
        title: `${m.first_name} ${m.last_name}`,
        subtitle: m.email || '',
        url: `/admin/members/${m.id}`,
        meta: `${m.role} • ${m.status}`,
      })),
      ...(events || []).map((e) => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        subtitle: new Date(e.start_date).toLocaleDateString('uk-UA'),
        url: `/admin/events/${e.id}`,
        meta: e.status,
      })),
      ...(votes || []).map((v) => ({
        id: v.id,
        type: 'vote' as const,
        title: v.title,
        subtitle: `До ${new Date(v.end_date).toLocaleDateString('uk-UA')}`,
        url: `/admin/votes/${v.id}`,
        meta: v.status,
      })),
      ...(tasks || []).map((t) => ({
        id: t.id,
        type: 'task' as const,
        title: t.title,
        subtitle: `${t.points} балів`,
        url: `/admin/tasks/${t.id}`,
        meta: t.status,
      })),
      ...(news || []).map((n) => ({
        id: n.id,
        type: 'news' as const,
        title: n.title,
        subtitle: n.published_at
          ? new Date(n.published_at).toLocaleDateString('uk-UA')
          : 'Не опубліковано',
        url: `/admin/news/${n.id}`,
        meta: n.status,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('[Search Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
