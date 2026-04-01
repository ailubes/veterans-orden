'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { KatottgSelector, type KatottgDetails } from '@/components/ui/katottg-selector';

type Commandery = {
  id: string;
  code: string;
  name: string;
  type: 'commandery' | 'city';
  parent_code: string | null;
  leader_id: string | null;
  katottg_code: string | null;
  settlement_name: string | null;
  hromada_name: string | null;
  raion_name: string | null;
  oblast_name: string | null;
  address: string | null;
  member_count: number | null;
  group_count: number | null;
  description: string | null;
  created_at: string;
};

type CommanderiesResponse = {
  commanderies: Commandery[];
  currentUserId: string;
  membershipRole: string | null;
  canCreate: boolean;
  coordinatorCommanderyIds?: string[];
};

type MvpReport = {
  id: string;
  commandery_id: string;
  report_month: string;
  active_members_count: number;
  monthly_meetings_count: number;
  monthly_local_actions_count: number;
  what_done: string;
  what_planned: string;
  what_needed: string;
  is_mvp_compliant: boolean;
  commandery?: {
    id: string;
    name: string;
    code: string;
    leader_id: string | null;
  } | null;
};

type CommanderyEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;
};

type CommanderyVote = {
  id: string;
  title: string;
  end_date: string;
  status: string;
  total_votes: number;
  is_election?: boolean;
  position_type?: string | null;
};

type CommanderyMember = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  membership_role: string | null;
  status: string | null;
};

const ROLE_LABELS: Record<string, string> = {
  supporter: 'Прихильник',
  candidate: 'Кандидат',
  member: 'Член',
  honorary_member: 'Почесний Член',
  network_leader: 'Мережевий Лідер',
  regional_leader: 'Регіональний Лідер',
  national_leader: 'Національний Лідер',
  network_guide: 'Провідник Мережі',
};

