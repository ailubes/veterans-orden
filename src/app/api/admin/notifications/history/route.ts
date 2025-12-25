import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile, isRegionalLeader } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/notifications/history
 * Get notification history with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const adminProfile = await getAdminProfile();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('notifications')
      .select('*, sender:users!sender_id(first_name, last_name, email)', {
        count: 'exact',
      });

    // Regional leaders see only their own notifications
    if (isRegionalLeader(adminProfile.role)) {
      query = query.eq('sender_id', adminProfile.id);
    }

    // Execute query with pagination
    const { data: notifications, count, error } = await query
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('[Notifications History Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
