import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { createServiceClient } from '@/lib/supabase/server';
import { canInitiateDMs, canMessageUser, isRegionalLeaderMembership } from '@/lib/messaging/permissions';
import type { Conversation, MessagingSettings } from '@/types/messaging';
import type { StaffRole } from '@/lib/permissions-utils';
import type { MembershipRole } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/dm/[userId]
 * Get or create a DM conversation with a user
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

    // Get user profile with staff_role
    const { data: profile } = await supabase
      .from('users')
      .select('id, membership_role, staff_role, referred_by_id, group_id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.id === otherUserId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const membershipRole = (profile.membership_role || 'supporter') as MembershipRole;
    const staffRole = (profile.staff_role || 'none') as StaffRole;

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
    if (!settings.messaging_enabled || !settings.messaging_dm_enabled) {
      return NextResponse.json(
        { error: 'Direct messages are disabled' },
        { status: 403 }
      );
    }

    // Check for existing DM
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
        // Check if other user is participant
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
      // Get conversation with participant info
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

    // Need to create new DM - check permissions
    if (!canInitiateDMs(membershipRole, staffRole, settings)) {
      return NextResponse.json(
        { error: 'You do not have permission to start direct messages' },
        { status: 403 }
      );
    }

    // Get recipient info
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, membership_role, referred_by_id, group_id')
      .eq('id', otherUserId)
      .single();

    if (!recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Create new DM conversation using service client to bypass RLS
    // (we've already validated permissions above)
    const serviceClient = createServiceClient();

    const { data: conversation, error: convError } = await serviceClient
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

    // Add participants
    const { error: partError } = await serviceClient
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversation.id,
          user_id: profile.id,
          role: 'owner',
        },
        {
          conversation_id: conversation.id,
          user_id: otherUserId,
          role: 'member',
        },
      ]);

    if (partError) {
      console.error('[Messaging] Error adding participants:', partError);
      await serviceClient.from('conversations').delete().eq('id', conversation.id);
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
