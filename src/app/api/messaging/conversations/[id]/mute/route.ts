import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

/**
 * POST /api/messaging/conversations/[id]/mute
 * Mute a conversation
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
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { duration } = body; // Optional: duration in hours

    let mutedUntil: string | null = null;
    if (duration && typeof duration === 'number' && duration > 0) {
      const date = new Date();
      date.setHours(date.getHours() + duration);
      mutedUntil = date.toISOString();
    }

    // Mute using stored function
    const { error } = await supabase.rpc('mute_conversation', {
      p_conversation_id: conversationId,
      p_user_id: profile.id,
      p_muted_until: mutedUntil,
    });

    if (error) {
      console.error('[Messaging] Error muting conversation:', error);
      return NextResponse.json({ error: 'Failed to mute conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, mutedUntil });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/messaging/conversations/[id]/mute
 * Unmute a conversation
 */
export async function DELETE(
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

    // Unmute using stored function
    const { error } = await supabase.rpc('unmute_conversation', {
      p_conversation_id: conversationId,
      p_user_id: profile.id,
    });

    if (error) {
      console.error('[Messaging] Error unmuting conversation:', error);
      return NextResponse.json({ error: 'Failed to unmute conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Messaging] Unexpected error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
