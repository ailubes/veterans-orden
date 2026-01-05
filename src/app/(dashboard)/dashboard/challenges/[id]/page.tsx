'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Target,
  Trophy,
  Clock,
  Users,
  Calendar,
  CheckSquare,
  Vote,
  Coins,
  ArrowLeft,
  Star,
  Medal,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
} from '@/lib/challenges';
import type { ChallengeWithProgress, ChallengeLeaderboardEntry } from '@/lib/challenges';
import { formatDateTimeWithLocal } from '@/lib/utils';

const goalIcons = {
  referrals: Users,
  tasks: CheckSquare,
  events: Calendar,
  votes: Vote,
  points: Coins,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChallengeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<ChallengeWithProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  async function fetchChallenge() {
    setLoading(true);
    setError(null);
    try {
      const [challengeRes, leaderboardRes] = await Promise.all([
        fetch(`/api/challenges/${id}`),
        fetch(`/api/challenges/${id}/leaderboard?limit=10`),
      ]);

      if (!challengeRes.ok) {
        setError('Челендж не знайдено');
        return;
      }

      const challengeData = await challengeRes.json();
      setChallenge(challengeData.challenge);

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

  async function handleJoin() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/challenges/${id}/join`, { method: 'POST' });
      if (res.ok) {
        fetchChallenge();
      } else {
        const data = await res.json();
        setError(data.error || 'Не вдалося долучитися');
      }
    } catch {
      setError('Помилка при долученні');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (!confirm('Ви впевнені, що хочете вийти з челенджу? Ваш прогрес буде втрачено.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/challenges/${id}/leave`, { method: 'POST' });
      if (res.ok) {
        fetchChallenge();
      } else {
        const data = await res.json();
        setError(data.error || 'Не вдалося вийти');
      }
    } catch {
      setError('Помилка при виході');
    } finally {
      setActionLoading(false);
    }
  }

  function formatTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Завершено';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} дн. ${hours} год.`;
    if (hours > 0) return `${hours} год. ${minutes} хв.`;
    return `${minutes} хв.`;
  }

  function formatDate(dateStr: string): string {
    return formatDateTimeWithLocal(dateStr, { showDate: true, showYear: true });
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-600" size={20} />;
    return <span className="w-5 h-5 flex items-center justify-center font-bold text-muted-500 text-sm">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-bronze" size={48} />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-8"
        >
          <ArrowLeft size={16} />
          До списку челенджів
        </Link>

        <div className="bg-panel-900 border border-line p-12 text-center rounded-lg">
          <X className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="font-syne text-xl font-bold text-text-100 mb-2">{error || 'Челендж не знайдено'}</h2>
          <Link href="/dashboard/challenges" className="text-bronze hover:underline text-sm">
            ← Повернутися до списку
          </Link>
        </div>
      </div>
    );
  }

  const GoalIcon = goalIcons[challenge.goalType] || Target;
  const progressPercent = Math.min(
    Math.round((challenge.userProgress / challenge.goalTarget) * 100),
    100
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/challenges"
        className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-8"
      >
        <ArrowLeft size={16} />
        До списку челенджів
      </Link>

      {/* Header */}
      <div className="bg-bronze text-bg-950 p-6 mb-6 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-bg-950/20 text-bg-950 rounded">
            <GoalIcon size={32} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-bold bg-bg-950/20 rounded">
                {CHALLENGE_TYPE_LABELS[challenge.type].uk}
              </span>
              <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${
                challenge.status === 'active' ? 'bg-green-600' :
                challenge.status === 'upcoming' ? 'bg-blue-600' :
                challenge.status === 'completed' ? 'bg-gray-600' :
                'bg-red-600'
              }`}>
                {CHALLENGE_STATUS_LABELS[challenge.status].uk}
              </span>
              {challenge.isCompetitive && (
                <span className="px-2 py-0.5 text-xs font-bold bg-orange-600 text-white rounded">
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
                {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {challenge.participantCount} учасників
              </span>
              <span className="flex items-center gap-1 font-bold">
                <Star size={14} />
                +{challenge.points} балів
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          {challenge.userJoined && (
            <div className="bg-panel-900 border-2 border-bronze p-6 rounded-lg">
              <p className="mono text-bronze text-xs tracking-widest mb-4">ВАШ ПРОГРЕС</p>

              <div className="flex items-center justify-between mb-2">
                <span className="font-syne text-3xl font-bold text-text-100">
                  {challenge.userProgress} / {challenge.goalTarget}
                </span>
                <span className="font-syne text-2xl font-bold text-bronze">
                  {progressPercent}%
                </span>
              </div>

              <div className="h-4 bg-panel-850 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-bronze transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-sm text-muted-500">
                {challenge.userCompleted ? (
                  <span className="flex items-center gap-2 text-green-400 font-bold">
                    <Check size={16} />
                    Ви успішно виконали цей челендж!
                  </span>
                ) : (
                  <>
                    Потрібно: {challenge.goalTarget - challenge.userProgress}{' '}
                    {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                  </>
                )}
              </p>

              {challenge.status === 'active' && !challenge.userCompleted && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-xs text-muted-500 flex items-center gap-1">
                    <Clock size={12} />
                    Залишилось: {formatTimeRemaining(challenge.endDate)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Goal Info Card */}
          <div className="bg-panel-900 border border-line p-6 rounded-lg">
            <h2 className="font-syne text-xl font-bold text-text-100 mb-4">Умови челенджу</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-panel-850 rounded">
                <Target className="text-bronze" size={20} />
                <div>
                  <p className="font-bold text-text-100">Мета</p>
                  <p className="text-sm text-muted-500">
                    {challenge.goalTarget}{' '}
                    {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-panel-850 rounded">
                <Star className="text-bronze" size={20} />
                <div>
                  <p className="font-bold text-text-100">Нагорода</p>
                  <p className="text-sm text-muted-500">
                    +{challenge.points} балів
                    {challenge.isCompetitive && ` (топ-${challenge.maxWinners} отримують бонус)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-panel-850 rounded">
                <Clock className="text-bronze" size={20} />
                <div>
                  <p className="font-bold text-text-100">Термін</p>
                  <p className="text-sm text-muted-500">
                    {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}
                  </p>
                </div>
              </div>

              {challenge.isCompetitive && (
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500 rounded">
                  <Trophy className="text-orange-500" size={20} />
                  <div>
                    <p className="font-bold text-orange-400">Змагання!</p>
                    <p className="text-sm text-muted-500">
                      Топ-{challenge.maxWinners} учасників отримають додаткові бали
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Join/Leave Button */}
            {challenge.status === 'active' && (
              <div className="mt-6 pt-4 border-t border-line">
                {challenge.userJoined ? (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="w-full py-3 text-sm font-bold border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 rounded"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    ) : (
                      'ВИЙТИ З ЧЕЛЕНДЖУ'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="w-full py-3 text-sm font-bold bg-bronze text-bg-950 hover:bg-bronze/90 transition-colors disabled:opacity-50 rounded"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin mx-auto" size={16} />
                    ) : (
                      'ДОЛУЧИТИСЬ ДО ЧЕЛЕНДЖУ'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          {challenge.isCompetitive && (
            <div className="bg-panel-900 border border-line p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="text-bronze" size={20} />
                <h2 className="font-syne text-lg font-bold text-text-100">Лідерборд</h2>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-2 rounded ${
                        entry.isCurrentUser
                          ? 'bg-bronze/10 border border-bronze'
                          : 'bg-panel-850'
                      }`}
                    >
                      {getMedalIcon(entry.rank)}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-100 truncate">
                          {entry.firstName} {entry.lastName?.charAt(0)}.
                          {entry.isCurrentUser && ' (ви)'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-syne font-bold text-bronze text-sm">
                          {entry.progress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-500 text-center py-4">
                  Поки немає учасників
                </p>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-bronze text-bg-950 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">Учасників</span>
                <span className="font-syne font-bold">{challenge.participantCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">Тип</span>
                <span className="font-bold text-xs">{CHALLENGE_TYPE_LABELS[challenge.type].uk}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">Ціль</span>
                <span className="font-bold text-xs">{CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
