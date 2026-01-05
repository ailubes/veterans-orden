import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { BulkDeleteResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/bulk-delete
 * Delete multiple messages at once (soft delete)
 */
export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json({ error: 'messageIds array is required' }, { status: 400 });
    }

    if (messageIds.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 messages can be deleted at once' }, { status: 400 });
    }

    // Get messages to verify ownership and permissions
    const { data: messages, error: fetchError } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, is_deleted')
      .in('id', messageIds);

    if (fetchError) {
      console.error('[Messaging] Error fetching messages:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages found' }, { status: 404 });
    }

    // Group messages by conversation to check participant roles
    const conversationIds = [...new Set(messages.map((m) => m.conversation_id))];

    // Get participant records for all conversations
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, role')
      .eq('user_id', profile.id)
      .in('conversation_id', conversationIds)
      .eq('is_active', true);

    const participantMap = new Map(
      (participants || []).map((p) => [p.conversation_id, p.role])
    );

    // Filter messages that can be deleted
    const deletableMessageIds: string[] = [];
    const errors: string[] = [];

    for (const message of messages) {
      // Skip already deleted
      if (message.is_deleted) {
        continue;
      }

      // Check if user is participant
      const userRole = participantMap.get(message.conversation_id);
      if (!userRole) {
        errors.push(`Message ${message.id}: Not a participant`);
        continue;
      }

      // User can delete if:
      // 1. They are the sender
      // 2. They are owner/admin of the conversation
      const canDelete =
        message.sender_id === profile.id ||
        userRole === 'owner' ||
        userRole === 'admin';

      if (canDelete) {
        deletableMessageIds.push(message.id);
      } else {
        errors.push(`Message ${message.id}: Permission denied`);
      }
    }

    if (deletableMessageIds.length === 0) {
      return NextResponse.json({
        success: false,
        deletedCount: 0,
        error: 'No messages could be deleted',
      } as BulkDeleteResponse, { status: 403 });
    }

    // Soft delete messages
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
      .in('id', deletableMessageIds);

    if (deleteError) {
      console.error('[Messaging] Error deleting messages:', deleteError);
      return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }

    const response: BulkDeleteResponse = {
      success: true,
      deletedCount: deletableMessageIds.length,
    };

    if (errors.length > 0) {
      response.error = `${errors.length} messages could not be deleted`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
