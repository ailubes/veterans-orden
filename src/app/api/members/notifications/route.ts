import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import type { NotificationsResponse, NotificationType } from '@/types/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
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
        notifications!notification_recipients_notification_id_fkey (
          id,
          title,
          body,
          type
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

    // Normalize timestamps from TIMESTAMP WITHOUT TIME ZONE columns by appending Z (UTC)
    const toUtc = (s: unknown): string | null => {
      if (!s) return null;
      const str = s as string;
      return str.endsWith('Z') || str.includes('+') ? str : str + 'Z';
    };

    // Transform data to match our interface
    const notifications = (notificationRecords || []).map((nr: Record<string, unknown>) => {
      const notification = nr.notifications as Record<string, unknown>;

      return {
        id: nr.id as string,
        notificationId: nr.notification_id as string,
        title: notification?.title as string || '',
        message: notification?.body as string || '',
        type: (notification?.type || 'system') as NotificationType,
        isRead: nr.is_read as boolean,
        readAt: toUtc(nr.read_at),
        deliveredAt: toUtc(nr.delivered_at) || new Date().toISOString(),
        sender: undefined,
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
