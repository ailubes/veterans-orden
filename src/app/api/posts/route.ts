import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/posts - Get posts (feed with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'all'; // all, following, popular
    const userId = searchParams.get('userId');

    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply cursor pagination
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    // Filter by user posts
    if (userId) {
      query = query.eq('author_id', userId);
    }

    // Filter by following
    if (type === 'following') {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', dbUserId)
        .eq('status', 'active');

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(dbUserId); // Include own posts

      query = query.in('author_id', followingIds);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get like/comment aggregates and user's likes for these posts
    const postIds = posts?.map(p => p.id) || [];
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
    const formattedPosts = posts?.map(post => ({
      ...post,
      author: {
        ...post.author,
        display_name:
          `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
      },
      likes_count: likesCountMap.get(post.id) || 0,
      comments_count: commentsCountMap.get(post.id) || 0,
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
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;

    // Check if user is suspended
    if (profile?.status === 'suspended') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    const body = await request.json();
    const { content, content_type = 'text', media_urls, link_preview, visibility = 'public' } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: dbUserId,
        content: content.trim(),
        content_type,
        media_urls: media_urls || null,
        link_preview: link_preview || null,
        visibility,
      })
      .select(`
        *,
        author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({
      post: {
        ...post,
        author: {
          ...post.author,
          display_name:
            `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
        },
        likes_count: 0,
        comments_count: 0,
        user_liked: false,
        user_reaction: null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
