import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { ForwardMessageResponse, Message } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/[id]/forward
 * Forward a message to one or more conversations
 */
export async function POST(
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
      .select('id, first_name, last_name')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get original message
    const { data: originalMessage } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        type,
        is_deleted,
        sender:users!messages_sender_id_fkey (
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', messageId)
      .single();

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (originalMessage.is_deleted) {
      return NextResponse.json({ error: 'Cannot forward deleted message' }, { status: 400 });
    }

    // Check if user is participant in the original conversation
    const { data: originalParticipant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', originalMessage.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!originalParticipant) {
      return NextResponse.json({ error: 'Not authorized to forward this message' }, { status: 403 });
    }

    const body = await request.json();
    const { conversationIds, comment } = body as { conversationIds: string[]; comment?: string };

    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json({ error: 'At least one conversation ID required' }, { status: 400 });
    }

    if (conversationIds.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 conversations at once' }, { status: 400 });
    }

    // Get sender name for the forwarded message indicator
    const senderInfo = originalMessage.sender as unknown as { first_name: string; last_name: string } | null;
    const senderName = senderInfo
      ? `${senderInfo.first_name} ${senderInfo.last_name}`.trim()
      : 'Хтось';

    const forwardedMessages: Message[] = [];

    // Forward to each conversation
    for (const conversationId of conversationIds) {
      // Check if user is participant in target conversation
      const { data: targetParticipant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single();

      if (!targetParticipant) {
        console.warn(`[Messaging] User not participant in conversation ${conversationId}, skipping`);
        continue;
      }

      // Create forwarded message
      const { data: newMessage, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: originalMessage.content,
          type: originalMessage.type,
          forwarded_from_message_id: messageId,
          forwarded_from_conversation_id: originalMessage.conversation_id,
          forwarded_from_sender_name: senderName,
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Messaging] Error creating forwarded message:', insertError);
        continue;
      }

      // If there's a comment, add it as a separate message after the forwarded one
      if (comment && comment.trim()) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: profile.id,
            content: comment.trim(),
            type: 'text',
          });
      }

      forwardedMessages.push(newMessage as Message);
    }

    if (forwardedMessages.length === 0) {
      return NextResponse.json({
        error: 'Failed to forward message to any conversation'
      }, { status: 500 });
    }

    const response: ForwardMessageResponse = {
      success: true,
      forwardedMessages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
