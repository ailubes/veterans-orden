import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { Message, MessagesResponse, MessagingSettings, MessageAttachment } from '@/types/messaging';
import { checkMessageRateLimit } from '@/lib/messaging/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/conversations/[id]/messages
 * Get messages for a conversation with pagination
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
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '30')));
    const cursor = searchParams.get('cursor'); // message ID for pagination
    const before = searchParams.get('before'); // ISO date string

    // Build query
    let query = supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        type,
        content,
        attachments,
        reply_to_id,
        metadata,
        is_edited,
        edited_at,
        status,
        is_deleted,
        deleted_at,
        created_at,
        updated_at,
        sender:users!sender_id (
          id,
          first_name,
          last_name,
          avatar_url,
          membership_role
        ),
        reply_to:messages!reply_to_id (
          id,
          content,
          sender_id,
          type,
          sender:users!sender_id (
            id,
            first_name,
            last_name
          )
        )
      `, { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit + 1); // Get one extra to check if there's more

    // Cursor-based pagination
    if (cursor) {
      const { data: cursorMsg } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', cursor)
        .single();

      if (cursorMsg) {
        query = query.lt('created_at', cursorMsg.created_at);
      }
    } else if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messagesData, count, error } = await query;

    if (error) {
      console.error('[Messaging] Error fetching messages:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const hasMore = (messagesData?.length || 0) > limit;
    const messagesSlice = messagesData?.slice(0, limit) || [];

    // Transform to Message type
    const messages: Message[] = messagesSlice.map((m: Record<string, unknown>) => {
      const sender = m.sender as Record<string, unknown> | null;
      const replyTo = m.reply_to as Record<string, unknown> | null;
      const attachments = (m.attachments || []) as MessageAttachment[];
      const metadata = (m.metadata || {}) as Record<string, unknown>;

      // Parse reactions from metadata
      const reactions = [];
      if (metadata.reactions) {
        const reactionsData = metadata.reactions as Record<string, { userId: string; firstName: string; lastName: string }[]>;
        for (const [emoji, users] of Object.entries(reactionsData)) {
          reactions.push({
            emoji,
            count: users.length,
            users: users.map(u => ({ id: u.userId, firstName: u.firstName, lastName: u.lastName })),
            hasReacted: users.some(u => u.userId === profile.id),
          });
        }
      }

      return {
        id: m.id as string,
        conversationId: m.conversation_id as string,
        senderId: m.sender_id as string | null,
        sender: sender ? {
          id: sender.id as string,
          firstName: sender.first_name as string,
          lastName: sender.last_name as string,
          avatarUrl: sender.avatar_url as string | null,
          membershipRole: sender.membership_role as string,
        } : null,
        type: m.type as 'text' | 'image' | 'file' | 'system',
        content: m.content as string | null,
        attachments,
        replyToId: m.reply_to_id as string | null,
        replyTo: replyTo ? {
          id: replyTo.id as string,
          conversationId: conversationId,
          senderId: replyTo.sender_id as string | null,
          sender: replyTo.sender ? {
            id: (replyTo.sender as Record<string, unknown>).id as string,
            firstName: (replyTo.sender as Record<string, unknown>).first_name as string,
            lastName: (replyTo.sender as Record<string, unknown>).last_name as string,
            avatarUrl: null,
            membershipRole: '',
          } : null,
          type: replyTo.type as 'text' | 'image' | 'file' | 'system',
          content: replyTo.content as string | null,
          attachments: [],
          replyToId: null,
          reactions: [],
          isEdited: false,
          editedAt: null,
          isDeleted: false,
          deletedAt: null,
          status: 'sent',
          createdAt: '',
          updatedAt: '',
        } : null,
        reactions,
        isEdited: m.is_edited as boolean,
        editedAt: m.edited_at as string | null,
        isDeleted: m.is_deleted as boolean,
        deletedAt: m.deleted_at as string | null,
        status: m.status as 'sending' | 'sent' | 'delivered' | 'read' | 'failed',
        createdAt: m.created_at as string,
        updatedAt: m.updated_at as string,
      };
    });

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    const nextCursor = hasMore && messagesSlice.length > 0
      ? messagesSlice[messagesSlice.length - 1].id
      : undefined;

    const response: MessagesResponse = {
      messages,
      total: count || 0,
      hasMore,
      nextCursor: nextCursor as string | undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/messaging/conversations/[id]/messages
 * Send a new message
 */
export async function POST(
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
      .select('id, first_name, last_name, avatar_url, membership_role')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is participant
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

    // Check if conversation allows replies
    const { data: conv } = await supabase
      .from('conversations')
      .select('allow_replies, is_active')
      .eq('id', conversationId)
      .single();

    if (!conv || !conv.is_active) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conv.allow_replies && participant.role === 'member') {
      return NextResponse.json(
        { error: 'You cannot send messages in this conversation' },
        { status: 403 }
      );
    }

    // Get messaging settings for rate limiting
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

    // Check rate limit
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recentCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', profile.id)
      .gte('created_at', oneMinuteAgo);

    const rateLimitCheck = await checkMessageRateLimit(
      profile.id,
      recentCount || 0,
      settings
    );

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Занадто багато повідомлень. Спробуйте через хвилину.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, type = 'text', attachments = [], replyToId } = body;

    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message content or attachments required' },
        { status: 400 }
      );
    }

    // Validate attachments
    if (attachments.length > 0 && !settings.messaging_attachments_enabled) {
      return NextResponse.json(
        { error: 'Attachments are disabled' },
        { status: 403 }
      );
    }

    // Validate reply_to if provided
    if (replyToId) {
      const { data: replyMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('id', replyToId)
        .eq('conversation_id', conversationId)
        .single();

      if (!replyMsg) {
        return NextResponse.json(
          { error: 'Reply message not found' },
          { status: 400 }
        );
      }
    }

    // Create message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        type,
        content,
        attachments,
        reply_to_id: replyToId || null,
        status: 'sent',
      })
      .select()
      .single();

    if (msgError || !message) {
      console.error('[Messaging] Error creating message:', msgError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Mark sender's messages as read
    await supabase.rpc('mark_messages_read', {
      p_conversation_id: conversationId,
      p_user_id: profile.id,
    });

    // Build response message with sender info
    const responseMessage: Message = {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      sender: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatarUrl: profile.avatar_url,
        membershipRole: profile.membership_role,
      },
      type: message.type,
      content: message.content,
      attachments: message.attachments || [],
      replyToId: message.reply_to_id,
      replyTo: null,
      reactions: [],
      isEdited: message.is_edited,
      editedAt: message.edited_at,
      isDeleted: message.is_deleted,
      deletedAt: message.deleted_at,
      status: message.status,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
    };

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
