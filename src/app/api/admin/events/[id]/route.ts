import { NextRequest, NextResponse } from 'next/server';
import { getAdminProfileFromRequest } from '@/lib/permissions';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@/lib/audit';
import { validateBody } from '@/lib/validation/validate';
import { updateEventSchema } from '@/lib/validation/schemas';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/events/[id]
 * Get event details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check admin access
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*, created_by_user:users!events_created_by_fkey(first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/admin/events/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/events/[id]
 * Update event
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check admin access
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current event data
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check regional leader permissions
    if (adminProfile.role === 'regional_leader') {
      if (currentEvent.created_by !== adminProfile.id) {
        return NextResponse.json(
          { error: 'Regional leaders can only edit their own events' },
          { status: 403 }
        );
      }
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      updateEventSchema
    );

    if (validationError) {
      return validationError;
    }

    // Prepare update data from validated fields
    const updateData: Record<string, unknown> = {};
    const body = validatedData;

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.event_type !== undefined) updateData.event_type = body.event_type;
    if (body.scope !== undefined) updateData.scope = body.scope;
    if (body.is_online !== undefined) updateData.is_online = body.is_online;
    if (body.online_url !== undefined) updateData.online_url = body.online_url;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.max_attendees !== undefined) updateData.max_attendees = body.max_attendees;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.requirements !== undefined) updateData.requirements = body.requirements;

    // Only allow date changes if event hasn't started
    const now = new Date();
    const eventStartDate = new Date(currentEvent.start_date);

    if (eventStartDate > now) {
      if (body.start_date !== undefined) updateData.start_date = body.start_date;
      if (body.end_date !== undefined) updateData.end_date = body.end_date;
    }

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH /api/admin/events/[id]] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.UPDATE_EVENT,
      entityType: AUDIT_ENTITY_TYPES.EVENT,
      entityId: id,
      oldData: currentEvent,
      newData: updatedEvent,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ data: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/admin/events/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete event (soft delete by setting status to 'cancelled')
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { profile: adminProfile, auth } = await getAdminProfileFromRequest(request);
    const supabase = auth.supabase;

    // Check admin access
    if (!adminProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current event data
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('*, rsvps:event_rsvps(count)')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check regional leader permissions
    if (adminProfile.role === 'regional_leader') {
      if (event.created_by !== adminProfile.id) {
        return NextResponse.json(
          { error: 'Regional leaders can only delete their own events' },
          { status: 403 }
        );
      }
    }

    // Soft delete (set status to cancelled)
    const { error: deleteError } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (deleteError) {
      console.error('[DELETE /api/admin/events/[id]] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: adminProfile.id,
      action: AUDIT_ACTIONS.DELETE_EVENT,
      entityType: AUDIT_ENTITY_TYPES.EVENT,
      entityId: id,
      oldData: event,
      newData: { status: 'cancelled' },
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        message: 'Event cancelled successfully',
        warning: event.rsvps && event.rsvps.length > 0 ? `${event.rsvps.length} RSVPs were affected` : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/admin/events/[id]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
