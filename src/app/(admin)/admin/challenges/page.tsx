'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Target,
  Edit2,
  Trash2,
  Eye,
  Trophy,
  Users,
  Calendar,
  CheckSquare,
  Vote,
  Coins,
  Play,
  XCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
} from '@/lib/challenges';
import type { Challenge, ChallengeType, ChallengeStatus } from '@/lib/challenges';

const goalIcons = {
  referrals: Users,
  tasks: CheckSquare,
  events: Calendar,
  votes: Vote,
  points: Coins,
};

const statusColors: Record<ChallengeStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ status?: ChallengeStatus; type?: ChallengeType }>({});

  useEffect(() => {
    fetchChallenges();
  }, [filter]);

  async function fetchChallenges() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.type) params.set('type', filter.type);
      params.set('limit', '50');

      const res = await fetch(`/api/admin/challenges?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate(id: string) {
    if (!confirm('Активувати цей челендж? Учасники зможуть долучитися.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/activate`, { method: 'POST' });
      if (res.ok) {
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка активації');
      }
    } catch {
      alert('Помилка активації');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleComplete(id: string) {
    if (!confirm('Завершити цей челендж та нарахувати нагороди? Цю дію неможливо скасувати.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Челендж завершено! Нагороджено ${data.result?.winnersCount || 0} учасників.`);
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка завершення');
      }
    } catch {
      alert('Помилка завершення');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Скасувати цей челендж? Учасники не отримають нагород.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка скасування');
      }
    } catch {
      alert('Помилка скасування');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Видалити цей челендж назавжди? Цю дію неможливо скасувати.')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchChallenges();
      } else {
        const data = await res.json();
        alert(data.error || 'Помилка видалення');
      }
    } catch {
      alert('Помилка видалення');
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
    });
  }

  const upcomingCount = challenges.filter((c) => c.status === 'upcoming').length;
  const activeCount = challenges.filter((c) => c.status === 'active').length;
  const completedCount = challenges.filter((c) => c.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold">Челенджі</h1>
        </div>
        <Link
          href="/admin/challenges/new"
          className="btn flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          СТВОРИТИ ЧЕЛЕНДЖ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{challenges.length}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ОЧІКУЮТЬСЯ</p>
          <p className="font-syne text-3xl font-bold text-blue-600">{upcomingCount}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">АКТИВНИХ</p>
          <p className="font-syne text-3xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-canvas border-2 border-timber-dark p-4">
          <p className="label mb-1">ЗАВЕРШЕНО</p>
          <p className="font-syne text-3xl font-bold text-gray-600">{completedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter({})}
          className={`px-3 py-1.5 text-xs font-bold transition-colors ${
            !filter.status ? 'bg-timber-dark text-canvas' : 'bg-canvas border border-timber-dark/30'
          }`}
        >
          Усі
        </button>
        {(['upcoming', 'active', 'completed', 'cancelled'] as ChallengeStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter({ ...filter, status })}
            className={`px-3 py-1.5 text-xs font-bold transition-colors ${
              filter.status === status
                ? 'bg-timber-dark text-canvas'
                : 'bg-canvas border border-timber-dark/30 hover:border-timber-dark'
            }`}
          >
            {CHALLENGE_STATUS_LABELS[status].uk}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : challenges.length > 0 ? (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {challenges.map((challenge) => {
              const GoalIcon = goalIcons[challenge.goalType] || Target;
              const isLoading = actionLoading === challenge.id;

              return (
                <div
                  key={challenge.id}
                  className="bg-canvas border-2 border-timber-dark p-4 relative"
                >
                  <div className="joint joint-tl" />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <GoalIcon size={20} className="text-timber-beam" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-1">{challenge.title}</h3>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold flex-shrink-0 ${statusColors[challenge.status]}`}>
                      {CHALLENGE_STATUS_LABELS[challenge.status].uk}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                    <span className="px-2 py-1 bg-timber-dark/10">
                      {CHALLENGE_TYPE_LABELS[challenge.type].uk}
                    </span>
                    <span className="px-2 py-1 bg-timber-dark/10">
                      {challenge.goalTarget} {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                    </span>
                    {challenge.isCompetitive && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 font-bold">
                        <Trophy size={10} className="inline mr-1" />
                        Топ-{challenge.maxWinners}
                      </span>
                    )}
                    <span className="font-bold text-accent">+{challenge.points} балів</span>
                  </div>

                  <p className="text-xs text-timber-beam mb-3">
                    {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
                  </p>

                  <div className="flex items-center gap-2 pt-3 border-t border-timber-dark/10">
                    <Link href={`/admin/challenges/${challenge.id}`} className="flex-1 btn btn-sm text-center">
                      {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'ПЕРЕГЛЯНУТИ'}
                    </Link>
                    {challenge.status === 'upcoming' && (
                      <button
                        onClick={() => handleActivate(challenge.id)}
                        disabled={isLoading}
                        className="p-2 bg-green-100 text-green-700 hover:bg-green-200"
                        title="Активувати"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {challenge.status === 'active' && (
                      <button
                        onClick={() => handleComplete(challenge.id)}
                        disabled={isLoading}
                        className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="Завершити"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-canvas border-2 border-timber-dark relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-timber-dark">
                  <tr>
                    <th className="text-left p-4 font-bold text-xs">ЧЕЛЕНДЖ</th>
                    <th className="text-left p-4 font-bold text-xs">ТИП</th>
                    <th className="text-left p-4 font-bold text-xs">ЦІЛЬ</th>
                    <th className="text-left p-4 font-bold text-xs">ТЕРМІНИ</th>
                    <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                    <th className="text-left p-4 font-bold text-xs">БАЛИ</th>
                    <th className="text-left p-4 font-bold text-xs">ДІЇ</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((challenge) => {
                    const GoalIcon = goalIcons[challenge.goalType] || Target;
                    const isLoading = actionLoading === challenge.id;

                    return (
                      <tr key={challenge.id} className="border-b border-timber-dark/20 hover:bg-timber-dark/5">
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <GoalIcon size={18} className="text-timber-beam flex-shrink-0" />
                            <div>
                              <div className="font-bold">{challenge.title}</div>
                              {challenge.isCompetitive && (
                                <span className="text-xs text-orange-600 font-bold">
                                  <Trophy size={10} className="inline mr-1" />
                                  Топ-{challenge.maxWinners}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                            {CHALLENGE_TYPE_LABELS[challenge.type].uk}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {challenge.goalTarget} {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold ${statusColors[challenge.status]}`}>
                            {CHALLENGE_STATUS_LABELS[challenge.status].uk}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-accent">{challenge.points}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/challenges/${challenge.id}`}
                              className="p-2 hover:bg-timber-dark/10 rounded"
                              title="Переглянути"
                            >
                              <Eye size={16} />
                            </Link>
                            {challenge.status === 'upcoming' && (
                              <>
                                <Link
                                  href={`/admin/challenges/${challenge.id}/edit`}
                                  className="p-2 hover:bg-timber-dark/10 rounded"
                                  title="Редагувати"
                                >
                                  <Edit2 size={16} />
                                </Link>
                                <button
                                  onClick={() => handleActivate(challenge.id)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-green-50 rounded text-green-600"
                                  title="Активувати"
                                >
                                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                                </button>
                                <button
                                  onClick={() => handleDelete(challenge.id)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-red-50 rounded text-red-500"
                                  title="Видалити"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                            {challenge.status === 'active' && (
                              <>
                                <button
                                  onClick={() => handleComplete(challenge.id)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-blue-50 rounded text-blue-600"
                                  title="Завершити"
                                >
                                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                </button>
                                <button
                                  onClick={() => handleCancel(challenge.id)}
                                  disabled={isLoading}
                                  className="p-2 hover:bg-red-50 rounded text-red-500"
                                  title="Скасувати"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <Target className="w-12 h-12 mx-auto mb-4 text-timber-beam" />
          <h3 className="font-syne text-xl font-bold mb-2">Немає челенджів</h3>
          <p className="text-sm text-timber-beam mb-6">
            Створіть перший челендж для стимулювання активності
          </p>
          <Link href="/admin/challenges/new" className="btn">
            СТВОРИТИ ЧЕЛЕНДЖ &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
