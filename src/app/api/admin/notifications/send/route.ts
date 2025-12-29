import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest, canSendNotificationTo, isRegionalLeaderOnly } from '@/lib/permissions';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/notifications/send
 * Send notification to users based on targeting scope
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Send Notification] Starting...');

    let adminProfile;
    try {
      const result = await getAdminProfileFromRequest(request);
      adminProfile = result.profile;
      console.log('[Send Notification] Admin authenticated:', adminProfile.id, adminProfile.staff_role, adminProfile.membership_role);
    } catch (authError) {
      console.error('[Send Notification] Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', stage: 'auth' },
        { status: 401 }
      );
    }

    // Use service role client for database operations (bypasses RLS)
    let supabase;
    try {
      supabase = createServiceClient();
      console.log('[Send Notification] Service client created');
    } catch (clientError) {
      console.error('[Send Notification] Service client error:', clientError);
      return NextResponse.json(
        { error: 'Database client creation failed', stage: 'client' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('[Send Notification] Request body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('[Send Notification] Body parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', stage: 'parse' },
        { status: 400 }
      );
    }

    const { title, message, type, scope, scopeValue } = body;

    // Validate input
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

    // Check permission for this scope
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
        // All active users
        recipientQuery = recipientQuery.eq('status', 'active');
        break;

      case 'role':
        if (!scopeValue) {
          return NextResponse.json(
            { error: 'Role is required for role scope' },
            { status: 400 }
          );
        }
        recipientQuery = recipientQuery.eq('role', scopeValue).eq('status', 'active');
        break;

      case 'oblast':
        if (!scopeValue) {
          return NextResponse.json(
            { error: 'Oblast ID is required for oblast scope' },
            { status: 400 }
          );
        }
        recipientQuery = recipientQuery
          .eq('oblast_id', scopeValue)
          .eq('status', 'active');
        break;

      case 'tier':
        if (!scopeValue) {
          return NextResponse.json(
            { error: 'Tier is required for tier scope' },
            { status: 400 }
          );
        }
        recipientQuery = recipientQuery
          .eq('membership_tier', scopeValue)
          .eq('status', 'active');
        break;

      case 'payment_expired':
        // Users who had a paid tier but membership expired
        recipientQuery = recipientQuery
          .lt('membership_paid_until', new Date().toISOString())
          .not('membership_paid_until', 'is', null)
          .eq('status', 'active');
        break;

      case 'never_paid':
        // Users who never paid (still on free tier)
        recipientQuery = recipientQuery
          .eq('membership_tier', 'free')
          .eq('status', 'active');
        break;

      case 'user':
        if (!scopeValue) {
          return NextResponse.json(
            { error: 'User ID is required for user scope' },
            { status: 400 }
          );
        }
        recipientQuery = recipientQuery.eq('id', scopeValue);
        break;

      case 'referral_tree':
        // For regional leaders (by membership), get their referral tree
        if (isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)) {
          const { data: referrals } = await supabase.rpc(
            'get_referral_tree_members',
            { leader_id: adminProfile.id }
          );

          if (referrals && referrals.length > 0) {
            const referralIds = referrals.map((r: { id: string }) => r.id);
            recipientQuery = recipientQuery.in('id', referralIds);
          } else {
            // No referrals, return empty
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
        return NextResponse.json(
          { error: `Invalid scope: ${scope}` },
          { status: 400 }
        );
    }

    // Get recipient list
    const { data: recipients, error: recipientError } = await recipientQuery;

    if (recipientError) {
      console.error('Error fetching recipients:', recipientError);
      return NextResponse.json(
        { error: 'Failed to fetch recipients' },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({
        success: true,
        recipientCount: 0,
        message: 'No recipients match the criteria',
      });
    }

    // Create notification record
    const notificationData = {
      sender_id: adminProfile.id,
      title,
      message,
      type: type || 'info',
      scope,
      scope_value: scopeValue || null,
      recipient_count: recipients.length,
      message_type: 'admin_to_member',
      metadata: {
        sent_by_name: `${adminProfile.first_name} ${adminProfile.last_name}`,
        sent_by_staff_role: adminProfile.staff_role,
        sent_by_membership_role: adminProfile.membership_role,
      },
    };

    console.log('[Send Notification] Inserting:', JSON.stringify(notificationData));

    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (notificationError || !notification) {
      console.error('[Send Notification] Insert error:', JSON.stringify(notificationError));
      return NextResponse.json(
        {
          error: 'Failed to create notification',
          stage: 'insert',
          details: notificationError?.message || 'Unknown error',
          code: notificationError?.code || 'UNKNOWN',
          hint: notificationError?.hint || null,
          data: notificationData,
        },
        { status: 500 }
      );
    }

    // Create recipient records
    const recipientRecords = recipients.map((recipient) => ({
      notification_id: notification.id,
      user_id: recipient.id,
    }));

    const { error: recipientInsertError } = await supabase
      .from('notification_recipients')
      .insert(recipientRecords);

    if (recipientInsertError) {
      console.error('Error creating recipient records:', recipientInsertError);
      // Don't fail the whole operation, just log it
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminProfile.id,
      action: 'send_notification',
      entity_type: 'notification',
      entity_id: notification.id,
      metadata: {
        title,
        scope,
        scope_value: scopeValue,
        recipient_count: recipients.length,
      },
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
        stage: 'unknown',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
