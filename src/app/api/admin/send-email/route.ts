import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import {
  sendWelcomeEmail,
  sendEventReminderEmail,
  sendVoteReminderEmail,
  sendAdminNotificationEmail,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { profile: adminProfile } = await getAdminProfileFromRequest(request);

    // Only super_admin and admin can send emails
    if (!['super_admin', 'admin'].includes(adminProfile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(
          data.to,
          data.firstName,
          data.lastName
        );
        break;

      case 'event_reminder':
        result = await sendEventReminderEmail(
          data.to,
          data.firstName,
          data.eventTitle,
          data.eventDate,
          data.eventUrl
        );
        break;

      case 'vote_reminder':
        result = await sendVoteReminderEmail(
          data.to,
          data.firstName,
          data.voteTitle,
          data.voteDeadline,
          data.voteUrl
        );
        break;

      case 'admin_notification':
        result = await sendAdminNotificationEmail(
          data.to,
          data.subject,
          data.message
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      messageId: result?.id,
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
