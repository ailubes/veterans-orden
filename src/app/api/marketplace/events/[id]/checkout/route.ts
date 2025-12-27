import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/get-user';
import { getUserBalance, spendPoints } from '@/lib/points';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/marketplace/events/[id]/checkout
 * Purchase ticket for a paid event
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: eventId } = await context.params;
    const { user, supabase, error: authError } = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if event requires ticket purchase
    if (!event.requires_ticket_purchase) {
      return NextResponse.json(
        { error: 'This event does not require ticket purchase' },
        { status: 400 }
      );
    }

    // Check if ticket price is set
    if (!event.ticket_price_points || event.ticket_price_points <= 0) {
      return NextResponse.json(
        { error: 'Ticket price not configured' },
        { status: 400 }
      );
    }

    // Check if tickets are available
    if (event.ticket_quantity !== null) {
      // Count existing ticket purchases
      const { count: ticketsSold } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('ticket_purchased', true);

      if ((ticketsSold || 0) >= event.ticket_quantity) {
        return NextResponse.json(
          { error: 'Tickets sold out' },
          { status: 400 }
        );
      }
    }

    // Check if user already purchased a ticket
    const { data: existingRsvp } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', profile.id)
      .single();

    if (existingRsvp && existingRsvp.ticket_purchased) {
      return NextResponse.json(
        { error: 'You have already purchased a ticket for this event' },
        { status: 400 }
      );
    }

    // Check user balance
    const balance = await getUserBalance(profile.id);
    if (balance.total < event.ticket_price_points) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          required: event.ticket_price_points,
          available: balance.total,
        },
        { status: 400 }
      );
    }

    // Generate order number
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: profile.id,
        status: 'confirmed', // Event tickets are instantly confirmed
        total_points: event.ticket_price_points,
        total_uah: event.ticket_price_uah || 0,
        requires_shipping: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error('Failed to create order');
    }

    // Create order item (event ticket)
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: eventId, // Using event ID as product reference
        product_name: event.title,
        product_type: 'event_ticket',
        quantity: 1,
        price_points: event.ticket_price_points,
        price_uah: event.ticket_price_uah || 0,
        created_at: new Date().toISOString(),
      });

    if (itemError) {
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error('Failed to create order item');
    }

    // Spend points
    try {
      await spendPoints({
        userId: profile.id,
        amount: event.ticket_price_points,
        type: 'spend_event',
        referenceType: 'event',
        referenceId: eventId,
        description: `Квиток на подію: ${event.title}`,
      });
    } catch (pointsError) {
      // Rollback order
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      throw pointsError;
    }

    // Create or update RSVP
    if (existingRsvp) {
      // Update existing RSVP
      const { error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          status: 'going',
          ticket_purchased: true,
          order_id: order.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', existingRsvp.id);

      if (updateError) {
        console.error('Failed to update RSVP:', updateError);
        // Don't rollback - ticket was purchased successfully
      }
    } else {
      // Create new RSVP
      const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          user_id: profile.id,
          status: 'going',
          ticket_purchased: true,
          order_id: order.id,
          responded_at: new Date().toISOString(),
        });

      if (rsvpError) {
        console.error('Failed to create RSVP:', rsvpError);
        // Don't rollback - ticket was purchased successfully
      }
    }

    // Update event going count (if RSVP was created/updated successfully)
    await supabase.rpc('increment_event_going_count', { event_id: eventId });

    return NextResponse.json({
      success: true,
      order,
      message: 'Квиток успішно придбано!',
    });
  } catch (error) {
    console.error('[POST /api/marketplace/events/[id]/checkout]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
