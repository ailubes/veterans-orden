import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';

export const dynamic = 'force-dynamic';

interface SendMessageRequest {
  targetType: 'referrer' | 'regional_leader';
  title: string;
  message: string;
}

/**
 * POST /api/members/messages/send
 * Send a message from a member to their referrer or regional leader
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get member profile with referrer and oblast info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        referred_by_id,
        oblast_id,
        status
      `)
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active members can send messages' },
        { status: 403 }
      );
    }

    const body: SendMessageRequest = await request.json();
    const { targetType, title, message } = body;

    // Validate input
    if (!targetType || !title || !message) {
      return NextResponse.json(
        { error: 'targetType, title, and message are required' },
        { status: 400 }
      );
    }

    if (!['referrer', 'regional_leader'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid targetType. Must be "referrer" or "regional_leader"' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    let recipientId: string | null = null;
    let recipientName: string | null = null;

    if (targetType === 'referrer') {
      // Get the referrer
      if (!profile.referred_by_id) {
        return NextResponse.json(
          { error: 'You do not have a referrer to message' },
          { status: 400 }
        );
      }

      const { data: referrer } = await supabase
        .from('users')
        .select('id, first_name, last_name, status')
        .eq('id', profile.referred_by_id)
        .single();

      if (!referrer || referrer.status !== 'active') {
        return NextResponse.json(
          { error: 'Your referrer is not available' },
          { status: 400 }
        );
      }

      recipientId = referrer.id;
      recipientName = `${referrer.first_name} ${referrer.last_name}`;
    } else {
      // Get the regional leader for the member's oblast
      if (!profile.oblast_id) {
        return NextResponse.json(
          { error: 'You are not assigned to an oblast' },
          { status: 400 }
        );
      }

      const { data: oblast } = await supabase
        .from('oblasts')
        .select('id, name, leader_id')
        .eq('id', profile.oblast_id)
        .single();

      if (!oblast || !oblast.leader_id) {
        return NextResponse.json(
          { error: 'Your oblast does not have a regional leader' },
          { status: 400 }
        );
      }

      const { data: leader } = await supabase
        .from('users')
        .select('id, first_name, last_name, status')
        .eq('id', oblast.leader_id)
        .single();

      if (!leader || leader.status !== 'active') {
        return NextResponse.json(
          { error: 'The regional leader is not available' },
          { status: 400 }
        );
      }

      recipientId = leader.id;
      recipientName = `${leader.first_name} ${leader.last_name}`;
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        sender_id: profile.id,
        title,
        message,
        type: 'info',
        scope: 'user',
        scope_value: recipientId,
        message_type: 'member_to_leader',
        recipient_count: 1,
        metadata: {
          sender_name: `${profile.first_name} ${profile.last_name}`,
          target_type: targetType,
        },
      })
      .select()
      .single();

    if (notificationError || !notification) {
      console.error('[Member Message] Error creating notification:', notificationError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Create recipient record
    const { error: recipientError } = await supabase
      .from('notification_recipients')
      .insert({
        notification_id: notification.id,
        user_id: recipientId,
      });

    if (recipientError) {
      console.error('[Member Message] Error creating recipient:', recipientError);
    }

    return NextResponse.json({
      success: true,
      recipientName,
      message: `Повідомлення надіслано до ${recipientName}`,
    });
  } catch (error) {
    console.error('[Member Message] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
