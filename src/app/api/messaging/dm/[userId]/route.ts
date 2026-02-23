import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
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

    // Check for existing DM conversation between these two users
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner (
          id,
          type,
          is_active
        )
      `)
      .eq('user_id', profile.id)
      .eq('is_active', true);

    let existingDMId: string | null = null;

    for (const p of existingParticipants || []) {
      const conv = p.conversations as unknown as Record<string, unknown>;
      if (conv.type === 'direct' && conv.is_active) {
        const { data: otherPart } = await supabase
          .from('conversation_participants')
          .select('id')
          .eq('conversation_id', p.conversation_id)
          .eq('user_id', otherUserId)
          .eq('is_active', true)
          .single();

        if (otherPart) {
          existingDMId = p.conversation_id;
          break;
        }
      }
    }

    if (existingDMId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', existingDMId)
        .single();

      const { data: otherUser } = await supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, membership_role')
        .eq('id', otherUserId)
        .single();

      const { data: myParticipant } = await supabase
        .from('conversation_participants')
        .select('unread_count, is_muted')
        .eq('conversation_id', existingDMId)
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
        otherParticipant: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.first_name,
          lastName: otherUser.last_name,
          avatarUrl: otherUser.avatar_url,
          membershipRole: otherUser.membership_role,
        } : null,
        unreadCount: myParticipant?.unread_count || 0,
        isMuted: myParticipant?.is_muted || false,
      };

      return NextResponse.json({ conversation, created: false });
    }

    // Get recipient info (users table is now readable by all authenticated users)
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, membership_role')
      .eq('id', otherUserId)
      .single();

    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create new DM conversation.
    // Use service client as a fallback; primary path uses user's session with INSERT policies.
    let serviceClient: ReturnType<typeof createServiceClient> | null = null;
    try {
      serviceClient = createServiceClient();
    } catch {
      // Service client unavailable — will use user's supabase client
    }

    const insertClient = serviceClient ?? supabase;

    const { data: conversation, error: convError } = await insertClient
      .from('conversations')
      .insert({
        type: 'direct',
        created_by_id: profile.id,
        participant_count: 2,
      })
      .select()
      .single();

    if (convError || !conversation) {
      console.error('[Messaging] Error creating DM:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Add both participants
    const { error: partError } = await insertClient
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: profile.id, role: 'owner' },
        { conversation_id: conversation.id, user_id: otherUserId, role: 'member' },
      ]);

    if (partError) {
      console.error('[Messaging] Error adding participants:', partError);
      await insertClient.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    const responseConversation: Conversation = {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      avatarUrl: conversation.avatar_url,
      createdById: conversation.created_by_id,
      isActive: conversation.is_active,
      allowReplies: conversation.allow_replies,
      participantCount: conversation.participant_count,
      lastMessageAt: conversation.last_message_at,
      lastMessagePreview: conversation.last_message_preview,
      lastMessageSenderId: conversation.last_message_sender_id,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      pinnedMessageIds: [],
      otherParticipant: {
        id: recipient.id,
        firstName: recipient.first_name,
        lastName: recipient.last_name,
        avatarUrl: recipient.avatar_url,
        membershipRole: recipient.membership_role,
      },
      unreadCount: 0,
      isMuted: false,
    };

    return NextResponse.json({ conversation: responseConversation, created: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
