import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { StarMessageResponse } from '@/types/messaging';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/messages/[id]/star
 * Toggle star/unstar on a message (user-specific bookmark)
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
      .select('id, conversation_id, is_deleted')
      .eq('id', messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.is_deleted) {
      return NextResponse.json({ error: 'Cannot star deleted message' }, { status: 400 });
    }

    // Check if user is participant in the conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', message.conversation_id)
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .single();

    if (!participant) {
      return NextResponse.json({ error: 'Not authorized to star this message' }, { status: 403 });
    }

    // Check if already starred
    const { data: existingStar } = await supabase
      .from('starred_messages')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .single();

    let isStarred: boolean;

    if (existingStar) {
      // Unstar (toggle off)
      const { error: deleteError } = await supabase
        .from('starred_messages')
        .delete()
        .eq('id', existingStar.id);

      if (deleteError) {
        console.error('[Messaging] Error unstarring message:', deleteError);
        return NextResponse.json({ error: 'Failed to unstar message' }, { status: 500 });
      }

      isStarred = false;
    } else {
      // Star (add)
      const { error: insertError } = await supabase
        .from('starred_messages')
        .insert({
          message_id: messageId,
          user_id: profile.id,
          conversation_id: message.conversation_id,
        });

      if (insertError) {
        console.error('[Messaging] Error starring message:', insertError);
        return NextResponse.json({ error: 'Failed to star message' }, { status: 500 });
      }

      isStarred = true;
    }

    const response: StarMessageResponse = {
      success: true,
      isStarred,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * GET /api/messaging/messages/[id]/star
 * Check if current user has starred a message
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

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if starred
    const { data: star } = await supabase
      .from('starred_messages')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .single();

    return NextResponse.json({
      isStarred: !!star,
    });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
