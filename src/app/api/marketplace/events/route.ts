import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/marketplace/events
 * Get all paid events (requires_ticket_purchase = true)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get all events that require ticket purchase and are published
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('requires_ticket_purchase', true)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString()) // Only future events
      .order('start_date', { ascending: true });

    if (error) {
      throw error;
    }

    // Get tickets sold for each event
    const ticketsSold: Record<string, number> = {};

    if (events && events.length > 0) {
      const eventIds = events.map((e) => e.id);

      const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('ticket_purchased', true);

      // Count tickets sold per event
      if (rsvps) {
        rsvps.forEach((rsvp) => {
          ticketsSold[rsvp.event_id] = (ticketsSold[rsvp.event_id] || 0) + 1;
        });
      }
    }

    return NextResponse.json({
      events: events || [],
      ticketsSold,
    });
  } catch (error) {
    console.error('[GET /api/marketplace/events]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
