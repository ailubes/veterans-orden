import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/[id]/read
 * Mark a message (and all before it) as read
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
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get message
    const { data: message } = await supabase
      .from('messages')
      .select('id, conversation_id, created_at')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id, last_read_at')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Mark messages as read using the stored function
    const { data: clearedCount, error: readError } = await supabase.rpc('mark_messages_read', {
      p_conversation_id: message.conversation_id,
      p_user_id: profile.id,
    });

    if (readError) {
      console.error('[Messaging] Error marking messages as read:', readError);
      return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }

    // Update last_read_message_id
    await supabase
      .from('conversation_participants')
      .update({
        last_read_message_id: messageId,
        last_read_at: new Date().toISOString(),
      })
      .eq('id', participant.id);

    // Insert read receipt
    await supabase
      .from('message_read_receipts')
      .upsert({
        message_id: messageId,
        user_id: profile.id,
        read_at: new Date().toISOString(),
      }, { onConflict: 'message_id,user_id' });

    return NextResponse.json({
      success: true,
      clearedCount: clearedCount || 0,
    });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
