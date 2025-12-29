import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { MessagingSettings } from '@/types/messaging';
import { canAddToGroup } from '@/lib/messaging/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messaging/conversations/[id]/participants
 * Get all participants of a conversation
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

    // Get all participants
    const { data: participants, error } = await supabase
      .from('conversation_participants')
      .select(`
        id,
        user_id,
        role,
        is_muted,
        last_read_at,
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

    if (error) {
      console.error('[Messaging] Error fetching participants:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const formattedParticipants = (participants || []).map((p: Record<string, unknown>) => {
      const u = p.user as Record<string, unknown>;
      return {
        id: p.id,
        userId: p.user_id,
        role: p.role,
        isMuted: p.is_muted,
        lastReadAt: p.last_read_at,
        unreadCount: p.unread_count,
        isActive: p.is_active,
        joinedAt: p.joined_at,
        user: {
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          avatarUrl: u.avatar_url,
          membershipRole: u.membership_role,
        },
      };
    });

    return NextResponse.json({ participants: formattedParticipants });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/messaging/conversations/[id]/participants
 * Add participants to a group conversation
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
      .select('id, membership_role')
      .eq('clerk_id', user.id)
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

    // Get conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('type, participant_count')
      .eq('id', conversationId)
      .single();

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.type !== 'group') {
      return NextResponse.json(
        { error: 'Can only add participants to group conversations' },
        { status: 400 }
      );
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

    // Check permission
    if (!canAddToGroup(participant.role, profile.membership_role, settings)) {
      return NextResponse.json(
        { error: 'You do not have permission to add participants' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    // Check max participants limit
    if (conv.participant_count + userIds.length > settings.messaging_max_group_participants) {
      return NextResponse.json(
        { error: `Maximum ${settings.messaging_max_group_participants} participants allowed` },
        { status: 400 }
      );
    }

    // Validate users exist
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (!users || users.length !== userIds.length) {
      return NextResponse.json(
        { error: 'Some users not found' },
        { status: 400 }
      );
    }

    // Check if users are already participants
    const { data: existingParticipants } = await supabase
      .from('conversation_participants')
      .select('user_id, is_active')
      .eq('conversation_id', conversationId)
      .in('user_id', userIds);

    const existingMap = new Map(
      (existingParticipants || []).map((p: Record<string, unknown>) => [p.user_id, p.is_active])
    );

    const toInsert: string[] = [];
    const toReactivate: string[] = [];

    for (const userId of userIds) {
      if (existingMap.has(userId)) {
        if (!existingMap.get(userId)) {
          toReactivate.push(userId);
        }
        // Already active - skip
      } else {
        toInsert.push(userId);
      }
    }

    // Insert new participants
    if (toInsert.length > 0) {
      const newParticipants = toInsert.map((userId) => ({
        conversation_id: conversationId,
        user_id: userId,
        role: 'member',
      }));

      const { error: insertError } = await supabase
        .from('conversation_participants')
        .insert(newParticipants);

      if (insertError) {
        console.error('[Messaging] Error adding participants:', insertError);
        return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
      }
    }

    // Reactivate previously left participants
    if (toReactivate.length > 0) {
      await supabase
        .from('conversation_participants')
        .update({
          is_active: true,
          left_at: null,
          removed_by: null,
          joined_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .in('user_id', toReactivate);
    }

    // Add system message
    const addedUsers = users.filter(
      (u: Record<string, unknown>) => toInsert.includes(u.id as string) || toReactivate.includes(u.id as string)
    );

    if (addedUsers.length > 0) {
      const names = addedUsers.map((u: Record<string, unknown>) => `${u.first_name} ${u.last_name}`).join(', ');
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: null,
        type: 'system',
        content: `${names} ${addedUsers.length === 1 ? 'приєднався до групи' : 'приєдналися до групи'}`,
      });
    }

    return NextResponse.json({
      success: true,
      added: toInsert.length + toReactivate.length,
    });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
