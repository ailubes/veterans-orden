import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { SupabaseClient } from '@supabase/supabase-js';
import { validateBody } from '@/lib/validation/validate';
import { rsvpEventSchema } from '@/lib/validation/schemas';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Validate request body
    const { data: validatedData, error: validationError } = await validateBody(
      request,
      rsvpEventSchema
    );

    if (validationError) {
      return validationError;
    }

    const { status } = validatedData;

    // Check if event requires ticket purchase
    const { data: event } = await supabase
      .from('events')
      .select('requires_ticket_purchase, ticket_price_points')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // For paid events, users cannot RSVP as "going" without purchasing a ticket
    if (event.requires_ticket_purchase && status === 'going') {
      const { data: existingRsvp } = await supabase
        .from('event_rsvps')
        .select('ticket_purchased')
        .eq('event_id', eventId)
        .eq('user_id', profile.id)
        .single();

      if (!existingRsvp || !existingRsvp.ticket_purchased) {
        return NextResponse.json(
          {
            error: 'Ticket purchase required',
            message: 'Ви повинні придбати квиток, щоб підтвердити участь у цій події',
            ticketPricePoints: event.ticket_price_points,
            requiresTicket: true,
          },
          { status: 400 }
        );
      }
    }

    // Check if user already has an RSVP
    const { data: existingRsvp } = await supabase
      .from('event_rsvps')
      .select('id, status, ticket_purchased')
      .eq('event_id', eventId)
      .eq('user_id', profile.id)
      .single();

    if (existingRsvp) {
      // Update existing RSVP
      const { error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', existingRsvp.id);

      if (updateError) throw updateError;

      // Update event counters
      await updateEventCounters(supabase, eventId);
    } else {
      // Create new RSVP
      const { error: insertError } = await supabase.from('event_rsvps').insert({
        event_id: eventId,
        user_id: profile.id,
        status,
        responded_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // Update event counters
      await updateEventCounters(supabase, eventId);
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if RSVP has a purchased ticket
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('ticket_purchased, order_id')
      .eq('event_id', eventId)
      .eq('user_id', profile.id)
      .single();

    if (rsvp && rsvp.ticket_purchased) {
      return NextResponse.json(
        {
          error: 'Cannot cancel ticket purchase',
          message: 'Щоб скасувати квиток, зверніться до адміністратора для повернення коштів',
          orderId: rsvp.order_id,
        },
        { status: 400 }
      );
    }

    // Delete RSVP
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', profile.id);

    if (error) throw error;

    // Update event counters
    await updateEventCounters(supabase, eventId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('RSVP delete error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateEventCounters(supabase: SupabaseClient<any, 'public', any>, eventId: string) {
  // Count going
  const { count: goingCount } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'going');

  // Count maybe
  const { count: maybeCount } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'maybe');

  // Update event
  await supabase
    .from('events')
    .update({
      going_count: goingCount || 0,
      maybe_count: maybeCount || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId);
}
