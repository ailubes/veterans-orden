import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// POST /api/posts/[id]/like - Like a post
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

    const body = await request.json().catch(() => ({}));
    const { reaction_type = 'like' } = body;

    // Check if post exists and is visible
    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, visibility')
      .eq('id', id)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Insert like (upsert to handle duplicate likes)
    const { error } = await supabase
      .from('likes')
      .upsert({
        user_id: dbUserId,
        target_type: 'post',
        target_id: id,
        reaction_type,
      }, {
        onConflict: 'user_id,target_type,target_id',
      });

    if (error) {
      console.error('Error liking post:', error);
      return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
    }

    // Log activity (fire and forget)
    void supabase.rpc('log_activity', {
      p_actor_id: dbUserId,
      p_activity_type: 'post_liked',
      p_target_type: 'post',
      p_target_id: id,
      p_metadata: { reaction_type },
    });

    // Get updated like count
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('target_type', 'post')
      .eq('target_id', id);

    return NextResponse.json({
      liked: true,
      reaction_type,
      likes_count: likeCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in POST /api/posts/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/like - Unlike a post
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

    const dbUserId = profile?.id || user.id;

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', dbUserId)
      .eq('target_type', 'post')
      .eq('target_id', id);

    if (error) {
      console.error('Error unliking post:', error);
      return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
    }

    // Get updated like count
    const { data: likeCount } = await supabase
      .from('likes')
      .select('id', { count: 'exact' })
      .eq('target_type', 'post')
      .eq('target_id', id);

    return NextResponse.json({
      liked: false,
      likes_count: likeCount?.length || 0,
    });
  } catch (error) {
    console.error('Error in DELETE /api/posts/[id]/like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
