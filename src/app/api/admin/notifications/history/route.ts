import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, isRegionalLeaderOnly } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/notifications/history
 * Get notification history with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const offset = (page - 1) * limit;

    // Build query — join sender via the correct FK name
    let query = supabase
      .from('notifications')
      .select(
        '*, sender:users!notifications_user_id_users_id_fk(first_name, last_name, email)',
        { count: 'exact' }
      );

    // Regional leaders see only notifications they sent
    if (isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)) {
      query = query.eq('user_id', adminProfile.id);
    }

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
