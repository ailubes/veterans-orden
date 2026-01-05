import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { MessagingSettings, Message } from '@/types/messaging';
import { canEditMessage, canDeleteMessage } from '@/lib/messaging/permissions';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/messaging/messages/[id]
 * Edit a message
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, membership_role')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, type, content, is_deleted, created_at')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.is_deleted) {
      return NextResponse.json({ error: 'Cannot edit deleted message' }, { status: 400 });
    }

    if (message.type === 'system') {
      return NextResponse.json({ error: 'Cannot edit system messages' }, { status: 400 });
    }

    // Check if user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 });
    }

    // Get settings
    const { data: settingsRows } = await supabase
      .from('organization_settings')
      .select('key, value')
      .like('key', 'messaging_%');

    const settings: MessagingSettings = {
      messaging_enabled: true,
      messaging_dm_enabled: true,
      messaging_group_chat_enabled: true,
      messaging_dm_initiator_roles: [],
      messaging_group_creator_roles: [],
      messaging_same_group_enabled: false,
      messaging_cross_group_enabled: false,
      messaging_attachments_enabled: true,
      messaging_max_attachment_size_mb: 10,
      messaging_allowed_attachment_types: [],
      messaging_rate_limit_messages_per_minute: 30,
      messaging_max_group_participants: 100,
      messaging_edit_window_minutes: 15,
    };

    for (const row of settingsRows || []) {
      const key = row.key as keyof MessagingSettings;
      try {
        (settings as unknown as Record<string, unknown>)[key] = JSON.parse(row.value as string);
      } catch {
        // Keep default
      }
    }

    // Check if user can edit
    if (!canEditMessage(profile.id, { senderId: message.sender_id, createdAt: message.created_at }, settings)) {
      return NextResponse.json(
        { error: 'Редагування неможливе. Ви можете редагувати лише свої повідомлення протягом 15 хвилин.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Update message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (updateError) {
      console.error('[Messaging] Error updating message:', updateError);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    const responseMessage: Message = {
      id: updatedMessage.id,
      conversationId: updatedMessage.conversation_id,
      senderId: updatedMessage.sender_id,
      sender: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        membershipRole: profile.membership_role,
      },
      type: updatedMessage.type,
      content: updatedMessage.content,
      attachments: updatedMessage.attachments || [],
      replyToId: updatedMessage.reply_to_id,
      replyTo: null,
      reactions: [],
      isEdited: updatedMessage.is_edited,
      editedAt: updatedMessage.edited_at,
      isDeleted: updatedMessage.is_deleted,
      deletedAt: updatedMessage.deleted_at,
      status: updatedMessage.status,
      createdAt: updatedMessage.created_at,
      updatedAt: updatedMessage.updated_at,
      pinnedAt: updatedMessage.pinned_at || null,
      pinnedBy: updatedMessage.pinned_by || null,
      forwardedFromMessageId: updatedMessage.forwarded_from_message_id || null,
      forwardedFromConversationId: updatedMessage.forwarded_from_conversation_id || null,
      forwardedFromSenderName: updatedMessage.forwarded_from_sender_name || null,
    };

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/messaging/messages/[id]
 * Delete (soft delete) a message
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
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

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, type, is_deleted')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.is_deleted) {
      return NextResponse.json({ error: 'Message already deleted' }, { status: 400 });
    }

    if (message.type === 'system') {
      return NextResponse.json({ error: 'Cannot delete system messages' }, { status: 400 });
    }

    // Get participant role
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }

    // Check if user can delete
    if (!canDeleteMessage(profile.id, participant.role, { senderId: message.sender_id })) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this message' },
        { status: 403 }
      );
    }

    // Soft delete message
    const { error: deleteError } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: profile.id,
        content: null, // Clear content on delete
        attachments: [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (deleteError) {
      console.error('[Messaging] Error deleting message:', deleteError);
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
