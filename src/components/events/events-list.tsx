'use client';

import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatTimeWithLocal, KYIV_TIMEZONE } from '@/lib/utils';
import { RSVPButton } from '@/components/events/rsvp-button';
import FeatureGate from '@/components/ui/feature-gate';

interface EventsListProps {
  events: any[] | null;
  userRsvps: Record<string, 'going' | 'maybe' | 'not_going'>;
}

export default function EventsList({ events, userRsvps }: EventsListProps) {
  return (
    <>
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
                {/* Date Block - shows date in Kyiv timezone */}
                <div className="flex-shrink-0 w-16 h-16 bg-timber-dark text-canvas flex flex-col items-center justify-center">
                  <span className="text-2xl font-syne font-bold">
                    {new Intl.DateTimeFormat('uk-UA', { day: 'numeric', timeZone: KYIV_TIMEZONE }).format(new Date(event.start_date))}
                  </span>
                  <span className="text-xs uppercase">
                    {new Intl.DateTimeFormat('uk-UA', { month: 'short', timeZone: KYIV_TIMEZONE }).format(new Date(event.start_date))}
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
                      {formatTimeWithLocal(event.start_date)}
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

                {/* RSVP Button - gated by events_attend */}
                <div className="flex-shrink-0">
                  <FeatureGate featureKey="events_attend" showLockOverlay={false}>
                    <RSVPButton
                      eventId={event.id}
                      currentStatus={userRsvps[event.id] || null}
                    />
                  </FeatureGate>
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
    </>
  );
}
