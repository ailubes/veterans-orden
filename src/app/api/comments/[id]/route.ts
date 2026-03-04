import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/comments/[id] - Get a single comment with replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUserWithProfile(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, display_name, avatar_url, military_unit, position),
        likes_count:likes(count)
      `)
      .eq('id', id)
      .single();

    if (error || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user liked this comment
    const { data: userLike } = await supabase
      .from('likes')
      .select('reaction_type')
      .eq('user_id', user.id)
      .eq('target_type', 'comment')
      .eq('target_id', id)
      .single();

    const formattedComment = {
      ...comment,
      likes_count: comment.likes_count?.[0]?.count || 0,
      user_liked: !!userLike,
      user_reaction: userLike?.reaction_type || null,
    };

    return NextResponse.json({ comment: formattedComment });
  } catch (error) {
    console.error('Error in GET /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/comments/[id] - Update a comment
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

    // Get existing comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = existingComment.author_id === user.id;
    const isAdmin = profile?.staff_role === 'admin' || profile?.staff_role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        author:users!comments_author_id_fkey(id, display_name, avatar_url, military_unit, position),
        likes_count:likes(count)
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error in PUT /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/comments/[id] - Delete a comment
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

    // Get existing comment
    const { data: existingComment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check ownership or admin
    const isOwner = existingComment.author_id === user.id;
    const isAdmin = profile?.staff_role === 'admin' || profile?.staff_role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
