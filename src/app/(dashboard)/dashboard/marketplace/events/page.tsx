'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';
import { formatDateTimeWithLocal } from '@/lib/utils';

interface PaidEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  scope: string;
  isOnline: boolean;
  location: any;
  onlineUrl: string;
  startDate: string;
  endDate: string;
  ticketPricePoints: number;
  ticketPriceUah: number;
  ticketQuantity: number | null;
  goingCount: number;
  imageUrl: string | null;
  maxAttendees: number | null;
}

interface EventsResponse {
  events: PaidEvent[];
  ticketsSold: Record<string, number>;
}

export default function MarketplaceEventsPage() {
  const [events, setEvents] = useState<PaidEvent[]>([]);
  const [ticketsSold, setTicketsSold] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaidEvents();
  }, []);

  async function fetchPaidEvents() {
    try {
      const response = await fetch('/api/marketplace/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setTicketsSold(data.ticketsSold || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const getTicketsRemaining = (event: PaidEvent) => {
    if (event.ticketQuantity === null) return 'Необмежено';
    const sold = ticketsSold[event.id] || 0;
    const remaining = event.ticketQuantity - sold;
    return remaining > 0 ? remaining : 0;
  };

  const isSoldOut = (event: PaidEvent) => {
    if (event.ticketQuantity === null) return false;
    const sold = ticketsSold[event.id] || 0;
    return sold >= event.ticketQuantity;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="mono text-bronze text-xs tracking-widest mb-2">// КВИТКИ</p>
          <h1 className="font-syne text-3xl font-bold text-text-100">Квитки на події</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-bronze" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// КВИТКИ</p>
        <h1 className="font-syne text-3xl font-bold text-text-100 mb-2">Квитки на події</h1>
        <p className="text-muted-500">Придбайте квитки на платні події за бали</p>
      </div>

      {/* Events Grid */}
      {error ? (
        <div className="bg-red-500/10 border border-red-500 p-4 text-red-400 rounded-lg">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-panel-900 border border-line rounded-lg">
          <Calendar className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500 mb-2">Наразі немає платних подій</p>
          <Link
            href="/dashboard/events"
            className="text-bronze hover:underline inline-flex items-center gap-2 mt-4"
          >
            Переглянути всі події
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const uahValue = pointsToUAH(event.ticketPricePoints);
            const soldOut = isSoldOut(event);
            const remaining = getTicketsRemaining(event);

            return (
              <div
                key={event.id}
                className="bg-panel-900 border border-line rounded-lg overflow-hidden hover:border-bronze/50 transition-colors"
              >
                {/* Event Image */}
                {event.imageUrl ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-panel-850 flex items-center justify-center">
                    <Calendar size={48} className="text-muted-500" />
                  </div>
                )}

                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-syne text-xl font-bold text-text-100 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Date & Time - shows both Kyiv and local time */}
                  <div className="flex items-center gap-2 text-sm text-muted-500 mb-3">
                    <Clock size={16} />
                    <span>
                      {formatDateTimeWithLocal(event.startDate)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-500 mb-4">
                    <MapPin size={16} />
                    <span>
                      {event.isOnline
                        ? 'Онлайн'
                        : event.location?.city || 'Офлайн'}
                    </span>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-500 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Attendees / Tickets */}
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Users size={16} className="text-muted-500" />
                    <span className="text-muted-500">
                      {event.goingCount} йде
                    </span>
                    {event.ticketQuantity && (
                      <span className="text-muted-500">
                        • {remaining} квитків
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-t border-line pt-4 mb-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="font-syne text-2xl font-bold text-bronze">
                          {event.ticketPricePoints}
                        </p>
                        <p className="text-xs text-muted-500">
                          ≈ {uahValue.toFixed(0)} грн
                        </p>
                      </div>
                      <Ticket size={24} className="text-muted-500" />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className={`w-full py-3 px-4 font-bold text-center transition-colors flex items-center justify-center gap-2 rounded ${
                      soldOut
                        ? 'bg-panel-850 text-muted-500 cursor-not-allowed'
                        : 'bg-bronze text-bg-950 hover:bg-bronze/90'
                    }`}
                  >
                    {soldOut ? 'Квитки розпродані' : 'Придбати квиток'}
                    {!soldOut && <ArrowRight size={20} />}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
