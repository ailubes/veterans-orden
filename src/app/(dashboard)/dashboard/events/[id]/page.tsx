import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, ArrowLeft, User } from 'lucide-react';
import { formatDateTimeWithLocal, formatDate, KYIV_TIMEZONE } from '@/lib/utils';
import { RSVPButton } from '@/components/events/rsvp-button';
import { PaidEventTicketButton } from '@/components/events/paid-event-ticket-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's database ID
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user?.id)
    .single();

  // Get event details
  const { data: event, error } = await supabase
    .from('events')
    .select('*, users!events_organizer_id_fkey(first_name, last_name), oblasts(name)')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Get user's RSVP status
  let userRsvp: any = null;
  if (profile) {
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('status, ticket_purchased, order_id')
      .eq('event_id', id)
      .eq('user_id', profile.id)
      .single();

    userRsvp = rsvp;
  }

  // For paid events, get tickets sold count
  let ticketsSold = 0;
  if (event.requires_ticket_purchase) {
    const { count } = await supabase
      .from('event_rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('ticket_purchased', true);

    ticketsSold = count || 0;
  }

  const isPast = new Date(event.start_date) < new Date();
  const hasTicket = userRsvp?.ticket_purchased || false;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-2 text-timber-beam hover:text-timber-dark mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Повернутися до подій
      </Link>

      {/* Event Header */}
      <div className="bg-timber-dark text-canvas p-6 mb-6">
        {event.image_url && (
          <div className="mb-4 -mx-6 -mt-6">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        <div className="flex items-start gap-3 mb-2">
          <Calendar size={24} className="text-accent mt-1 flex-shrink-0" />
          <div>
            <h1 className="font-syne text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm opacity-80">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatDateTimeWithLocal(event.start_date, { showYear: true })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {event.is_online
                  ? 'Онлайн'
                  : event.location?.city || event.oblasts?.name || 'Офлайн'}
              </span>
              <span className="flex items-center gap-1">
                <Users size={16} />
                {event.going_count} йде
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white border-2 border-timber-dark p-6">
            <h2 className="font-syne text-xl font-bold mb-4">Про подію</h2>
            <div className="prose prose-sm max-w-none">
              {event.description ? (
                <p className="whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-timber-beam italic">Опис не надано</p>
              )}
            </div>
          </div>

          {/* Location Details */}
          {!event.is_online && event.location && (
            <div className="bg-white border-2 border-timber-dark p-6">
              <h2 className="font-syne text-xl font-bold mb-4">Локація</h2>
              <div className="space-y-2">
                {event.location.address && (
                  <p className="text-sm">
                    <strong>Адреса:</strong> {event.location.address}
                  </p>
                )}
                {event.location.city && (
                  <p className="text-sm">
                    <strong>Місто:</strong> {event.location.city}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Online Link */}
          {event.is_online && event.online_url && (
            <div className="bg-blue-50 border-2 border-blue-600 p-6">
              <h2 className="font-syne text-xl font-bold mb-4 text-blue-600">
                Онлайн посилання
              </h2>
              {hasTicket || !event.requires_ticket_purchase ? (
                <a
                  href={event.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {event.online_url}
                </a>
              ) : (
                <p className="text-sm text-blue-700">
                  Посилання буде доступне після придбання квитка
                </p>
              )}
            </div>
          )}

          {/* Organizer */}
          <div className="bg-white border-2 border-timber-dark p-6">
            <h2 className="font-syne text-xl font-bold mb-4">Організатор</h2>
            <div className="flex items-center gap-3">
              <User size={40} className="text-timber-beam" />
              <div>
                <p className="font-bold">
                  {event.users?.first_name} {event.users?.last_name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - RSVP / Ticket Purchase */}
        <div className="lg:col-span-1 space-y-6">
          {!isPast && (
            <>
              {/* Paid Event - Show Ticket Purchase */}
              {event.requires_ticket_purchase ? (
                <PaidEventTicketButton
                  eventId={event.id}
                  eventTitle={event.title}
                  ticketPricePoints={event.ticket_price_points}
                  ticketPriceUah={event.ticket_price_uah}
                  ticketQuantity={event.ticket_quantity}
                  ticketsSold={ticketsSold}
                  hasTicket={hasTicket}
                />
              ) : (
                /* Free Event - Show Regular RSVP */
                <div className="bg-white border-2 border-timber-dark p-6">
                  <h3 className="font-syne font-bold mb-4">Ваша відповідь</h3>
                  {profile ? (
                    <RSVPButton
                      eventId={event.id}
                      currentStatus={userRsvp?.status || null}
                    />
                  ) : (
                    <p className="text-sm text-timber-beam">
                      Увійдіть, щоб підтвердити участь
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Event Info */}
          <div className="bg-timber-dark/5 border-2 border-timber-dark p-6">
            <h3 className="font-syne font-bold mb-4">Деталі події</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-timber-beam mb-1">Тип</p>
                <p className="font-bold capitalize">{event.type}</p>
              </div>
              <div>
                <p className="text-timber-beam mb-1">Масштаб</p>
                <p className="font-bold capitalize">{event.scope}</p>
              </div>
              {event.max_attendees && (
                <div>
                  <p className="text-timber-beam mb-1">Макс. учасників</p>
                  <p className="font-bold">{event.max_attendees}</p>
                </div>
              )}
              {event.rsvp_deadline && (
                <div>
                  <p className="text-timber-beam mb-1">Дедлайн реєстрації</p>
                  <p className="font-bold">
                    {formatDateTimeWithLocal(event.rsvp_deadline)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-white border-2 border-timber-dark p-6">
            <h3 className="font-syne font-bold mb-4">Статистика</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-timber-beam">Йде:</span>
                <span className="font-bold text-green-600">{event.going_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-timber-beam">Можливо:</span>
                <span className="font-bold text-yellow-600">{event.maybe_count}</span>
              </div>
              {event.requires_ticket_purchase && (
                <div className="flex justify-between pt-2 border-t border-timber-dark/10">
                  <span className="text-timber-beam">Квитків продано:</span>
                  <span className="font-bold text-accent">{ticketsSold}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
