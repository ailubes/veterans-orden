import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { EventFilters } from '@/components/events/event-filters';
import EventsList from '@/components/events/events-list';

interface PageProps {
  searchParams: Promise<{ filter?: string; past?: string }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter || 'all';
  const showPast = params.past === 'true';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's database ID and oblast
  const { data: profile } = await supabase
    .from('users')
    .select('id, oblast_id')
    .eq('clerk_id', user?.id)
    .single();

  // Fetch oblasts for filter
  const { data: oblasts } = await supabase
    .from('oblasts')
    .select('id, name')
    .order('name');

  // Build events query
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .eq('status', 'published');

  // Apply date filter
  if (showPast) {
    eventsQuery = eventsQuery.lt('start_date', new Date().toISOString());
  } else {
    eventsQuery = eventsQuery.gte('start_date', new Date().toISOString());
  }

  // Apply location filter
  if (filter === 'online') {
    eventsQuery = eventsQuery.eq('is_online', true);
  } else if (filter === 'my-region' && profile?.oblast_id) {
    eventsQuery = eventsQuery.eq('oblast_id', profile.oblast_id);
  } else if (filter !== 'all') {
    eventsQuery = eventsQuery.eq('oblast_id', filter);
  }

  const { data: events } = await eventsQuery
    .order('start_date', { ascending: !showPast })
    .limit(20);

  // Fetch user's RSVPs for these events
  let userRsvps: Record<string, 'going' | 'maybe' | 'not_going'> = {};
  if (profile && events) {
    const eventIds = events.map((e) => e.id);
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('event_id, status')
      .eq('user_id', profile.id)
      .in('event_id', eventIds);

    if (rsvps) {
      userRsvps = rsvps.reduce((acc, r) => {
        acc[r.event_id] = r.status as 'going' | 'maybe' | 'not_going';
        return acc;
      }, {} as Record<string, 'going' | 'maybe' | 'not_going'>);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label mb-2">ПОДІЇ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">
            {showPast ? 'Минулі події' : 'Найближчі події'}
          </h1>
        </div>
        <div className="flex gap-2">
          <EventFilters
            oblasts={oblasts || []}
            userOblastId={profile?.oblast_id}
          />
        </div>
      </div>

      {/* Events List */}
      <EventsList events={events} userRsvps={userRsvps} />

      {/* Past/Upcoming Events Toggle */}
      <div className="mt-8 text-center">
        {showPast ? (
          <Link
            href="/dashboard/events"
            className="text-sm text-timber-beam hover:text-accent"
          >
            ← Переглянути найближчі події
          </Link>
        ) : (
          <Link
            href="/dashboard/events?past=true"
            className="text-sm text-timber-beam hover:text-accent"
          >
            Переглянути минулі події →
          </Link>
        )}
      </div>
    </div>
  );
}
