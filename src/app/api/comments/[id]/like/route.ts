import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// POST /api/comments/[id]/like - Like a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { reaction_type = 'like' } = body;

    // Check if comment exists
    const { data: comment } = await supabase
      .from('comments')
      .select('id')
      .eq('id', id)
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Insert like
    const { error } = await supabase
      .from('likes')
      .upsert({
        user_id: user.id,
        target_type: 'comment',
        target_id: id,
        reaction_type,
      }, {
        onConflict: 'user_id,target_type,target_id',
      });

    if (error) {
      console.error('Error liking comment:', error);
      return NextResponse.json({ error: 'Failed to like comment' }, { status: 500 });
    }

    // Get updated like count
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('target_type', 'comment')
      .eq('target_id', id);

    return NextResponse.json({
      liked: true,
      reaction_type,
      likes_count: likeCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in POST /api/comments/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/comments/[id]/like - Unlike a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', 'comment')
      .eq('target_id', id);

    if (error) {
      console.error('Error unliking comment:', error);
      return NextResponse.json({ error: 'Failed to unlike comment' }, { status: 500 });
    }

    // Get updated like count
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('target_type', 'comment')
      .eq('target_id', id);

    return NextResponse.json({
      liked: false,
      likes_count: likeCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/comments/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
