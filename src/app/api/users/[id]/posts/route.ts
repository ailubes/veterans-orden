import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/users/[id]/posts - Get posts by a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { id } = await params;
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;

    // Check if viewing own profile or if following
    const isOwnProfile = dbUserId === id;
    let canSeeFollowersOnly = isOwnProfile;

    if (!isOwnProfile) {
      const { data: followStatus } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', dbUserId)
        .eq('following_id', id)
        .eq('status', 'active')
        .single();

      canSeeFollowersOnly = !!followStatus;
    }

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('author_id', id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter visibility based on relationship
    if (isOwnProfile) {
      // Can see all own posts
    } else if (canSeeFollowersOnly) {
      query = query.in('visibility', ['public', 'followers']);
    } else {
      query = query.eq('visibility', 'public');
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching user posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get user's likes for these posts
    const postIds = posts?.map(p => p.id) || [];
    const { data: userLikes } = await supabase
      .from('likes')
      .select('target_id, reaction_type')
      .eq('user_id', dbUserId)
      .eq('target_type', 'post')
      .in('target_id', postIds);

    const userLikesMap = new Map(userLikes?.map(l => [l.target_id, l.reaction_type]) || []);

    // Format posts
    const formattedPosts = posts?.map(post => ({
      ...post,
      author: {
        ...post.author,
        display_name:
          `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
      },
      likes_count: post.likes_count?.[0]?.count || 0,
      comments_count: post.comments_count?.[0]?.count || 0,
      user_liked: userLikesMap.has(post.id),
      user_reaction: userLikesMap.get(post.id) || null,
    })) || [];

    const nextCursor = posts?.length === limit
      ? posts[posts.length - 1].created_at
      : null;

    return NextResponse.json({
      posts: formattedPosts,
      nextCursor,
    });
  } catch (error) {
    console.error('Error in GET /api/users/[id]/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
