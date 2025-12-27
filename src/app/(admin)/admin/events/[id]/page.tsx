import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  XCircle,
  CheckCircle,
} from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get event data
  const { data: event, error } = await supabase
    .from('events')
    .select('*, organizer:users(first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Check regional leader permissions
  const canEdit =
    adminProfile.role === 'super_admin' ||
    adminProfile.role === 'admin' ||
    (adminProfile.role === 'regional_leader' && event.organizer_id === adminProfile.id);

  // Get RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('*, user:users(first_name, last_name, email, oblast_id)')
    .eq('event_id', id)
    .order('created_at', { ascending: false });

  // Count RSVP statuses
  const goingCount = rsvps?.filter((r) => r.status === 'going').length || 0;
  const maybeCount = rsvps?.filter((r) => r.status === 'maybe').length || 0;
  const notGoingCount = rsvps?.filter((r) => r.status === 'not_going').length || 0;
  const attendedCount = rsvps?.filter((r) => r.attended).length || 0;

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    cancelled: 'Скасовано',
    completed: 'Завершено',
  };

  // Event type labels
  const typeLabels: Record<string, string> = {
    meeting: 'Збори',
    protest: 'Протест',
    workshop: 'Майстерня',
    social: 'Соціальна подія',
    other: 'Інше',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-timber-dark text-canvas border-2 border-timber-dark p-6 mb-6 relative">
        <div className="joint" style={{ top: '-3px', left: '-3px' }} />
        <div className="joint" style={{ top: '-3px', right: '-3px' }} />
        <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
        <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Event info */}
          <div className="flex-1">
            <h1 className="font-syne text-3xl font-bold mb-3">{event.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-canvas text-timber-dark text-xs font-bold">
                {typeLabels[event.event_type] || event.event_type}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold ${
                  event.status === 'published'
                    ? 'bg-green-500 text-white'
                    : event.status === 'cancelled'
                    ? 'bg-red-500 text-white'
                    : event.status === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {statusLabels[event.status] || event.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-canvas/90">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(event.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {formatTime(event.start_date)}
                  {event.end_date && ` - ${formatTime(event.end_date)}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="btn btn-sm flex items-center gap-2"
              >
                <Edit size={16} />
                РЕДАГУВАТИ
              </Link>
              {event.status !== 'cancelled' && (
                <button className="btn btn-outline btn-sm flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <XCircle size={16} />
                  СКАСУВАТИ
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ top: '-3px', right: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <p className="label text-accent mb-4">ОПИС ПОДІЇ</p>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>

            {event.requirements && (
              <div className="mt-6 pt-6 border-t border-timber-dark/20">
                <p className="label text-accent mb-2">ВИМОГИ ДО УЧАСНИКІВ</p>
                <p className="text-sm whitespace-pre-wrap">{event.requirements}</p>
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="bg-canvas border-2 border-timber-dark p-4 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ top: '-3px', right: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <p className="label text-accent mb-2">ОРГАНІЗАТОР</p>
            <p className="text-sm font-bold">
              {event.organizer?.first_name} {event.organizer?.last_name}
            </p>
            <p className="text-xs text-timber-beam">{event.organizer?.email}</p>
            <p className="text-xs text-timber-beam mt-2">
              Створено: {formatDate(event.created_at)}
            </p>
          </div>
        </div>

        {/* RSVP Stats */}
        <div className="lg:col-span-1">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ top: '-3px', right: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <p className="label text-accent mb-4">СТАТИСТИКА ВІДВІДУВАНЬ</p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-green-600">Підтвердили</span>
                  <span className="text-sm font-bold">{goingCount}</span>
                </div>
                <div className="w-full bg-timber-dark/10 h-2">
                  <div
                    className="bg-green-500 h-2"
                    style={{
                      width: `${
                        rsvps && rsvps.length > 0
                          ? (goingCount / rsvps.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-yellow-600">Можливо</span>
                  <span className="text-sm font-bold">{maybeCount}</span>
                </div>
                <div className="w-full bg-timber-dark/10 h-2">
                  <div
                    className="bg-yellow-500 h-2"
                    style={{
                      width: `${
                        rsvps && rsvps.length > 0
                          ? (maybeCount / rsvps.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-red-600">Не прийдуть</span>
                  <span className="text-sm font-bold">{notGoingCount}</span>
                </div>
                <div className="w-full bg-timber-dark/10 h-2">
                  <div
                    className="bg-red-500 h-2"
                    style={{
                      width: `${
                        rsvps && rsvps.length > 0
                          ? (notGoingCount / rsvps.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-timber-dark/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Відвідали</span>
                  <span className="font-syne text-2xl font-bold text-accent">
                    {attendedCount}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Всього реєстрацій</span>
                  <span className="font-syne text-2xl font-bold">
                    {rsvps?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP List */}
      {rsvps && rsvps.length > 0 && (
        <div className="bg-canvas border-2 border-timber-dark relative">
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <div className="p-6">
            <p className="label text-accent mb-4">ЗАРЕЄСТРОВАНІ УЧАСНИКИ</p>

            <div className="space-y-2">
              {rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="flex items-center justify-between p-3 border border-timber-dark/20 hover:bg-timber-dark/5"
                >
                  <div className="flex items-center gap-3">
                    {rsvp.attended ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        {rsvp.user?.first_name} {rsvp.user?.last_name}
                      </p>
                      <p className="text-xs text-timber-beam">{rsvp.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 text-xs font-bold ${
                        rsvp.status === 'going'
                          ? 'bg-green-100 text-green-700'
                          : rsvp.status === 'maybe'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {rsvp.status === 'going' && 'Підтвердив'}
                      {rsvp.status === 'maybe' && 'Можливо'}
                      {rsvp.status === 'not_going' && 'Не прийде'}
                    </span>
                    {!rsvp.attended && rsvp.status === 'going' && canEdit && (
                      <button className="text-xs text-accent hover:underline font-bold">
                        ВІДМІТИТИ ПРИСУТНІСТЬ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
