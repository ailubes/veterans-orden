import { createClient } from '@/lib/supabase/server';
import { Plus, Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('*, organizer:users(first_name, last_name)')
    .order('start_date', { ascending: false })
    .limit(50);

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-blue-100 text-blue-600',
  };

  const statusLabels = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    cancelled: 'Скасовано',
    completed: 'Завершено',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold">Події</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="btn flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          СТВОРИТИ ПОДІЮ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{events?.length || 0}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ОПУБЛІКОВАНО</p>
          <p className="font-syne text-3xl font-bold text-green-600">
            {events?.filter((e) => e.status === 'published').length || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ЧЕРНЕТКИ</p>
          <p className="font-syne text-3xl font-bold text-gray-500">
            {events?.filter((e) => e.status === 'draft').length || 0}
          </p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">НАЙБЛИЖЧА</p>
          <p className="font-syne text-xl font-bold">
            {events?.find((e) => e.status === 'published' && new Date(e.start_date) > new Date())
              ? formatDate(events.find((e) => e.status === 'published' && new Date(e.start_date) > new Date())!.start_date)
              : '—'}
          </p>
        </div>
      </div>

      {/* Events List */}
      {events && events.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-canvas border-2 border-timber-dark p-4 relative"
              >
                <div className="joint joint-tl" />
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm line-clamp-2">{event.title}</h3>
                    <p className="text-xs text-timber-beam mt-1">
                      {event.organizer?.first_name} {event.organizer?.last_name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold flex-shrink-0 ${
                      statusColors[event.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[event.status as keyof typeof statusLabels]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-timber-beam mb-3">
                  <span className="font-mono">{formatDate(event.start_date)}</span>
                  <span>{formatTime(event.start_date)}</span>
                  <span className="px-2 py-1 bg-timber-dark/10">
                    {event.is_online ? 'Онлайн' : 'Офлайн'}
                  </span>
                  <span>{event.going_count || 0} / {event.max_attendees || '∞'}</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-timber-dark/10">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="flex-1 btn btn-sm text-center"
                  >
                    ПЕРЕГЛЯНУТИ
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="p-2 border-2 border-timber-dark hover:bg-timber-dark/10"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button className="p-2 border-2 border-red-200 text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-canvas border-2 border-timber-dark relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-timber-dark">
                  <tr>
                    <th className="text-left p-4 font-bold text-xs">НАЗВА</th>
                    <th className="text-left p-4 font-bold text-xs">ДАТА</th>
                    <th className="text-left p-4 font-bold text-xs">ТИП</th>
                    <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                    <th className="text-left p-4 font-bold text-xs">УЧАСНИКИ</th>
                    <th className="text-left p-4 font-bold text-xs">ДІЇ</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-timber-dark/20 hover:bg-timber-dark/5">
                      <td className="p-4">
                        <div className="font-bold">{event.title}</div>
                        <div className="text-xs text-timber-beam">
                          {event.organizer?.first_name} {event.organizer?.last_name}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm">
                          {formatDate(event.start_date)}
                        </div>
                        <div className="text-xs text-timber-beam">
                          {formatTime(event.start_date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                          {event.is_online ? 'Онлайн' : 'Офлайн'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold ${
                            statusColors[event.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[event.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">{event.going_count || 0}</span>
                        <span className="text-timber-beam text-sm">
                          {' '}
                          / {event.max_attendees || '∞'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="p-2 hover:bg-timber-dark/10 rounded"
                            title="Переглянути"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-2 hover:bg-timber-dark/10 rounded"
                            title="Редагувати"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            className="p-2 hover:bg-red-50 rounded text-red-500"
                            title="Видалити"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <Calendar className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
          <h3 className="font-syne text-xl font-bold mb-2">Немає подій</h3>
          <p className="text-sm text-timber-beam mb-6">
            Створіть першу подію для членів Мережі
          </p>
          <Link href="/admin/events/new" className="btn">
            СТВОРИТИ ПОДІЮ →
          </Link>
        </div>
      )}
    </div>
  );
}
