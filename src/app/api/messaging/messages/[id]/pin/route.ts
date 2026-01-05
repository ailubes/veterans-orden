import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { PinMessageResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/[id]/pin
 * Pin a message (admin/owner only, max 3 per conversation)
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
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, conversation_id, is_deleted, pinned_at')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.is_deleted) {
      return NextResponse.json({ error: 'Cannot pin deleted message' }, { status: 400 });
    }

    if (message.pinned_at) {
      return NextResponse.json({ error: 'Message is already pinned' }, { status: 400 });
    }

    // Check if user is admin/owner in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id, role')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (participant.role !== 'owner' && participant.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can pin messages' }, { status: 403 });
    }

    // Use the database function to pin (handles max 3 limit)
    const { data: pinSuccess, error: rpcError } = await supabase.rpc('pin_message', {
      p_message_id: messageId,
      p_user_id: profile.id,
    });

    if (rpcError) {
      console.error('[Messaging] Error pinning message:', rpcError);
      return NextResponse.json({ error: 'Failed to pin message' }, { status: 500 });
    }

    if (!pinSuccess) {
      // Check if max 3 limit reached
      const { data: conversation } = await supabase
        .from('conversations')
        .select('pinned_message_ids')
        .eq('id', message.conversation_id)
        .single();

      if (conversation?.pinned_message_ids?.length >= 3) {
        return NextResponse.json({
          error: 'Maximum 3 pinned messages allowed. Unpin another message first.'
        }, { status: 400 });
      }

      return NextResponse.json({ error: 'Failed to pin message' }, { status: 500 });
    }

    // Get updated message
    const { data: updatedMessage } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    const response: PinMessageResponse = {
      success: true,
      message: updatedMessage,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/messaging/messages/[id]/pin
 * Unpin a message (admin/owner only)
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
      .select('id, conversation_id, pinned_at')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (!message.pinned_at) {
      return NextResponse.json({ error: 'Message is not pinned' }, { status: 400 });
    }

    // Check if user is admin/owner in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id, role')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
    }

    if (participant.role !== 'owner' && participant.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can unpin messages' }, { status: 403 });
    }

    // Use the database function to unpin
    const { data: unpinSuccess, error: rpcError } = await supabase.rpc('unpin_message', {
      p_message_id: messageId,
      p_user_id: profile.id,
    });

    if (rpcError) {
      console.error('[Messaging] Error unpinning message:', rpcError);
      return NextResponse.json({ error: 'Failed to unpin message' }, { status: 500 });
    }

    if (!unpinSuccess) {
      return NextResponse.json({ error: 'Failed to unpin message' }, { status: 500 });
    }

    const response: PinMessageResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * GET /api/messaging/messages/[id]/pin
 * Get pin status of a message
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, pinned_at, pinned_by')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      isPinned: !!message.pinned_at,
      pinnedAt: message.pinned_at,
      pinnedBy: message.pinned_by,
    });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
