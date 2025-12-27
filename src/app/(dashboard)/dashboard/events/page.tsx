import { createClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDateShort, formatTime } from '@/lib/utils';
import { RSVPButton } from '@/components/events/rsvp-button';
import { EventFilters } from '@/components/events/event-filters';

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
      {events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-canvas border-2 border-timber-dark p-6 relative hover:border-accent transition-colors"
            >
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />

              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Date Block */}
                <div className="flex-shrink-0 w-16 h-16 bg-timber-dark text-canvas flex flex-col items-center justify-center">
                  <span className="text-2xl font-syne font-bold">
                    {new Date(event.start_date).getDate()}
                  </span>
                  <span className="text-xs uppercase">
                    {formatDateShort(event.start_date).split(' ')[1]}
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1">
                  <Link href={`/dashboard/events/${event.id}`}>
                    <h3 className="font-syne text-xl font-bold mb-2 hover:text-accent transition-colors cursor-pointer">
                      {event.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-timber-beam mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-timber-beam">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(event.start_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {event.is_online ? 'Онлайн' : 'Офлайн'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {event.going_count || 0} учасників
                    </span>
                  </div>
                </div>

                {/* RSVP Button */}
                <div className="flex-shrink-0">
                  <RSVPButton
                    eventId={event.id}
                    currentStatus={userRsvps[event.id] || null}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <Calendar className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
          <h3 className="font-syne text-xl font-bold mb-2">
            Поки що немає подій
          </h3>
          <p className="text-sm text-timber-beam mb-6">
            Найближчі події Мережі з&apos;являться тут
          </p>
          <Link href="/dashboard" className="text-accent hover:underline text-sm">
            ← Повернутися до огляду
          </Link>
        </div>
      )}

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
