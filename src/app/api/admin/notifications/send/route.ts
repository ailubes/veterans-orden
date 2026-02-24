import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, canSendNotificationTo, isRegionalLeaderOnly } from '@/lib/permissions';
import { deliverNotificationToTelegram } from '@/lib/telegram/notify';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/notifications/send
 * Send notification to users based on targeting scope
 */
export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    // Use the admin's authenticated supabase client (bypasses per-user RLS via admin policies)
    const supabase = auth.supabase;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, message, type, scope, scopeValue } = body;

    if (!title || !message || !scope) {
      return NextResponse.json(
        { error: 'Title, message, and scope are required' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    if (!canSendNotificationTo(adminProfile.staff_role, adminProfile.membership_role, scope)) {
      return NextResponse.json(
        { error: `You do not have permission to send notifications to ${scope}` },
        { status: 403 }
      );
    }

    // Determine recipient list based on scope
    let recipientQuery = supabase.from('users').select('id');

    switch (scope) {
      case 'all':
        recipientQuery = recipientQuery.eq('status', 'active');
        break;

      case 'role':
        if (!scopeValue) {
          return NextResponse.json({ error: 'Role is required for role scope' }, { status: 400 });
        }
        recipientQuery = recipientQuery.eq('role', scopeValue).eq('status', 'active');
        break;

      case 'oblast':
        if (!scopeValue) {
          return NextResponse.json({ error: 'Oblast ID is required for oblast scope' }, { status: 400 });
        }
        recipientQuery = recipientQuery.eq('oblast_id', scopeValue).eq('status', 'active');
        break;

      case 'tier':
        if (!scopeValue) {
          return NextResponse.json({ error: 'Tier is required for tier scope' }, { status: 400 });
        }
        recipientQuery = recipientQuery.eq('membership_tier', scopeValue).eq('status', 'active');
        break;

      case 'payment_expired':
        recipientQuery = recipientQuery
          .lt('membership_paid_until', new Date().toISOString())
          .not('membership_paid_until', 'is', null)
          .eq('status', 'active');
        break;

      case 'never_paid':
        recipientQuery = recipientQuery.eq('membership_tier', 'free').eq('status', 'active');
        break;

      case 'user':
        if (!scopeValue) {
          return NextResponse.json({ error: 'User ID is required for user scope' }, { status: 400 });
        }
        recipientQuery = recipientQuery.eq('id', scopeValue);
        break;

      case 'referral_tree':
        if (isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)) {
          const { data: referrals } = await supabase.rpc(
            'get_referral_tree_members',
            { leader_id: adminProfile.id }
          );

          if (referrals && referrals.length > 0) {
            const referralIds = referrals.map((r: { id: string }) => r.id);
            recipientQuery = recipientQuery.in('id', referralIds);
          } else {
            return NextResponse.json({
              success: true,
              recipientCount: 0,
              message: 'No recipients in your referral tree',
            });
          }
        } else {
          return NextResponse.json(
            { error: 'Only regional leaders can send to referral tree' },
            { status: 403 }
          );
        }
        break;

      default:
        return NextResponse.json({ error: `Invalid scope: ${scope}` }, { status: 400 });
    }

    const { data: recipients, error: recipientError } = await recipientQuery;

    if (recipientError) {
      console.error('[Send Notification] Error fetching recipients:', recipientError);
      return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        success: true,
        recipientCount: 0,
        message: 'No recipients match the criteria',
      });
    }

    // Map the requested type to a valid notification_type enum value
    // Enum: system, vote, event, task, achievement, news, referral
    const validTypes = ['system', 'vote', 'event', 'task', 'achievement', 'news', 'referral'];
    const notifType = validTypes.includes(type) ? type : 'system';

    // Create one notification record (user_id = sender/admin)
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: adminProfile.id,
        title,
        body: message,
        type: notifType,
        sent_at: new Date().toISOString(),
        data: {
          scope,
          scope_value: scopeValue || null,
          recipient_count: recipients.length,
          sent_by_name: `${adminProfile.first_name} ${adminProfile.last_name}`,
          sent_by_staff_role: adminProfile.staff_role,
        },
      })
      .select()
      .single();

    if (notificationError || !notification) {
      console.error('[Send Notification] Insert error:', notificationError);
      return NextResponse.json(
        {
          error: 'Failed to create notification',
          details: notificationError?.message,
        },
        { status: 500 }
      );
    }

    // Create recipient records
    const recipientRecords = recipients.map((recipient: { id: string }) => ({
      notification_id: notification.id,
      user_id: recipient.id,
    }));

    const { error: recipientInsertError } = await supabase
      .from('notification_recipients')
      .insert(recipientRecords);

    if (recipientInsertError) {
      console.error('[Send Notification] Recipient insert error:', recipientInsertError);
      // Non-fatal: notification created, just recipients not linked
    }

    // Fire-and-forget Telegram delivery for users who have Telegram linked
    deliverNotificationToTelegram(notification.id, {
      id: notification.id,
      title,
      body: message,
      type: notifType as 'system' | 'vote' | 'event' | 'task' | 'achievement' | 'news' | 'referral',
      data: notification.data as Record<string, unknown>,
    }).catch((err) => {
      console.error('[Send Notification] Telegram delivery error:', err);
    });

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      recipientCount: recipients.length,
      message: `Notification sent to ${recipients.length} users`,
    });
  } catch (error) {
    console.error('[Send Notification Error]', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
