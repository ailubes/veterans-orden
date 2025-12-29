import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { UnreadCountResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/unread
 * Get total unread count and per-conversation counts
 */
export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get unread counts using stored function
    const { data: totalUnread, error: rpcError } = await supabase.rpc('get_total_unread_count', {
      p_user_id: profile.id,
    });

    if (rpcError) {
      console.error('[Messaging] Error fetching total unread count:', rpcError);
    }

    // Get per-conversation unread counts
    const { data: participants, error } = await supabase
      .from('conversation_participants')
      .select('conversation_id, unread_count')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .gt('unread_count', 0);

    if (error) {
      console.error('[Messaging] Error fetching unread counts:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const byConversation: Record<string, number> = {};
    for (const p of participants || []) {
      byConversation[p.conversation_id] = p.unread_count;
    }

    const response: UnreadCountResponse = {
      totalUnread: totalUnread || 0,
      byConversation,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
