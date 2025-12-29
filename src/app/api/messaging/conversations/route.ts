import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import { canInitiateDMs, canCreateGroupChats, canMessageUser, isRegionalLeaderMembership } from '@/lib/messaging/permissions';
import type { Conversation, ConversationsResponse, CreateConversationRequest, MessagingSettings } from '@/types/messaging';
import type { StaffRole } from '@/lib/permissions-utils';
import type { MembershipRole } from '@/lib/constants';

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
      .eq('clerk_id', user.id)
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

    // For each conversation, get the other participant (for DMs)
    const conversations: Conversation[] = await Promise.all(
      (participantRecords || []).map(async (pr: Record<string, unknown>) => {
        const conv = pr.conversations as Record<string, unknown>;
        let otherParticipant = null;

        // For DMs, get the other participant
        if (conv.type === 'direct') {
          const { data: otherPart } = await supabase
            .from('conversation_participants')
            .select(`
              user:users (
                id,
                first_name,
                last_name,
                avatar_url,
                membership_role
              )
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', profile.id)
            .eq('is_active', true)
            .single();

          if (otherPart?.user) {
            const u = otherPart.user as unknown as Record<string, unknown>;
            otherParticipant = {
              id: u.id as string,
              firstName: u.first_name as string,
              lastName: u.last_name as string,
              avatarUrl: u.avatar_url as string | null,
              membershipRole: u.membership_role as string,
            };
          }
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
      })
    );

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
 * Create a new conversation (DM or group)
 */
export async function POST(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with staff_role
    const { data: profile } = await supabase
      .from('users')
      .select('id, membership_role, staff_role, referred_by_id, group_id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const membershipRole = (profile.membership_role || 'supporter') as MembershipRole;
    const staffRole = (profile.staff_role || 'none') as StaffRole;

    // Parse request body
    const body: CreateConversationRequest = await request.json();
    const { type, participantIds, name, description } = body;

    if (!type || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'type and participantIds are required' },
        { status: 400 }
      );
    }

    // Get messaging settings
    const { data: settingsRows } = await supabase
      .from('organization_settings')
      .select('key, value')
      .like('key', 'messaging_%');

    const settings: MessagingSettings = {
      messaging_enabled: true,
      messaging_dm_enabled: true,
      messaging_group_chat_enabled: true,
      messaging_dm_initiator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
      messaging_group_creator_roles: ['network_leader', 'regional_leader', 'national_leader', 'network_guide'],
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

    // Check if messaging is enabled
    if (!settings.messaging_enabled) {
      return NextResponse.json(
        { error: 'Messaging is disabled' },
        { status: 403 }
      );
    }

    // Validate permissions based on type
    if (type === 'direct') {
      if (!canInitiateDMs(membershipRole, staffRole, settings)) {
        return NextResponse.json(
          { error: 'You do not have permission to start direct messages' },
          { status: 403 }
        );
      }

      if (participantIds.length !== 1) {
        return NextResponse.json(
          { error: 'Direct messages must have exactly one other participant' },
          { status: 400 }
        );
      }

      // Check for existing DM
      const otherUserId = participantIds[0];
      const { data: existingDM } = await supabase
        .rpc('find_existing_dm', {
          p_user_id_1: profile.id,
          p_user_id_2: otherUserId,
        });

      if (existingDM && existingDM.length > 0) {
        return NextResponse.json({ conversation: existingDM[0] });
      }

      // Validate that user can message this recipient
      const { data: recipient } = await supabase
        .from('users')
        .select('id, membership_role, referred_by_id, group_id')
        .eq('id', otherUserId)
        .single();

      if (!recipient) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      // Check if recipient is a direct referral of sender
      const isDirectReferral = recipient.referred_by_id === profile.id;

      // Check if recipient is in sender's referral tree (for regional leaders)
      let isInReferralTree = isDirectReferral; // Direct referrals are always in tree
      if (!isInReferralTree && isRegionalLeaderMembership(membershipRole)) {
        const { data: treeCheck } = await supabase.rpc('is_in_referral_tree', {
          p_referrer_id: profile.id,
          p_user_id: otherUserId,
        });
        isInReferralTree = treeCheck === true;
      }

      // Get sender's direct referral count (for members with 2+ referrals rule)
      const { count: referralCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by_id', profile.id);

      // Check if user is in a group led by sender
      const { data: leaderGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('leader_id', profile.id);

      const isInLeaderGroup = leaderGroups?.some((g) => g.id === recipient.group_id) || false;

      const canMessage = canMessageUser({
        senderMembershipRole: membershipRole,
        senderStaffRole: staffRole,
        senderReferralCount: referralCount || 0,
        recipientMembershipRole: recipient.membership_role as MembershipRole,
        isDirectReferral,
        isInReferralTree,
        isInLeaderGroup,
        isSameGroup: profile.group_id === recipient.group_id,
        settings,
      });

      if (!canMessage) {
        return NextResponse.json(
          { error: 'You do not have permission to message this user' },
          { status: 403 }
        );
      }
    } else if (type === 'group') {
      if (!canCreateGroupChats(membershipRole, staffRole, settings)) {
        return NextResponse.json(
          { error: 'You do not have permission to create group chats' },
          { status: 403 }
        );
      }

      if (participantIds.length > settings.messaging_max_group_participants - 1) {
        return NextResponse.json(
          { error: `Maximum ${settings.messaging_max_group_participants} participants allowed` },
          { status: 400 }
        );
      }

      if (!name) {
        return NextResponse.json(
          { error: 'Group name is required' },
          { status: 400 }
        );
      }
    }

    // Create conversation using service client to bypass RLS
    // (we've already validated permissions above)
    const serviceClient = createServiceClient();

    const { data: conversation, error: convError } = await serviceClient
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

    const { error: partError } = await serviceClient
      .from('conversation_participants')
      .insert(participants);

    if (partError) {
      console.error('[Messaging] Error adding participants:', partError);
      // Rollback conversation creation
      await serviceClient.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }

    // Add system message for group creation
    if (type === 'group') {
      await serviceClient.from('messages').insert({
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
