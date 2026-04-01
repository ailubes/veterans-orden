import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    const { id } = await params;
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', id)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .eq('post_id', id)
      .is('parent_id', null) // Top-level comments only
      .order('created_at', { ascending: true })
      .limit(limit);

    if (cursor) {
      query = query.gt('created_at', cursor);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get likes aggregates and current user's likes for comments
    const commentIds = comments?.map(c => c.id) || [];
    const [{ data: likeRows }, { data: userLikes }] = await Promise.all([
      supabase
        .from('likes')
        .select('target_id')
        .eq('target_type', 'comment')
        .in('target_id', commentIds),
      supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', dbUserId)
        .eq('target_type', 'comment')
        .in('target_id', commentIds),
    ]);

    const likesCountMap = new Map<string, number>();
    for (const row of likeRows || []) {
      likesCountMap.set(row.target_id, (likesCountMap.get(row.target_id) || 0) + 1);
    }

    const likedCommentIds = new Set(userLikes?.map(l => l.target_id) || []);

    // Format comments
    const formattedComments = comments?.map(comment => ({
      ...comment,
      author: {
        ...comment.author,
        display_name:
          `${comment.author?.first_name || ''} ${comment.author?.last_name || ''}`.trim() || 'Користувач',
      },
      likes_count: likesCountMap.get(comment.id) || 0,
      user_liked: likedCommentIds.has(comment.id),
    })) || [];

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error in GET /api/posts/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUserId = profile?.id || user.id;

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', id)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If parent_id provided, verify it exists and belongs to this post
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('id')
        .eq('id', parent_id)
        .eq('post_id', id)
        .single();

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 });
      }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        author_id: dbUserId,
        parent_id: parent_id || null,
        content: content.trim(),
      })
      .select(`
        *,
        author:users!comments_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Log activity (fire and forget)
    void supabase.rpc('log_activity', {
      p_actor_id: dbUserId,
      p_activity_type: 'comment_created',
      p_target_type: 'post',
      p_target_id: id,
      p_metadata: { comment_id: comment.id },
    });

    return NextResponse.json({
      comment: {
        ...comment,
        author: {
          ...comment.author,
          display_name:
            `${comment.author?.first_name || ''} ${comment.author?.last_name || ''}`.trim() || 'Користувач',
        },
        likes_count: 0,
        user_liked: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
