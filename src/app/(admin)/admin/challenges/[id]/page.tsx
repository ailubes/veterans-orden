'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Target,
  Trophy,
  Users,
  Calendar,
  CheckSquare,
  Vote,
  Coins,
  ArrowLeft,
  Edit2,
  Star,
  Medal,
  Loader2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
} from '@/lib/challenges';
import type { Challenge, ChallengeLeaderboardEntry } from '@/lib/challenges';

const goalIcons = {
  referrals: Users,
  tasks: CheckSquare,
  events: Calendar,
  votes: Vote,
  points: Coins,
};

interface Participant {
  id: string;
  rank?: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  user: {
    firstName: string;
    lastName?: string;
    email?: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminChallengeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [challengeRes, participantsRes, leaderboardRes] = await Promise.all([
        fetch(`/api/admin/challenges/${id}`),
        fetch(`/api/admin/challenges/${id}/participants?limit=50`),
        fetch(`/api/challenges/${id}/leaderboard?limit=10`),
      ]);

      if (!challengeRes.ok) {
        setError('Челендж не знайдено');
        return;
      }

      const challengeData = await challengeRes.json();
      setChallenge(challengeData.challenge);

      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData.participants || []);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch challenge:', err);
      setError('Помилка завантаження');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate() {
    if (!confirm('Активувати цей челендж?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/activate`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка активації');
      }
    } catch {
      alert('Помилка активації');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!confirm('Завершити цей челендж та нарахувати нагороди?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Челендж завершено! Нагороджено ${data.result?.winnersCount || 0} учасників.`);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка завершення');
      }
    } catch {
      alert('Помилка завершення');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Скасувати цей челендж?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка скасування');
      }
    } catch {
      alert('Помилка скасування');
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    });
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={18} />;
    if (rank === 2) return <Medal className="text-gray-400" size={18} />;
    if (rank === 3) return <Medal className="text-amber-600" size={18} />;
    return <span className="w-5 h-5 flex items-center justify-center font-bold text-timber-beam text-sm">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/challenges"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-8"
        >
          <ArrowLeft size={16} />
          До списку челенджів
        </Link>

        <div className="bg-canvas border-2 border-timber-dark p-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
          <h2 className="font-syne text-xl font-bold mb-2">{error || 'Челендж не знайдено'}</h2>
        </div>
      </div>
    );
  }

  const GoalIcon = goalIcons[challenge.goalType] || Target;
  const completedCount = participants.filter((p) => p.completed).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/challenges"
        className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-8"
      >
        <ArrowLeft size={16} />
        До списку челенджів
      </Link>

      {/* Header */}
      <div className="bg-timber-dark text-canvas p-6 relative mb-6">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/20 text-accent rounded">
              <GoalIcon size={32} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 text-xs font-bold bg-canvas/20">
                  {CHALLENGE_TYPE_LABELS[challenge.type].uk}
                </span>
                <span className={`px-2 py-0.5 text-xs ${
                  challenge.status === 'active' ? 'bg-green-500' :
                  challenge.status === 'upcoming' ? 'bg-blue-500' :
                  challenge.status === 'completed' ? 'bg-gray-500' :
                  'bg-red-500'
                }`}>
                  {CHALLENGE_STATUS_LABELS[challenge.status].uk}
                </span>
                {challenge.isCompetitive && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-orange-500">
                    <Trophy size={10} className="inline mr-1" />
                    Топ-{challenge.maxWinners}
                  </span>
                )}
              </div>

              <h1 className="font-syne text-2xl sm:text-3xl font-bold mb-2">{challenge.title}</h1>

              {challenge.description && (
                <p className="text-sm opacity-80 mb-4">{challenge.description}</p>
              )}

              <div className="flex items-center gap-4 flex-wrap text-sm opacity-80">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatShortDate(challenge.startDate)} — {formatShortDate(challenge.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Target size={14} />
                  {challenge.goalTarget} {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                </span>
                <span className="flex items-center gap-1 text-accent font-bold">
                  <Star size={14} />
                  +{challenge.points} балів
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {challenge.status === 'upcoming' && (
              <>
                <Link
                  href={`/admin/challenges/${id}/edit`}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  РЕДАГУВАТИ
                </Link>
                <button
                  onClick={handleActivate}
                  disabled={actionLoading}
                  className="btn flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                  АКТИВУВАТИ
                </button>
              </>
            )}
            {challenge.status === 'active' && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="btn flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  ЗАВЕРШИТИ
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="btn btn-outline flex items-center gap-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  <XCircle size={16} />
                  СКАСУВАТИ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-canvas border-2 border-timber-dark p-4">
              <p className="label mb-1">УЧАСНИКІВ</p>
              <p className="font-syne text-2xl font-bold">{participants.length}</p>
            </div>
            <div className="bg-canvas border-2 border-timber-dark p-4">
              <p className="label mb-1">ВИКОНАЛИ</p>
              <p className="font-syne text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div className="bg-canvas border-2 border-timber-dark p-4">
              <p className="label mb-1">ЦІЛЬ</p>
              <p className="font-syne text-2xl font-bold">{challenge.goalTarget}</p>
            </div>
            <div className="bg-canvas border-2 border-timber-dark p-4">
              <p className="label mb-1">НАГОРОДА</p>
              <p className="font-syne text-2xl font-bold text-accent">{challenge.points}</p>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-canvas border-2 border-timber-dark relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <div className="p-4 border-b border-timber-dark">
              <h2 className="font-syne text-lg font-bold">Учасники ({participants.length})</h2>
            </div>

            {participants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-timber-dark/30">
                    <tr>
                      <th className="text-left p-3 text-xs font-bold">#</th>
                      <th className="text-left p-3 text-xs font-bold">УЧАСНИК</th>
                      <th className="text-left p-3 text-xs font-bold">ПРОГРЕС</th>
                      <th className="text-left p-3 text-xs font-bold">СТАТУС</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <tr key={participant.id} className="border-b border-timber-dark/10 hover:bg-timber-dark/5">
                        <td className="p-3">
                          {participant.rank ? getMedalIcon(participant.rank) : index + 1}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-sm">
                            {participant.user.firstName} {participant.user.lastName?.charAt(0)}.
                          </div>
                          {participant.user.email && (
                            <div className="text-xs text-timber-beam">{participant.user.email}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-timber-dark/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent"
                                style={{ width: `${Math.min((participant.progress / challenge.goalTarget) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold">
                              {participant.progress}/{challenge.goalTarget}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {participant.completed ? (
                            <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700">
                              Виконано
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-timber-dark/10">
                              В процесі
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-timber-beam">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Поки немає учасників</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          {challenge.isCompetitive && leaderboard.length > 0 && (
            <div className="bg-canvas border-2 border-timber-dark p-4 relative">
              <div className="joint joint-tl" />

              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-accent" size={18} />
                <h3 className="font-syne font-bold">Лідерборд</h3>
              </div>

              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.rank} className="flex items-center gap-2 p-2 bg-timber-dark/5">
                    {getMedalIcon(entry.rank)}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {entry.firstName} {entry.lastName?.charAt(0)}.
                      </p>
                    </div>
                    <span className="font-syne font-bold text-accent text-sm">{entry.progress}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenge Info */}
          <div className="bg-timber-dark text-canvas p-4 relative">
            <div className="joint joint-tl" />

            <h3 className="font-syne font-bold mb-4">Деталі</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="opacity-60">Тип</span>
                <span className="font-bold">{CHALLENGE_TYPE_LABELS[challenge.type].uk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60">Ціль</span>
                <span className="font-bold">{CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60">Початок</span>
                <span className="font-bold">{formatShortDate(challenge.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-60">Кінець</span>
                <span className="font-bold">{formatShortDate(challenge.endDate)}</span>
              </div>
              {challenge.isCompetitive && (
                <div className="flex items-center justify-between">
                  <span className="opacity-60">Переможців</span>
                  <span className="font-bold">{challenge.maxWinners}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="opacity-60">Створено</span>
                <span className="font-bold">{formatShortDate(challenge.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
