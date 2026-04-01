import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserWithProfile } from '@/lib/auth/get-user';

// GET /api/comments/[id]/replies - Get threaded replies to a comment
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
        author:users!comments_author_id_fkey(id, display_name, avatar_url, military_unit, position)
      `)
      .eq('parent_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
    }

    const dbUserId = profile?.id || user.id;

    // Get likes aggregates and current user's likes for these replies
    const replyIds = replies?.map(r => r.id) || [];
    const [{ data: likeRows }, { data: userLikes }] = await Promise.all([
      supabase
        .from('likes')
        .select('target_id')
        .eq('target_type', 'comment')
        .in('target_id', replyIds),
      supabase
        .from('likes')
        .select('target_id')
        .eq('user_id', dbUserId)
        .eq('target_type', 'comment')
        .in('target_id', replyIds),
    ]);

    const likesCountMap = new Map<string, number>();
    for (const row of likeRows || []) {
      likesCountMap.set(row.target_id, (likesCountMap.get(row.target_id) || 0) + 1);
    }

    const likedReplyIds = new Set(userLikes?.map(l => l.target_id) || []);

    // Format replies
    const formattedReplies = replies?.map(reply => ({
      ...reply,
      likes_count: likesCountMap.get(reply.id) || 0,
      user_liked: likedReplyIds.has(reply.id),
    })) || [];

    return NextResponse.json({ replies: formattedReplies });
  } catch (error) {
    console.error('Error in GET /api/comments/[id]/replies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
