import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

// GET /api/comments/[id]/replies - Get threaded replies to a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if parent comment exists
    const { data: parentComment } = await supabase
      .from('comments')
      .select('id, post_id')
      .eq('id', id)
      .single();

    if (!parentComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const { data: replies, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, display_name, avatar_url, military_unit, position),
        likes_count:likes(count)
      `)
      .eq('parent_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    // Get user's likes for these replies
    const replyIds = replies?.map(r => r.id) || [];
    const { data: userLikes } = await supabase
      .from('likes')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('target_type', 'comment')
      .in('target_id', replyIds);

    const likedReplyIds = new Set(userLikes?.map(l => l.target_id) || []);

    // Format replies
    const formattedReplies = replies?.map(reply => ({
      ...reply,
      likes_count: reply.likes_count?.[0]?.count || 0,
      user_liked: likedReplyIds.has(reply.id),
    })) || [];

    return NextResponse.json({ replies: formattedReplies });
  } catch (error) {
    console.error('Error in GET /api/comments/[id]/replies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
