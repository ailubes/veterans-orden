import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/follows/following - Get following list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = profile?.id || user.id;

    const targetUserId = userId || dbUserId;

    let query = supabase
      .from('follows')
      .select(`
        *,
        following:users!follows_following_id_fkey(id, display_name, avatar_url, military_unit, position, bio)
      `)
      .eq('follower_id', targetUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: following, error } = await query;

    if (error) {
      console.error('Error fetching following:', error);
      return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
    }

    // Check if each followed user follows back (only if viewing own following list)
    const isOwnList = targetUserId === dbUserId;
    let followingIds: Set<string> = new Set();

    if (!isOwnList) {
      const { data: followBackStatus } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', dbUserId)
        .in('follower_id', following?.map(f => f.following_id) || [])
        .eq('status', 'active');

      followingIds = new Set(followBackStatus?.map(f => f.follower_id) || []);
    }

    const formattedFollowing = following?.map(f => ({
      ...f.following,
      follows_you: isOwnList ? false : followingIds.has(f.following_id),
      followed_at: f.created_at,
    })) || [];

    const nextCursor = following?.length === limit
      ? following[following.length - 1].created_at
      : null;

    return NextResponse.json({
      following: formattedFollowing,
      nextCursor,
    });
  } catch (error) {
    console.error('Error in GET /api/follows/following:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
