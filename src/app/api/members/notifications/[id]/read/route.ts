import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MarkReadResponse } from '@/types/notifications';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Verify this notification belongs to the current user
    const { data: recipient } = await supabase
      .from('notification_recipients')
      .select('id, notification_id, is_read')
      .eq('id', id)
      .eq('user_id', profile.id)
      .single();

    if (!recipient) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // If already read, just return current unread count
    if (recipient.is_read) {
      const { count: unreadCount } = await supabase
        .from('notification_recipients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      const response: MarkReadResponse = {
        success: true,
        unreadCount: unreadCount || 0,
      };

      return NextResponse.json(response);
    }

    // Mark as read
    const { error: updateError } = await supabase
      .from('notification_recipients')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Notifications] Error marking as read:', updateError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Try to increment read_count on parent notification (optional, may not exist)
    try {
      await supabase.rpc('increment_notification_read_count', {
        notification_id: recipient.notification_id,
      });
    } catch {
      // RPC function may not exist, silently ignore
    }

    // Get updated unread count
    const { count: unreadCount } = await supabase
      .from('notification_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    const response: MarkReadResponse = {
      success: true,
      unreadCount: unreadCount || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
