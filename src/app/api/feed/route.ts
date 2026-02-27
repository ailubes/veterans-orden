import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// GET /api/feed - Get personalized feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'mixed'; // mixed, posts, activity

    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .eq('status', 'active');

    const followingIds = following?.map(f => f.following_id) || [];
    followingIds.push(user.id); // Include own content

    let posts: unknown[] = [];
    let activities: unknown[] = [];

    // Fetch posts from followed users
    if (type === 'mixed' || type === 'posts') {
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(id, display_name, avatar_url, military_unit, position),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .in('author_id', followingIds)
        .or('visibility.eq.public,and(visibility.eq.followers,author_id.in.(' + followingIds.join(',') + '))')
        .order('created_at', { ascending: false })
        .limit(type === 'mixed' ? Math.ceil(limit * 0.7) : limit);

      if (cursor) {
        postsQuery = postsQuery.lt('created_at', cursor);
      }

      const { data: postsData, error: postsError } = await postsQuery;

      if (postsError) {
        console.error('Error fetching feed posts:', postsError);
      } else {
        posts = postsData || [];
      }
    }

    // Fetch activity log
    if (type === 'mixed' || type === 'activity') {
      let activityQuery = supabase
        .from('activity_log')
        .select(`
          *,
          actor:users!activity_log_actor_id_fkey(id, display_name, avatar_url)
        `)
        .in('actor_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(type === 'mixed' ? Math.ceil(limit * 0.3) : limit);

      if (cursor) {
        activityQuery = activityQuery.lt('created_at', cursor);
      }

      const { data: activityData, error: activityError } = await activityQuery;

      if (activityError) {
        console.error('Error fetching activity log:', activityError);
      } else {
        activities = activityData || [];
      }
    }

    // Get user's likes for posts
    const postIds = (posts as { id: string }[]).map((p) => p.id);
    const { data: userLikes } = await supabase
      .from('likes')
      .select('target_id, reaction_type')
      .eq('user_id', user.id)
      .eq('target_type', 'post')
      .in('target_id', postIds);

    const userLikesMap = new Map(userLikes?.map(l => [l.target_id, l.reaction_type]) || []);

    // Format posts
    const formattedPosts = (posts as Array<{
      id: string;
      likes_count?: { count: number }[];
      comments_count?: { count: number }[];
      created_at: string;
    }>).map((post) => ({
      type: 'post' as const,
      ...post,
      likes_count: post.likes_count?.[0]?.count || 0,
      comments_count: post.comments_count?.[0]?.count || 0,
      user_liked: userLikesMap.has(post.id),
      user_reaction: userLikesMap.get(post.id) || null,
      feed_timestamp: post.created_at,
    }));

    // Format activities
    const formattedActivities = (activities as Array<{ created_at: string }>).map((activity) => ({
      type: 'activity' as const,
      ...activity,
      feed_timestamp: activity.created_at,
    }));

    // Merge and sort by timestamp
    const feed = [...formattedPosts, ...formattedActivities].sort(
      (a, b) => new Date(b.feed_timestamp).getTime() - new Date(a.feed_timestamp).getTime()
    ).slice(0, limit);

    const nextCursor = feed.length === limit
      ? feed[feed.length - 1].feed_timestamp
      : null;

    return NextResponse.json({
      feed,
      nextCursor,
    });
  } catch (error) {
    console.error('Error in GET /api/feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
