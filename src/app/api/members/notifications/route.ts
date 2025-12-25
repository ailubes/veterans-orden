import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { NotificationsResponse } from '@/types/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'unread'
    const type = searchParams.get('type'); // notification type filter
    const offset = (page - 1) * limit;

    // Build query for notifications
    let query = supabase
      .from('notification_recipients')
      .select(`
        id,
        notification_id,
        is_read,
        read_at,
        delivered_at,
        notifications!inner (
          id,
          title,
          message,
          type,
          metadata,
          sender:users!sender_id (
            first_name,
            last_name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', profile.id)
      .order('delivered_at', { ascending: false });

    // Apply filters
    if (filter === 'unread') {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('notifications.type', type);
    }

    // Execute paginated query
    const { data: notificationRecords, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Notifications] Error fetching:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Get unread count separately (always needed for badge)
    const { count: unreadCount } = await supabase
      .from('notification_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    // Transform data to match our interface
    const notifications = (notificationRecords || []).map((nr: Record<string, unknown>) => {
      const notification = nr.notifications as Record<string, unknown>;
      const sender = notification?.sender as Record<string, string> | null;

      return {
        id: nr.id as string,
        notificationId: nr.notification_id as string,
        title: notification?.title as string || '',
        message: notification?.message as string || '',
        type: notification?.type as string || 'info',
        isRead: nr.is_read as boolean,
        readAt: nr.read_at as string | null,
        deliveredAt: nr.delivered_at as string,
        sender: sender ? {
          firstName: sender.first_name || '',
          lastName: sender.last_name || '',
        } : undefined,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: NotificationsResponse = {
      notifications,
      unreadCount: unreadCount || 0,
      total,
      page,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
