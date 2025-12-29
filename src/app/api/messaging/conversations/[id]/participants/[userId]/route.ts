import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { canRemoveFromGroup } from '@/lib/messaging/permissions';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/messaging/conversations/[id]/participants/[userId]
 * Remove a participant from a group conversation
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: conversationId, userId: targetUserId } = await params;
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

    // Check if user is participant with appropriate role
    const { data: removerParticipant } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!removerParticipant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get conversation
    const { data: conv } = await supabase
      .from('conversations')
      .select('type')
      .eq('id', conversationId)
      .single();

    if (!conv || conv.type !== 'group') {
      return NextResponse.json(
        { error: 'Can only remove participants from group conversations' },
        { status: 400 }
      );
    }

    // Get target participant
    const { data: targetParticipant } = await supabase
      .from('conversation_participants')
      .select(`
        id,
        role,
        user:users (
          id,
          first_name,
          last_name
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    if (!targetParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check permission
    if (!canRemoveFromGroup(removerParticipant.role, targetParticipant.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to remove this participant' },
        { status: 403 }
      );
    }

    // Remove participant
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({
        is_active: false,
        left_at: new Date().toISOString(),
        removed_by: profile.id,
      })
      .eq('id', targetParticipant.id);

    if (updateError) {
      console.error('[Messaging] Error removing participant:', updateError);
      return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
    }

    // Add system message
    const targetUser = targetParticipant.user as unknown as { id: string; first_name: string; last_name: string };
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: null,
      type: 'system',
      content: `${targetUser.first_name} ${targetUser.last_name} був видалений з групи`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/messaging/conversations/[id]/participants/[userId]
 * Update a participant's role (promote/demote)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: conversationId, userId: targetUserId } = await params;
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

    // Check if user is owner
    const { data: ownerParticipant } = await supabase
      .from('conversation_participants')
      .select('role')
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!ownerParticipant || ownerParticipant.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only group owner can change participant roles' },
        { status: 403 }
      );
    }

    // Get target participant
    const { data: targetParticipant } = await supabase
      .from('conversation_participants')
      .select('id, role')
      .eq('conversation_id', conversationId)
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .single();

    if (!targetParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (targetParticipant.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "member"' },
        { status: 400 }
      );
    }

    // Update role
    const { error: updateError } = await supabase
      .from('conversation_participants')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetParticipant.id);

    if (updateError) {
      console.error('[Messaging] Error updating participant role:', updateError);
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
