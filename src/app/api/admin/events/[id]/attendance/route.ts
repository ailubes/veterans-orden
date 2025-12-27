import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { awardPoints } from '@/lib/points';
import { DEFAULT_POINTS } from '@/lib/points/constants';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/events/[id]/attendance
 * Mark users as attended at an event and award points
 * Body: { userIds: string[] }
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can mark attendance' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, points_reward')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const pointsToAward = event.points_reward || DEFAULT_POINTS.EVENT_ATTENDANCE;
    const results = {
      success: [] as string[],
      alreadyAttended: [] as string[],
      noRsvp: [] as string[],
      errors: [] as { userId: string; error: string }[],
    };

    // Process each user
    for (const userId of userIds) {
      try {
        // Check if user has an RSVP
        const { data: rsvp, error: rsvpError } = await supabase
          .from('event_rsvps')
          .select('id, attended_at')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .single();

        if (rsvpError || !rsvp) {
          results.noRsvp.push(userId);
          continue;
        }

        // Check if already marked as attended
        if (rsvp.attended_at) {
          results.alreadyAttended.push(userId);
          continue;
        }

        // Mark as attended
        const { error: updateError } = await supabase
          .from('event_rsvps')
          .update({ attended_at: new Date().toISOString() })
          .eq('id', rsvp.id);

        if (updateError) {
          results.errors.push({ userId, error: updateError.message });
          continue;
        }

        // Award points
        try {
          await awardPoints({
            userId,
            amount: pointsToAward,
            type: 'earn_event',
            referenceType: 'event',
            referenceId: eventId,
            description: `Відвідування події: ${event.title}`,
            createdById: adminProfile.id,
          });

          results.success.push(userId);
        } catch (pointsError) {
          console.error('Points award error:', pointsError);
          // Still mark as success since attendance was recorded
          results.success.push(userId);
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
        results.errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      message: 'Attendance processed',
      pointsAwarded: pointsToAward,
      results,
    });
  } catch (error) {
    console.error('[POST /api/admin/events/[id]/attendance]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]/attendance
 * Remove attendance mark from users (does not refund points)
 * Body: { userIds: string[] }
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    if (
      adminProfile.role !== 'super_admin' &&
      adminProfile.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: 'Only admins can remove attendance records' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Remove attendance marks
    const { error } = await supabase
      .from('event_rsvps')
      .update({ attended_at: null })
      .eq('event_id', eventId)
      .in('user_id', userIds);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Attendance marks removed',
      count: userIds.length,
    });
  } catch (error) {
    console.error('[DELETE /api/admin/events/[id]/attendance]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
