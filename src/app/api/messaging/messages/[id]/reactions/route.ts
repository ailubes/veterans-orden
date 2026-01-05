import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/[id]/reactions
 * Add or toggle a reaction on a message
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
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, conversation_id, is_deleted')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.is_deleted) {
      return NextResponse.json({ error: 'Cannot react to deleted message' }, { status: 400 });
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
      return NextResponse.json({ error: 'Not authorized to react to this message' }, { status: 403 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji || typeof emoji !== 'string' || emoji.length > 10) {
      return NextResponse.json({ error: 'Valid emoji is required' }, { status: 400 });
    }

    // Check if reaction exists
    const { data: existingReaction } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .eq('emoji', emoji)
      .single();

    let action: 'added' | 'removed';

    if (existingReaction) {
      // Remove reaction (toggle off)
      await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id);
      action = 'removed';
    } else {
      // Add reaction
      await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: profile.id,
          emoji,
        });
      action = 'added';
    }

    // Update message metadata with aggregated reactions
    const { data: allReactions } = await supabase
      .from('message_reactions')
      .select(`
        emoji,
        user_id,
        user:users (
          id,
          first_name,
          last_name
        )
      `)
      .eq('message_id', messageId);

    // Group reactions by emoji
    const reactionMap: Record<string, { userId: string; firstName: string; lastName: string }[]> = {};
    for (const r of allReactions || []) {
      const u = r.user as unknown as Record<string, unknown>;
      if (!reactionMap[r.emoji]) {
        reactionMap[r.emoji] = [];
      }
      reactionMap[r.emoji].push({
        userId: r.user_id,
        firstName: u.first_name as string,
        lastName: u.last_name as string,
      });
    }

    // Update message metadata
    await supabase
      .from('messages')
      .update({
        metadata: { reactions: reactionMap },
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return NextResponse.json({
      success: true,
      action,
      reactions: reactionMap,
    });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/messaging/messages/[id]/reactions
 * Remove a reaction from a message
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

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji parameter required' }, { status: 400 });
    }

    // Delete reaction
    const { error: deleteError } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .eq('emoji', emoji);

    if (deleteError) {
      console.error('[Messaging] Error deleting reaction:', deleteError);
      return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
    }

    // Update message metadata
    const { data: allReactions } = await supabase
      .from('message_reactions')
      .select(`
        emoji,
        user_id,
        user:users (
          id,
          first_name,
          last_name
        )
      `)
      .eq('message_id', messageId);

    // Group reactions by emoji
    const reactionMap: Record<string, { userId: string; firstName: string; lastName: string }[]> = {};
    for (const r of allReactions || []) {
      const u = r.user as unknown as Record<string, unknown>;
      if (!reactionMap[r.emoji]) {
        reactionMap[r.emoji] = [];
      }
      reactionMap[r.emoji].push({
        userId: r.user_id,
        firstName: u.first_name as string,
        lastName: u.last_name as string,
      });
    }

    // Update message metadata
    await supabase
      .from('messages')
      .update({
        metadata: { reactions: reactionMap },
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
