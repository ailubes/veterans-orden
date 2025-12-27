'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket, Clock, ArrowRight } from 'lucide-react';
import { pointsToUAH } from '@/lib/points/constants';

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
          <h1 className="font-syne text-3xl font-bold">Квитки на події</h1>
        </div>
        <div className="text-center py-12 text-timber-beam">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold mb-2">Квитки на події</h1>
        <p className="text-timber-beam">Придбайте квитки на платні події за бали</p>
      </div>

      {/* Events Grid */}
      {error ? (
        <div className="bg-red-50 border-2 border-red-600 p-4 text-red-600">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-timber-dark">
          <Calendar className="mx-auto mb-4 text-timber-beam" size={48} />
          <p className="text-timber-beam mb-2">Наразі немає платних подій</p>
          <Link
            href="/dashboard/events"
            className="text-accent hover:underline inline-flex items-center gap-2 mt-4"
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
                className="bg-white border-2 border-timber-dark overflow-hidden hover:shadow-lg transition-shadow"
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
                  <div className="h-48 bg-timber-dark/10 flex items-center justify-center">
                    <Calendar size={48} className="text-timber-beam" />
                  </div>
                )}

                <div className="p-6">
                  {/* Title */}
                  <h3 className="font-syne text-xl font-bold mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-timber-beam mb-3">
                    <Clock size={16} />
                    <span>
                      {new Date(event.startDate).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-timber-beam mb-4">
                    <MapPin size={16} />
                    <span>
                      {event.isOnline
                        ? 'Онлайн'
                        : event.location?.city || 'Офлайн'}
                    </span>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-timber-beam mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Attendees / Tickets */}
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Users size={16} className="text-timber-beam" />
                    <span className="text-timber-beam">
                      {event.goingCount} йде
                    </span>
                    {event.ticketQuantity && (
                      <span className="text-timber-beam">
                        • {remaining} квитків
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-t-2 border-timber-dark/10 pt-4 mb-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="font-syne text-2xl font-bold text-accent">
                          {event.ticketPricePoints}
                        </p>
                        <p className="text-xs text-timber-beam">
                          ≈ {uahValue.toFixed(0)} грн
                        </p>
                      </div>
                      <Ticket size={24} className="text-timber-beam" />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className={`w-full py-3 px-4 font-bold text-center transition-colors flex items-center justify-center gap-2 ${
                      soldOut
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-accent text-canvas hover:bg-accent/90'
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
