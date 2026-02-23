import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { Conversation } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/dm/[userId]
 * Get or create a DM conversation with a user.
 * All authenticated members can message each other freely.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: otherUserId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get current user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, membership_role')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.id === otherUserId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Verify recipient exists
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, membership_role')
      .eq('id', otherUserId)
      .single();

    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use SECURITY DEFINER function to find or create the DM (bypasses RLS for INSERT)
    // Called via user's session client — SECURITY DEFINER runs as function owner in the DB
    const { data: dmResult, error: dmError } = await supabase
      .rpc('create_dm_conversation', {
        p_creator_id: profile.id,
        p_other_user_id: otherUserId,
      });

    if (dmError || !dmResult || dmResult.length === 0) {
      console.error('[Messaging] Error in create_dm_conversation:', dmError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    const { conversation_id: conversationId, created } = dmResult[0];

    // Fetch full conversation details
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Fetch participant record for unread count
    const { data: myParticipant } = await supabase
      .from('conversation_participants')
      .select('unread_count, is_muted')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .single();

    const conversation: Conversation = {
      id: conv.id,
      type: conv.type,
      name: conv.name,
      description: conv.description,
      avatarUrl: conv.avatar_url,
      createdById: conv.created_by_id,
      isActive: conv.is_active,
      allowReplies: conv.allow_replies,
      participantCount: conv.participant_count,
      lastMessageAt: conv.last_message_at,
      lastMessagePreview: conv.last_message_preview,
      lastMessageSenderId: conv.last_message_sender_id,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
      pinnedMessageIds: conv.pinned_message_ids || [],
      otherParticipant: {
        id: recipient.id,
        firstName: recipient.first_name,
        lastName: recipient.last_name,
        avatarUrl: recipient.avatar_url,
        membershipRole: recipient.membership_role,
      },
      unreadCount: myParticipant?.unread_count || 0,
      isMuted: myParticipant?.is_muted || false,
    };

    return NextResponse.json({ conversation, created });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
