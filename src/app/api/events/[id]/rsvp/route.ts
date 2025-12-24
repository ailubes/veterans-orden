import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const body = await request.json();
    const { status } = body; // 'going', 'maybe', 'not_going'

    if (!['going', 'maybe', 'not_going'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user already has an RSVP
    const { data: existingRsvp } = await supabase
      .from('event_rsvps')
      .select('id, status')
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
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

async function updateEventCounters(supabase: Awaited<ReturnType<typeof createClient>>, eventId: string) {
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
