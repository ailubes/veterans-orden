'use client';

import { useState } from 'react';
import { Download, Printer, Users, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface Rsvp {
  id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  attended_at: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    patronymic?: string;
    date_of_birth?: string;
    email: string;
    phone?: string;
    additional_phone?: string;
    settlement_name?: string;
    hromada_name?: string;
    raion_name?: string;
    oblast_name_katottg?: string;
    city?: string;
    profession?: string;
    education?: string;
  } | null;
}

interface AttendeesPanelProps {
  eventId: string;
  rsvps: Rsvp[];
  canEdit: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  going: 'Підтвердив',
  maybe: 'Можливо',
  not_going: 'Не прийде',
};

const EDUCATION_LABELS: Record<string, string> = {
  secondary: 'Середня',
  vocational: 'Професійна',
  higher: 'Вища',
};

type Filter = 'all' | 'going' | 'maybe' | 'not_going';

export function AttendeesPanel({ eventId, rsvps, canEdit }: AttendeesPanelProps) {
  const [filter, setFilter] = useState<Filter>('going');
  const [downloading, setDownloading] = useState(false);

  const counts = {
    all: rsvps.length,
    going: rsvps.filter((r) => r.status === 'going').length,
    maybe: rsvps.filter((r) => r.status === 'maybe').length,
    not_going: rsvps.filter((r) => r.status === 'not_going').length,
  };

  const filtered = filter === 'all' ? rsvps : rsvps.filter((r) => r.status === filter);

  const handleDownloadCsv = async (statusFilter: Filter) => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ format: 'csv', status: statusFilter });
      const res = await fetch(`/api/admin/events/${eventId}/attendees?${params}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match?.[1] || 'attendees.csv';
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Помилка завантаження');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs: { key: Filter; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'Всі', icon: <Users size={14} />, color: 'text-text-100' },
    { key: 'going', label: 'Підтвердили', icon: <CheckCircle2 size={14} />, color: 'text-green-400' },
    { key: 'maybe', label: 'Можливо', icon: <HelpCircle size={14} />, color: 'text-yellow-400' },
    { key: 'not_going', label: 'Не прийдуть', icon: <XCircle size={14} />, color: 'text-red-400' },
  ];

  if (rsvps.length === 0) {
    return (
      <div className="bg-panel-900 border border-line rounded-lg p-8 text-center">
        <Users size={32} className="text-muted-500 mx-auto mb-3" />
        <p className="text-muted-500 text-sm">Поки що ніхто не зареєструвався</p>
      </div>
    );
  }

  return (
    <div className="bg-panel-900 border border-line rounded-lg relative">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-line print:hidden">
        <p className="label text-bronze">СПИСОК УЧАСНИКІВ</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCsv(filter)}
            disabled={downloading}
            className="btn btn-sm btn-outline flex items-center gap-2"
          >
            <Download size={14} />
            {downloading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ CSV'}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-sm btn-outline flex items-center gap-2"
          >
            <Printer size={14} />
            ДРУК
          </button>
        </div>
      </div>

      {/* Print header (only shown in print) */}
      <div className="hidden print:block px-5 pt-4 pb-2 border-b border-line">
        <p className="font-syne font-bold text-lg">Список учасників події</p>
        <p className="text-sm text-muted-500 mt-1">
          {filter === 'all' ? 'Всі реєстрації' : STATUS_LABELS[filter]} · {filtered.length} осіб
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-5 pt-4 pb-2 print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              filter === tab.key
                ? 'bg-bronze text-bg-950'
                : 'text-muted-500 hover:text-text-100 hover:bg-panel-850'
            }`}
          >
            <span className={filter === tab.key ? '' : tab.color}>{tab.icon}</span>
            {tab.label}
            <span className={`ml-0.5 font-mono ${filter === tab.key ? 'opacity-70' : 'text-muted-500'}`}>
              ({counts[tab.key]})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 w-8">#</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500">Прізвище, ім'я, по батькові</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 hidden sm:table-cell">Дата народження</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 hidden md:table-cell">Контакти</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 hidden lg:table-cell">Місце проживання</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 hidden xl:table-cell">Професія</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 print:hidden">Статус</th>
              <th className="px-4 py-2.5 text-xs font-bold text-muted-500 hidden print:table-cell">Статус RSVP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rsvp, index) => {
              const u = rsvp.user;
              const fullName = [u?.last_name, u?.first_name, u?.patronymic].filter(Boolean).join(' ');
              const dob = u?.date_of_birth
                ? new Date(u.date_of_birth).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—';
              const location = [
                u?.settlement_name,
                u?.hromada_name,
                u?.raion_name,
                u?.oblast_name_katottg || u?.city,
              ].filter(Boolean).join(', ') || '—';

              return (
                <tr key={rsvp.id} className="border-b border-line/40 hover:bg-panel-850/30 transition-colors">
                  <td className="px-4 py-3 text-muted-500 font-mono text-xs">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-text-100">{fullName || '—'}</p>
                    <p className="text-xs text-muted-500 mt-0.5">{u?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-text-200 hidden sm:table-cell">{dob}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {u?.phone && <p className="text-text-200">{u.phone}</p>}
                    {u?.additional_phone && (
                      <p className="text-xs text-muted-500">{u.additional_phone}</p>
                    )}
                    {!u?.phone && <span className="text-muted-500">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-200 text-xs hidden lg:table-cell max-w-[200px]">
                    <span className="line-clamp-2">{location}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {u?.profession && <p className="text-text-200 text-xs">{u.profession}</p>}
                    {u?.education && (
                      <p className="text-xs text-muted-500">
                        {EDUCATION_LABELS[u.education] || u.education}
                      </p>
                    )}
                    {!u?.profession && !u?.education && <span className="text-muted-500">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded w-fit ${
                        rsvp.status === 'going'
                          ? 'bg-green-500/15 text-green-400'
                          : rsvp.status === 'maybe'
                          ? 'bg-yellow-500/15 text-yellow-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {STATUS_LABELS[rsvp.status]}
                      </span>
                      {rsvp.attended_at && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 size={11} /> Відвідав
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-muted-500 text-sm py-10">Немає записів за обраним фільтром</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-line/40 flex justify-between items-center">
        <p className="text-xs text-muted-500">
          Показано: <span className="font-bold text-text-200">{filtered.length}</span> з {rsvps.length}
        </p>
        <p className="text-xs text-muted-500 print:hidden">
          Дані: ПІБ, дата народження, контакти, місце проживання, професія
        </p>
      </div>
    </div>
  );
}
