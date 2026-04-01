import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/feed - Get personalized feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'mixed'; // mixed, posts, activity

    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUserId = profile?.id || user.id;

    // Get following list
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', dbUserId)
      .eq('status', 'active');

    const followingIds = following?.map(f => f.following_id) || [];
    followingIds.push(dbUserId); // Include own content

    let posts: unknown[] = [];
    let activities: unknown[] = [];

    // Fetch posts from followed users
    if (type === 'mixed' || type === 'posts') {
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
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
          actor:users!activity_log_actor_id_fkey(id, first_name, last_name, avatar_url)
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

    // Get likes/comments aggregates and user's likes for posts
    const postIds = (posts as { id: string }[]).map((p) => p.id);
    const [{ data: likeRows }, { data: commentRows }, { data: userLikes }] = await Promise.all([
      supabase
        .from('likes')
        .select('target_id')
        .eq('target_type', 'post')
        .in('target_id', postIds),
      supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds),
      supabase
        .from('likes')
        .select('target_id, reaction_type')
        .eq('user_id', dbUserId)
        .eq('target_type', 'post')
        .in('target_id', postIds),
    ]);

    const likesCountMap = new Map<string, number>();
    for (const row of likeRows || []) {
      likesCountMap.set(row.target_id, (likesCountMap.get(row.target_id) || 0) + 1);
    }

    const commentsCountMap = new Map<string, number>();
    for (const row of commentRows || []) {
      commentsCountMap.set(row.post_id, (commentsCountMap.get(row.post_id) || 0) + 1);
    }

    const userLikesMap = new Map(userLikes?.map(l => [l.target_id, l.reaction_type]) || []);

    // Format posts
    const formattedPosts = (posts as Array<{
      id: string;
      author?: { first_name?: string; last_name?: string } | null;
      created_at: string;
    }>).map((post) => ({
      type: 'post' as const,
      ...post,
      author: {
        ...(post.author || {}),
        display_name:
          `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
      },
      likes_count: likesCountMap.get(post.id) || 0,
      comments_count: commentsCountMap.get(post.id) || 0,
      user_liked: userLikesMap.has(post.id),
      user_reaction: userLikesMap.get(post.id) || null,
      feed_timestamp: post.created_at,
    }));

    // Format activities
    const formattedActivities = (activities as Array<{ created_at: string; actor?: { first_name?: string; last_name?: string } | null }>).map((activity) => ({
      type: 'activity' as const,
      ...activity,
      actor: {
        ...(activity.actor || {}),
        display_name:
          `${activity.actor?.first_name || ''} ${activity.actor?.last_name || ''}`.trim() || 'Користувач',
      },
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
