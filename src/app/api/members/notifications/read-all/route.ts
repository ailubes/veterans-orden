import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { MarkAllReadResponse } from '@/types/notifications';

export const dynamic = 'force-dynamic';

export async function PATCH() {
  try {
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

    // Get count of unread notifications before update
    const { count: unreadBefore } = await supabase
      .from('notification_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    // Mark all as read
    const { error: updateError } = await supabase
      .from('notification_recipients')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    if (updateError) {
      console.error('[Notifications] Error marking all as read:', updateError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const response: MarkAllReadResponse = {
      success: true,
      markedCount: unreadBefore || 0,
      unreadCount: 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
