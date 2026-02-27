import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// GET /api/follows/followers - Get followers list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUserId = userId || user.id;

    let query = supabase
      .from('follows')
      .select(`
        *,
        follower:users!follows_follower_id_fkey(id, display_name, avatar_url, military_unit, position, bio)
      `)
      .eq('following_id', targetUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: followers, error } = await query;

    if (error) {
      console.error('Error fetching followers:', error);
      return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
    }

    // Check if current user follows each follower
    const followerIds = followers?.map(f => f.follower_id) || [];
    const { data: followingStatus } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', followerIds)
      .eq('status', 'active');

    const followingIds = new Set(followingStatus?.map(f => f.following_id) || []);

    const formattedFollowers = followers?.map(f => ({
      ...f.follower,
      follows_you: followingIds.has(f.follower_id),
      followed_at: f.created_at,
    })) || [];

    const nextCursor = followers?.length === limit
      ? followers[followers.length - 1].created_at
      : null;

    return NextResponse.json({
      followers: formattedFollowers,
      nextCursor,
    });
  } catch (error) {
    console.error('Error in GET /api/follows/followers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
