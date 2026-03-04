import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/posts/[id] - Get a single post
export async function GET(
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

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user liked this post
    const { data: userLike } = await supabase
      .from('likes')
      .select('reaction_type')
      .eq('user_id', dbUserId)
      .eq('target_type', 'post')
      .eq('target_id', id)
      .single();

    const formattedPost = {
      ...post,
      author: {
        ...post.author,
        display_name:
          `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
      },
      likes_count: post.likes_count?.[0]?.count || 0,
      comments_count: post.comments_count?.[0]?.count || 0,
      user_liked: !!userLike,
      user_reaction: userLike?.reaction_type || null,
    };

    return NextResponse.json({ post: formattedPost });
  } catch (error) {
    console.error('Error in GET /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check ownership or admin
    const dbUserId = profile?.id || user.id;
    const isOwner = existingPost.author_id === dbUserId;
    const isAdmin = profile?.staff_role === 'admin' || profile?.staff_role === 'moderator';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content, media_urls, link_preview, visibility, is_pinned } = body;

    const updates: Record<string, unknown> = {};

    if (content !== undefined) {
      updates.content = content.trim();
      updates.is_edited = true;
      updates.edited_at = new Date().toISOString();
    }
    if (media_urls !== undefined) updates.media_urls = media_urls;
    if (link_preview !== undefined) updates.link_preview = link_preview;
    if (visibility !== undefined) updates.visibility = visibility;
    if (is_pinned !== undefined && isAdmin) updates.is_pinned = is_pinned;

    const { data: post, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author:users!posts_author_id_fkey(id, first_name, last_name, avatar_url, military_unit, position)
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({
      post: {
        ...post,
        author: {
          ...post.author,
          display_name:
            `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim() || 'Користувач',
        },
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing post
    const { data: existingPost } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check ownership or admin
    const dbUserId = profile?.id || user.id;
    const isOwner = existingPost.author_id === dbUserId;
    const isAdmin = profile?.staff_role === 'admin' || profile?.staff_role === 'moderator';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