export default function CommanderiesDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CommanderiesResponse | null>(null);
  const [reports, setReports] = useState<MvpReport[]>([]);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'commandery' | 'city'>('commandery');
  const [parentCode, setParentCode] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [katottgCode, setKatottgCode] = useState<string | null>(null);
  const [katottgDetails, setKatottgDetails] = useState<KatottgDetails | null>(null);
  const [reportMonth, setReportMonth] = useState(() => `${new Date().toISOString().slice(0, 7)}-01`);
  const [reportCommanderyId, setReportCommanderyId] = useState('');
  const [activeMembersCount, setActiveMembersCount] = useState(2);
  const [monthlyMeetingsCount, setMonthlyMeetingsCount] = useState(1);
  const [monthlyLocalActionsCount, setMonthlyLocalActionsCount] = useState(1);
  const [whatDone, setWhatDone] = useState('');
  const [whatPlanned, setWhatPlanned] = useState('');
  const [whatNeeded, setWhatNeeded] = useState('');
  const [localEvents, setLocalEvents] = useState<CommanderyEvent[]>([]);
  const [localVotes, setLocalVotes] = useState<CommanderyVote[]>([]);
  const [localMembers, setLocalMembers] = useState<CommanderyMember[]>([]);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocationAddress, setEventLocationAddress] = useState('');

  const [voteTitle, setVoteTitle] = useState('');
  const [voteDescription, setVoteDescription] = useState('');
  const [voteStartDate, setVoteStartDate] = useState('');
  const [voteEndDate, setVoteEndDate] = useState('');
  const [voteOptionsText, setVoteOptionsText] = useState('Так\\nНі');
  const [isDeputyPrimaries, setIsDeputyPrimaries] = useState(false);
  const [deputyWinnerCount, setDeputyWinnerCount] = useState<'1' | '2'>('2');
  const [deputyCandidates, setDeputyCandidates] = useState<Array<{ candidateUserId: string; description: string }>>([
    { candidateUserId: '', description: '' },
    { candidateUserId: '', description: '' },
  ]);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/commanderies', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Не вдалося завантажити командерії');
      }

      setResult(payload);

      const reportsResponse = await fetch('/api/commanderies/mvp-reports?mine=true', { cache: 'no-store' });
      const reportsPayload = await reportsResponse.json();
      if (reportsResponse.ok) {
        setReports(reportsPayload.reports || []);
      } else {
        setReports([]);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Неочікувана помилка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const ledCommanderiesCount = useMemo(() => {
    if (!result) return 0;
    return result.commanderies.filter((item) => item.leader_id === result.currentUserId).length;
  }, [result]);

  const manageableCommanderyIds = useMemo(() => {
    if (!result) return new Set<string>();
    const ids = new Set<string>((result.coordinatorCommanderyIds || []).filter(Boolean));
    result.commanderies
      .filter((item) => item.leader_id === result.currentUserId)
      .forEach((item) => ids.add(item.id));
    return ids;
  }, [result]);

  const myCommanderies = useMemo(() => {
    if (!result) return [] as Commandery[];
    return result.commanderies.filter((item) => manageableCommanderyIds.has(item.id));
  }, [result, manageableCommanderyIds]);

  useEffect(() => {
    if (!reportCommanderyId && myCommanderies.length > 0) {
      setReportCommanderyId(myCommanderies[0].id);
    }
  }, [myCommanderies, reportCommanderyId]);

  useEffect(() => {
    const loadCoordinatorData = async () => {
      if (!reportCommanderyId) {
        setLocalEvents([]);
        setLocalVotes([]);
        setLocalMembers([]);
        return;
      }

      const [eventsResponse, votesResponse, membersResponse] = await Promise.all([
        fetch(`/api/commanderies/events?commanderyId=${encodeURIComponent(reportCommanderyId)}`, { cache: 'no-store' }),
        fetch(`/api/commanderies/votes?commanderyId=${encodeURIComponent(reportCommanderyId)}`, { cache: 'no-store' }),
        fetch(`/api/commanderies/members?commanderyId=${encodeURIComponent(reportCommanderyId)}`, { cache: 'no-store' }),
      ]);

      const eventsPayload = await eventsResponse.json();
      const votesPayload = await votesResponse.json();
      const membersPayload = await membersResponse.json();

      setLocalEvents(eventsResponse.ok ? (eventsPayload.events || []) : []);
      setLocalVotes(votesResponse.ok ? (votesPayload.votes || []) : []);
      setLocalMembers(membersResponse.ok ? (membersPayload.members || []) : []);
    };

    void loadCoordinatorData();
  }, [reportCommanderyId]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/commanderies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          type,
          parentCode,
          description,
          address,
          katottgCode,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Не вдалося створити командерію');
      }

      setName('');
      setCode('');
      setType('commandery');
      setParentCode('');
      setDescription('');
      setAddress('');
      setKatottgCode(null);
      setKatottgDetails(null);

      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Неочікувана помилка');
    } finally {
      setSaving(false);
    }
  };

  const submitMvpReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/commanderies/mvp-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commanderyId: reportCommanderyId,
          reportMonth,
          activeMembersCount,
          monthlyMeetingsCount,
          monthlyLocalActionsCount,
          whatDone,
          whatPlanned,
          whatNeeded,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Не вдалося зберегти MVP звіт');
      }

      setWhatDone('');
      setWhatPlanned('');
      setWhatNeeded('');
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Неочікувана помилка');
    } finally {
      setSaving(false);
    }
  };

  const submitLocalEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/commanderies/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commanderyId: reportCommanderyId,
          title: eventTitle,
          description: eventDescription,
          type: 'meeting',
          isOnline: false,
          locationAddress: eventLocationAddress,
          startDate: eventStartDate,
          endDate: eventEndDate,
          status: 'published',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Не вдалося створити подію');
      }

      setEventTitle('');
      setEventDescription('');
      setEventStartDate('');
      setEventEndDate('');
      setEventLocationAddress('');
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Неочікувана помилка');
    } finally {
      setSaving(false);
    }
  };

  const submitLocalVote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const options = isDeputyPrimaries
        ? deputyCandidates
          .map((candidate) => {
            const member = localMembers.find((item) => item.id === candidate.candidateUserId);
            const fullName = member
              ? `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email || 'Кандидат'
              : '';
            return {
              text: fullName,
              description: candidate.description || '',
              candidateUserId: candidate.candidateUserId,
            };
          })
          .filter((candidate) => candidate.candidateUserId && candidate.text)
        : voteOptionsText
          .split('\\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

      if (isDeputyPrimaries) {
        const uniqueCandidateIds = new Set(
          (options as Array<{ candidateUserId: string }>).map((option) => option.candidateUserId)
        );
        if (uniqueCandidateIds.size < 2) {
          throw new Error('Для праймеріз заступників потрібно щонайменше 2 різні кандидати');
        }
      }

      const response = await fetch('/api/commanderies/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commanderyId: reportCommanderyId,
          title: voteTitle,
          description: voteDescription,
          startDate: voteStartDate,
          endDate: voteEndDate,
          options,
          status: 'active',
          isElection: isDeputyPrimaries,
          positionType: isDeputyPrimaries ? 'deputy_commander' : null,
          maxWinners: isDeputyPrimaries ? Number(deputyWinnerCount) : 1,
          type: isDeputyPrimaries ? 'multiple_choice' : 'multiple_choice',
          transparency: 'anonymous',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Не вдалося створити голосування');
      }

      setVoteTitle('');
      setVoteDescription('');
      setVoteStartDate('');
      setVoteEndDate('');
      setVoteOptionsText('Так\\nНі');
      setIsDeputyPrimaries(false);
      setDeputyWinnerCount('2');
      setDeputyCandidates([
        { candidateUserId: '', description: '' },
        { candidateUserId: '', description: '' },
      ]);
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Неочікувана помилка');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-panel-900 border border-line rounded-lg p-8 text-center text-muted-500">
          Завантаження осередків...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-panel-900 border border-red-500/30 rounded-lg p-8 text-center">
          <p className="text-red-400 font-semibold">Не вдалося завантажити дані</p>
          {error && <p className="text-sm text-muted-500 mt-2">{error}</p>}
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 px-4 py-2 rounded bg-bronze text-bg-950 font-semibold text-sm"
          >
            Спробувати ще раз
          </button>
        </div>
      </div>
    );
  }

  const membershipLabel = result.membershipRole ? ROLE_LABELS[result.membershipRole] || result.membershipRole : 'Невідомо';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="bg-panel-900 border border-line rounded-lg p-6">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// КОМАНДЕРІЇ В КАБІНЕТІ</p>
        <h1 className="font-syne text-3xl font-bold text-text-100 mb-2">Осередки Ордену</h1>
        <p className="text-sm text-muted-500">
          Кожен член бачить структуру командерій. Створення нової командерії дозволено тільки ролі
          {' '}
          <strong className="text-text-100">Почесний Член</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="bg-panel-850 border border-line rounded p-3">
            <p className="text-xs text-muted-500">Ваша роль</p>
            <p className="text-sm font-semibold text-text-100 mt-1">{membershipLabel}</p>
          </div>
          <div className="bg-panel-850 border border-line rounded p-3">
            <p className="text-xs text-muted-500">Всього командерій</p>
            <p className="text-sm font-semibold text-text-100 mt-1">{result.commanderies.length}</p>
          </div>
          <div className="bg-panel-850 border border-line rounded p-3">
            <p className="text-xs text-muted-500">Керуєте / координуєте</p>
            <p className="text-sm font-semibold text-text-100 mt-1">{myCommanderies.length}</p>
            {ledCommanderiesCount !== myCommanderies.length && (
              <p className="text-[11px] text-muted-500 mt-1">Лідерство: {ledCommanderiesCount}</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-panel-900 border border-line rounded-lg p-6">
        <p className="mono text-bronze text-xs tracking-widest mb-3">// MVP СТАНДАРТ ОСЕРЕДКУ</p>
        <ul className="text-sm text-muted-500 space-y-1">
          <li>1 координатор і 2-5 активних людей</li>
          <li>1 регулярна зустріч (онлайн/офлайн) на місяць</li>
          <li>1 локальна дія на місяць (подія, підтримка, ініціатива)</li>
          <li>Базова звітність: що зробили / що плануємо / що потрібно</li>
        </ul>
      </section>

      <section className="bg-panel-900 border border-line rounded-lg p-6">
        <p className="mono text-bronze text-xs tracking-widest mb-3">// СТРУКТУРА КОМАНДЕРІЇ</p>
        <ul className="text-sm text-muted-500 space-y-1">
          <li>Кожна командерія має керівника (лідера).</li>
          <li>Кожна командерія має 1-2 заступників, обраних членами командерії через локальні праймеріз.</li>
          <li>Заступники мають операційні повноваження лідера на період його відсутності.</li>
        </ul>
      </section>

      <section className="bg-panel-900 border border-line rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-bronze mt-0.5" />
          <div>
            <p className="font-semibold text-text-100">Правило створення осередків</p>
            <p className="text-sm text-muted-500 mt-1">
              Наразі створення доступне тільки для ролі "Почесний Член". Якщо у вас інша роль,
              виконайте умови прогресії, щоб отримати цей доступ.
            </p>
            <Link
              href="/dashboard/progression"
              className="inline-flex items-center gap-2 text-sm font-semibold text-bronze mt-3"
            >
              Переглянути шлях до ролі
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {result.canCreate && (
        <section className="bg-panel-900 border border-line rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-bronze" />
            <h2 className="font-syne text-xl font-bold">Створити командерію</h2>
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-muted-500">Назва</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Командерія Київ"
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
                minLength={3}
                maxLength={100}
              />
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Код (латиниця)</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="KYIV-CMD"
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
                minLength={3}
                maxLength={20}
              />
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Тип</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as 'commandery' | 'city')}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
              >
                <option value="commandery">Командерія</option>
                <option value="city">Міський осередок</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Батьківський код (для міського осередку)</span>
              <input
                value={parentCode}
                onChange={(event) => setParentCode(event.target.value.toUpperCase())}
                placeholder="KYIV-CMD"
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                disabled={type !== 'city'}
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Населений пункт (KATOTTG)</span>
              <div className="mt-1">
                <KatottgSelector
                  value={katottgCode}
                  onChange={(code, details) => {
                    setKatottgCode(code);
                    setKatottgDetails(details);
                  }}
                  required
                  label=""
                />
              </div>
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Адреса осередку (необов'язково)</span>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="вул. Прикладна, 10, офіс 2"
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                maxLength={1000}
              />
            </label>

            {katottgDetails && (
              <p className="md:col-span-2 text-xs text-muted-500">
                Локація: {katottgDetails.oblastName || '-'} / {katottgDetails.raionName || '-'} / {katottgDetails.hromadaName || '-'} / {katottgDetails.name}
              </p>
            )}

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Опис (необов'язково)</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Коротко про фокус, цілі та формат роботи"
                rows={4}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm resize-y"
                maxLength={1500}
              />
            </label>

            {error && (
              <p className="md:col-span-2 text-sm text-red-400">{error}</p>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-5 py-2.5 rounded font-semibold text-sm disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {saving ? 'Створюємо...' : 'Створити командерію'}
              </button>
            </div>
          </form>
        </section>
      )}

      {myCommanderies.length > 0 && (
        <section className="bg-panel-900 border border-line rounded-lg p-6">
          <h2 className="font-syne text-xl font-bold mb-4">Координатор: локальні події командерії</h2>
          <form onSubmit={submitLocalEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Назва події</span>
              <input
                value={eventTitle}
                onChange={(event) => setEventTitle(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-500">Початок</span>
              <input
                type="datetime-local"
                value={eventStartDate}
                onChange={(event) => setEventStartDate(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-500">Завершення</span>
              <input
                type="datetime-local"
                value={eventEndDate}
                onChange={(event) => setEventEndDate(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Адреса</span>
              <input
                value={eventLocationAddress}
                onChange={(event) => setEventLocationAddress(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Опис</span>
              <textarea
                value={eventDescription}
                onChange={(event) => setEventDescription(event.target.value)}
                rows={2}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving || !reportCommanderyId}
                className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-5 py-2.5 rounded font-semibold text-sm disabled:opacity-60"
              >
                Створити локальну подію
              </button>
            </div>
          </form>

          {localEvents.length > 0 && (
            <div className="mt-4 space-y-2">
              {localEvents.slice(0, 5).map((event) => (
                <p key={event.id} className="text-xs text-muted-500">
                  {event.title} · {new Date(event.start_date).toLocaleString('uk-UA')} · {event.status}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {myCommanderies.length > 0 && (
        <section className="bg-panel-900 border border-line rounded-lg p-6">
          <h2 className="font-syne text-xl font-bold mb-4">Координатор: локальні голосування командерії</h2>
          <form onSubmit={submitLocalVote} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Назва голосування</span>
              <input
                value={voteTitle}
                onChange={(event) => setVoteTitle(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-500">Початок</span>
              <input
                type="datetime-local"
                value={voteStartDate}
                onChange={(event) => setVoteStartDate(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-500">Завершення</span>
              <input
                type="datetime-local"
                value={voteEndDate}
                onChange={(event) => setVoteEndDate(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Опис</span>
              <textarea
                value={voteDescription}
                onChange={(event) => setVoteDescription(event.target.value)}
                rows={2}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
              />
            </label>

            <label className="text-sm md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDeputyPrimaries}
                onChange={(event) => setIsDeputyPrimaries(event.target.checked)}
              />
              <span className="text-muted-500">Це праймеріз для обрання заступників керівника командерії</span>
            </label>

            {isDeputyPrimaries ? (
              <>
                <label className="text-sm">
                  <span className="text-muted-500">Кількість переможців</span>
                  <select
                    value={deputyWinnerCount}
                    onChange={(event) => setDeputyWinnerCount(event.target.value as '1' | '2')}
                    className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                  >
                    <option value="1">1 заступник</option>
                    <option value="2">2 заступники</option>
                  </select>
                </label>
                <p className="text-xs text-muted-500 self-end">
                  Призначення відбудеться після закриття голосування в адмін-панелі.
                </p>
                {deputyCandidates.map((candidate, index) => (
                  <div key={`deputy-candidate-${index}`} className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label className="text-sm md:col-span-2">
                      <span className="text-muted-500">Кандидат #{index + 1}</span>
                      <select
                        value={candidate.candidateUserId}
                        onChange={(event) => setDeputyCandidates((prev) => prev.map((item, itemIndex) => (
                          itemIndex === index ? { ...item, candidateUserId: event.target.value } : item
                        )))}
                        className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Оберіть члена командерії</option>
                        {localMembers.map((member) => {
                          const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email || 'Без імені';
                          return (
                            <option key={member.id} value={member.id}>
                              {fullName} ({member.membership_role || 'роль не вказано'})
                            </option>
                          );
                        })}
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="text-muted-500">Коротка програма</span>
                      <input
                        value={candidate.description}
                        onChange={(event) => setDeputyCandidates((prev) => prev.map((item, itemIndex) => (
                          itemIndex === index ? { ...item, description: event.target.value } : item
                        )))}
                        className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                        placeholder="Необов'язково"
                      />
                    </label>
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-line text-xs font-semibold hover:bg-panel-850"
                    onClick={() => setDeputyCandidates((prev) => (prev.length < 10 ? [...prev, { candidateUserId: '', description: '' }] : prev))}
                  >
                    Додати кандидата
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded border border-line text-xs font-semibold hover:bg-panel-850"
                    onClick={() => setDeputyCandidates((prev) => (prev.length > 2 ? prev.slice(0, prev.length - 1) : prev))}
                  >
                    Прибрати кандидата
                  </button>
                </div>
              </>
            ) : (
              <label className="text-sm md:col-span-2">
                <span className="text-muted-500">Варіанти (кожен з нового рядка)</span>
                <textarea
                  value={voteOptionsText}
                  onChange={(event) => setVoteOptionsText(event.target.value)}
                  rows={4}
                  className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                  required
                />
              </label>
            )}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving || !reportCommanderyId}
                className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-5 py-2.5 rounded font-semibold text-sm disabled:opacity-60"
              >
                {isDeputyPrimaries ? 'Запустити праймеріз заступників' : 'Створити локальне голосування'}
              </button>
            </div>
          </form>

          {localVotes.length > 0 && (
            <div className="mt-4 space-y-2">
              {localVotes.slice(0, 5).map((vote) => (
                <p key={vote.id} className="text-xs text-muted-500">
                  {vote.title}
                  {vote.is_election && vote.position_type === 'deputy_commander' ? ' · праймеріз заступників' : ''}
                  {' · '}до {new Date(vote.end_date).toLocaleString('uk-UA')} · {vote.status} · {vote.total_votes || 0} голосів
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {myCommanderies.length > 0 && (
        <section className="bg-panel-900 border border-line rounded-lg p-6">
          <h2 className="font-syne text-xl font-bold mb-4">Щомісячний MVP звіт командерії</h2>
          <form onSubmit={submitMvpReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="text-muted-500">Командерія</span>
              <select
                value={reportCommanderyId}
                onChange={(event) => setReportCommanderyId(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              >
                {myCommanderies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Місяць звіту</span>
              <input
                type="date"
                value={reportMonth}
                onChange={(event) => setReportMonth(event.target.value)}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Кількість активних людей (2-5)</span>
              <input
                type="number"
                min={0}
                value={activeMembersCount}
                onChange={(event) => setActiveMembersCount(Number(event.target.value))}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Регулярні зустрічі за місяць</span>
              <input
                type="number"
                min={0}
                value={monthlyMeetingsCount}
                onChange={(event) => setMonthlyMeetingsCount(Number(event.target.value))}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm">
              <span className="text-muted-500">Локальні дії за місяць</span>
              <input
                type="number"
                min={0}
                value={monthlyLocalActionsCount}
                onChange={(event) => setMonthlyLocalActionsCount(Number(event.target.value))}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <div className="text-sm rounded border border-line bg-panel-850 p-3">
              <span className="text-muted-500">Статус за введеними даними</span>
              <p className={`mt-1 font-semibold ${(activeMembersCount >= 2 && activeMembersCount <= 5 && monthlyMeetingsCount >= 1 && monthlyLocalActionsCount >= 1) ? 'text-green-400' : 'text-amber-400'}`}>
                {(activeMembersCount >= 2 && activeMembersCount <= 5 && monthlyMeetingsCount >= 1 && monthlyLocalActionsCount >= 1)
                  ? 'MVP виконано'
                  : 'MVP ще не виконано'}
              </p>
            </div>

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Що зробили</span>
              <textarea
                value={whatDone}
                onChange={(event) => setWhatDone(event.target.value)}
                rows={3}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Що плануємо</span>
              <textarea
                value={whatPlanned}
                onChange={(event) => setWhatPlanned(event.target.value)}
                rows={3}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="text-muted-500">Що потрібно</span>
              <textarea
                value={whatNeeded}
                onChange={(event) => setWhatNeeded(event.target.value)}
                rows={3}
                className="mt-1 w-full bg-panel-850 border border-line rounded px-3 py-2 text-sm"
                required
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-bronze text-bg-950 px-5 py-2.5 rounded font-semibold text-sm disabled:opacity-60"
              >
                {saving ? 'Зберігаємо...' : 'Зберегти MVP звіт'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-panel-900 border border-line rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-bronze" />
          <h2 className="font-syne text-xl font-bold">Список командерій</h2>
        </div>

        {result.commanderies.length === 0 ? (
          <p className="text-sm text-muted-500">Поки що немає жодної командерії.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.commanderies.map((item) => (
              <article key={item.id} className="bg-panel-850 border border-line rounded p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-100">{item.name}</h3>
                    <p className="text-xs text-muted-500 mt-1">{item.code} · {item.type === 'city' ? 'Міський осередок' : 'Командерія'}</p>
                  </div>
                  {item.leader_id === result.currentUserId && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-bronze/20 text-bronze">Моя</span>
                  )}
                  {item.leader_id !== result.currentUserId && manageableCommanderyIds.has(item.id) && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-300">Координую</span>
                  )}
                </div>

                {item.parent_code && (
                  <p className="text-xs text-muted-500 mt-2">Батьківська: {item.parent_code}</p>
                )}

                {item.settlement_name && (
                  <p className="text-xs text-muted-500 mt-2">
                    Локація: {item.oblast_name || '-'} / {item.raion_name || '-'} / {item.hromada_name || '-'} / {item.settlement_name}
                    {item.katottg_code ? ` (${item.katottg_code})` : ''}
                  </p>
                )}

                {item.address && (
                  <p className="text-xs text-muted-500 mt-1">Адреса: {item.address}</p>
                )}

                {item.description && (
                  <p className="text-sm text-muted-500 mt-3 line-clamp-3">{item.description}</p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-500">
                  <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {item.member_count || 0} учасників</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {reports.length > 0 && (
        <section className="bg-panel-900 border border-line rounded-lg p-6">
          <h2 className="font-syne text-xl font-bold mb-4">Останні MVP звіти</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-panel-850 border border-line rounded p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-text-100">
                    {report.commandery?.name || report.commandery_id} · {report.report_month}
                  </p>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${report.is_mvp_compliant ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {report.is_mvp_compliant ? 'MVP виконано' : 'MVP не виконано'}
                  </span>
                </div>
                <p className="text-xs text-muted-500 mt-2">
                  Активні: {report.active_members_count} · Зустрічі: {report.monthly_meetings_count} · Локальні дії: {report.monthly_local_actions_count}
                </p>
                <p className="text-sm text-muted-500 mt-2"><strong className="text-text-100">Зробили:</strong> {report.what_done}</p>
                <p className="text-sm text-muted-500 mt-1"><strong className="text-text-100">Плануємо:</strong> {report.what_planned}</p>
                <p className="text-sm text-muted-500 mt-1"><strong className="text-text-100">Потрібно:</strong> {report.what_needed}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
