import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import type { Conversation, ConversationsResponse, CreateConversationRequest } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/conversations
 * List user's conversations with pagination
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
      .select('id, membership_role')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;

    // Get conversations with participants
    const { data: participantRecords, count, error } = await supabase
      .from('conversation_participants')
      .select(`
        id,
        conversation_id,
        unread_count,
        is_muted,
        last_read_at,
        role,
        conversations!inner (
          id,
          type,
          name,
          description,
          avatar_url,
          created_by_id,
          is_active,
          allow_replies,
          participant_count,
          last_message_at,
          last_message_preview,
          last_message_sender_id,
          created_at,
          updated_at
        )
      `, { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, referencedTable: 'conversations' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Messaging] Error fetching conversations:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // OPTIMIZATION: Batch fetch all other participants for DMs to avoid N+1 queries
    const conversationMap = new Map();
    const dmConversationIds: string[] = [];

    for (const pr of (participantRecords || [])) {
      const convData = pr.conversations;
      const conv = (Array.isArray(convData) ? convData[0] : convData) as Record<string, unknown>;

      if (!conv) continue;

      conversationMap.set(conv.id, { pr, conv });

      if (conv.type === 'direct') {
        dmConversationIds.push(conv.id as string);
      }
    }

    // Build otherParticipants map for O(1) lookup
    const otherParticipantsMap = new Map();

    if (dmConversationIds.length > 0) {
      // Batch query for all other participants
      const { data: otherParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', dmConversationIds)
        .neq('user_id', profile.id)
        .eq('is_active', true);

      const userIds = (otherParts || []).map(p => p.user_id);

      if (userIds.length > 0) {
        // users table is readable by all authenticated users
        const { data: usersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, avatar_url, sex, membership_role')
          .in('id', userIds);

        const usersById = new Map((usersData || []).map(u => [u.id, u]));

        for (const part of (otherParts || [])) {
          const userData = usersById.get(part.user_id);
          if (userData) {
            otherParticipantsMap.set(part.conversation_id, {
              id: userData.id as string,
              firstName: userData.first_name as string,
              lastName: userData.last_name as string,
              avatarUrl: userData.avatar_url as string | null,
              sex: userData.sex as 'male' | 'female' | 'not_specified' | null | undefined,
              membershipRole: userData.membership_role as string,
            });
          }
        }
      }
    }

    // Build conversations with pre-fetched data
    const conversations: Conversation[] = Array.from(conversationMap.values()).map(({ pr, conv }) => {
      let otherParticipant = null;

      if (conv.type === 'direct') {
        otherParticipant = otherParticipantsMap.get(conv.id as string) || null;
      }

      return {
        id: conv.id as string,
        type: conv.type as 'direct' | 'group',
        name: conv.name as string | null,
        description: conv.description as string | null,
        avatarUrl: conv.avatar_url as string | null,
        createdById: conv.created_by_id as string,
        isActive: conv.is_active as boolean,
        allowReplies: conv.allow_replies as boolean,
        participantCount: conv.participant_count as number,
        lastMessageAt: conv.last_message_at as string | null,
        lastMessagePreview: conv.last_message_preview as string | null,
        lastMessageSenderId: conv.last_message_sender_id as string | null,
        createdAt: conv.created_at as string,
        updatedAt: conv.updated_at as string,
        pinnedMessageIds: (conv.pinned_message_ids as string[]) || [],
        otherParticipant,
        unreadCount: pr.unread_count as number,
        isMuted: pr.is_muted as boolean,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: ConversationsResponse = {
      conversations,
      total,
      page,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/messaging/conversations
 * Create a new conversation (DM or group).
 * All authenticated members can message each other freely.
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

    // Parse request body
    const body: CreateConversationRequest = await request.json();
    const { type, participantIds, name, description } = body;

    if (!type || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'type and participantIds are required' },
        { status: 400 }
      );
    }

    if (type === 'direct') {
      if (participantIds.length !== 1) {
        return NextResponse.json(
          { error: 'Direct messages must have exactly one other participant' },
          { status: 400 }
        );
      }

      // Return existing DM if one exists
      const otherUserId = participantIds[0];
      const { data: existingDM } = await supabase
        .rpc('find_existing_dm', {
          p_user_id_1: profile.id,
          p_user_id_2: otherUserId,
        });

      if (existingDM && existingDM.length > 0) {
        return NextResponse.json({ conversation: existingDM[0] });
      }

      // Verify recipient exists
      const { data: recipient } = await supabase
        .from('users')
        .select('id')
        .eq('id', otherUserId)
        .single();

      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }
    } else if (type === 'group') {
      if (!name) {
        return NextResponse.json(
          { error: 'Group name is required' },
          { status: 400 }
        );
      }
    }

    // Use service client with fallback to user's session client
    let insertClient: ReturnType<typeof createServiceClient> | typeof supabase = supabase;
    try {
      insertClient = createServiceClient();
    } catch {
      // Service client unavailable — use user's session client
    }

    const { data: conversation, error: convError } = await insertClient
      .from('conversations')
      .insert({
        type,
        name: type === 'group' ? name : null,
        description: type === 'group' ? description : null,
        created_by_id: profile.id,
        participant_count: participantIds.length + 1,
      })
      .select()
      .single();

    if (convError || !conversation) {
      console.error('[Messaging] Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Add participants
    const participants = [
      {
        conversation_id: conversation.id,
        user_id: profile.id,
        role: 'owner',
      },
      ...participantIds.map((id: string) => ({
        conversation_id: conversation.id,
        user_id: id,
        role: 'member',
      })),
    ];

    const { error: partError } = await insertClient
      .from('conversation_participants')
      .insert(participants);

    if (partError) {
      console.error('[Messaging] Error adding participants:', partError);
      await insertClient.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }

    // Add system message for group creation
    if (type === 'group') {
      await insertClient.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: null,
        type: 'system',
        content: `Група "${name}" створена`,
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
