import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { Conversation, ConversationParticipant, MessagingUser } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/conversations/[id]
 * Get a single conversation with participants
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is participant
    const { data: participantRecord } = await supabase
      .from('conversation_participants')
      .select('id, role, is_muted, unread_count')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participantRecord) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get conversation details
    const { data: conv, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get all participants
    const { data: participantsData } = await supabase
      .from('conversation_participants')
      .select(`
        id,
        user_id,
        role,
        is_muted,
        muted_until,
        last_read_at,
        last_read_message_id,
        unread_count,
        is_active,
        joined_at,
        user:users (
          id,
          first_name,
          last_name,
          avatar_url,
          membership_role
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_active', true);

    const participants: ConversationParticipant[] = (participantsData || []).map((p: Record<string, unknown>) => {
      const u = p.user as Record<string, unknown>;
      return {
        id: p.id as string,
        conversationId,
        userId: p.user_id as string,
        user: {
          id: u.id as string,
          firstName: u.first_name as string,
          lastName: u.last_name as string,
          avatarUrl: u.avatar_url as string | null,
          membershipRole: u.membership_role as string,
        },
        role: p.role as 'owner' | 'admin' | 'member',
        isMuted: p.is_muted as boolean,
        mutedUntil: p.muted_until as string | null,
        lastReadAt: p.last_read_at as string | null,
        lastReadMessageId: p.last_read_message_id as string | null,
        unreadCount: p.unread_count as number,
        isActive: p.is_active as boolean,
        joinedAt: p.joined_at as string,
      };
    });

    // Find other participant for DMs
    let otherParticipant: MessagingUser | null = null;
    if (conv.type === 'direct') {
      const other = participants.find((p) => p.userId !== profile.id);
      if (other) {
        otherParticipant = other.user;
      }
    }

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
      participants,
      otherParticipant,
      unreadCount: participantRecord.unread_count,
      isMuted: participantRecord.is_muted,
    };

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/messaging/conversations/[id]
 * Update conversation settings (group name, description, avatar)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is participant with appropriate role
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Only owner/admin can update group settings
    if (participant.role === 'member') {
      return NextResponse.json(
        { error: 'Only group owner or admin can update settings' },
        { status: 403 }
      );
    }

    // Get conversation to check type
    const { data: conv } = await supabase
      .from('conversations')
      .select('type')
      .eq('id', conversationId)
      .single();

    if (!conv || conv.type !== 'group') {
      return NextResponse.json(
        { error: 'Can only update group conversations' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, avatarUrl } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data: updated, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('[Messaging] Error updating conversation:', error);
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/messaging/conversations/[id]
 * Leave a conversation (or delete if owner)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get participant record
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id, role')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('type')
      .eq('id', conversationId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // For DMs, just mark participant as inactive
    // For groups, if owner leaves, transfer ownership or delete
    if (conv.type === 'direct') {
      await supabase
        .from('conversation_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('id', participant.id);
    } else {
      // Group chat
      if (participant.role === 'owner') {
        // Find an admin to transfer ownership, or delete the group
        const { data: admins } = await supabase
          .from('conversation_participants')
          .select('id, user_id')
          .eq('conversation_id', conversationId)
          .eq('is_active', true)
          .eq('role', 'admin')
          .neq('user_id', profile.id)
          .limit(1);

        if (admins && admins.length > 0) {
          // Transfer ownership to admin
          await supabase
            .from('conversation_participants')
            .update({ role: 'owner' })
            .eq('id', admins[0].id);
        } else {
          // Find any member
          const { data: members } = await supabase
            .from('conversation_participants')
            .select('id, user_id')
            .eq('conversation_id', conversationId)
            .eq('is_active', true)
            .neq('user_id', profile.id)
            .limit(1);

          if (members && members.length > 0) {
            // Transfer to first member
            await supabase
              .from('conversation_participants')
              .update({ role: 'owner' })
              .eq('id', members[0].id);
          } else {
            // No other participants, mark conversation as inactive
            await supabase
              .from('conversations')
              .update({ is_active: false })
              .eq('id', conversationId);
          }
        }
      }

      // Mark the leaving user's participant record as inactive
      await supabase
        .from('conversation_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString(),
        })
        .eq('id', participant.id);

      // Add system message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: null,
        type: 'system',
        content: 'Учасник покинув групу',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
