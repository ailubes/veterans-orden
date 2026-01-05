'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Target,
  Trophy,
  Clock,
  Users,
  Calendar,
  CheckSquare,
  Vote,
  Coins,
  ChevronRight,
  Star,
  Loader2,
  Award,
} from 'lucide-react';
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_STATUS_LABELS,
  CHALLENGE_GOAL_TYPE_LABELS,
  BADGE_RARITY_LABELS,
} from '@/lib/challenges';
import type { ChallengeWithProgress, ChallengeType, ChallengeStatus, UserBadge, BadgeRarity } from '@/lib/challenges';

const goalIcons = {
  referrals: Users,
  tasks: CheckSquare,
  events: Calendar,
  votes: Vote,
  points: Coins,
};

const statusColors = {
  upcoming: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-muted-500',
  cancelled: 'bg-red-400',
};

const typeColors = {
  weekly: 'border-blue-500 bg-blue-500/10 text-blue-400',
  monthly: 'border-purple-500 bg-purple-500/10 text-purple-400',
  special: 'border-orange-500 bg-orange-500/10 text-orange-400',
};

const rarityColors: Record<BadgeRarity, string> = {
  common: 'border-muted-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-orange-500',
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([]);
  const [myChallenges, setMyChallenges] = useState<ChallengeWithProgress[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ type?: ChallengeType; status?: ChallengeStatus }>({
    status: 'active',
  });
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchChallenges();
    fetchMyChallenges();
    fetchMyBadges();
  }, [filter]);

  async function fetchChallenges() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.type) params.set('type', filter.type);

      const res = await fetch(`/api/challenges?${params.toString()}`);
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

  async function fetchMyChallenges() {
    try {
      const res = await fetch('/api/challenges/my');
      if (res.ok) {
        const data = await res.json();
        setMyChallenges(data.challenges || []);
        setStats({
          active: data.summary?.active || 0,
          completed: data.summary?.completedByUser || 0,
          inProgress: data.summary?.inProgress || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch my challenges:', error);
    }
  }

  async function fetchMyBadges() {
    try {
      const res = await fetch('/api/badges/my');
      if (res.ok) {
        const data = await res.json();
        setMyBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Failed to fetch my badges:', error);
    }
  }

  async function handleJoin(challengeId: string) {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchChallenges();
        fetchMyChallenges();
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  }

  function formatTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Завершено';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} дн. ${hours} год.`;
    return `${hours} год.`;
  }

  const activeParticipations = myChallenges.filter(
    (c) => c.userJoined && c.status === 'active' && !c.userCompleted
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="mono text-bronze text-xs tracking-widest mb-2">// ВИКЛИКИ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
          Челенджі
        </h1>
      </div>

      {/* User Stats */}
      <div className="bg-bronze text-bg-950 p-6 rounded-lg mb-8">
        <p className="mono text-bg-950/60 text-xs tracking-widest mb-4">ВАШ ПРОГРЕС</p>

        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">АКТИВНИХ</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold">{stats.active}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">В РОБОТІ</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold">{stats.inProgress}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm opacity-60 mb-1">ЗАВЕРШЕНО</p>
            <p className="font-syne text-2xl sm:text-3xl font-bold">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* My Badges */}
      {myBadges.length > 0 && (
        <div className="bg-panel-900 border border-line p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="text-bronze" size={20} />
              <p className="mono text-bronze text-xs tracking-widest">МОЇ ВІДЗНАКИ ({myBadges.length})</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {myBadges.slice(0, 8).map((userBadge) => (
              <div
                key={userBadge.id}
                className={`w-14 h-14 rounded-lg border-2 ${rarityColors[userBadge.badge.rarity]} overflow-hidden bg-panel-850 hover:scale-110 transition-transform`}
                title={`${userBadge.badge.nameUk} - ${BADGE_RARITY_LABELS[userBadge.badge.rarity].uk}`}
              >
                {userBadge.badge.iconUrl ? (
                  <Image
                    src={userBadge.badge.iconUrl}
                    alt={userBadge.badge.nameUk}
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏅</div>
                )}
              </div>
            ))}
            {myBadges.length > 8 && (
              <div className="w-14 h-14 rounded-lg border border-line flex items-center justify-center text-sm font-bold text-muted-500">
                +{myBadges.length - 8}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Active Challenges */}
      {activeParticipations.length > 0 && (
        <div className="mb-8">
          <h2 className="font-syne text-xl font-bold text-text-100 mb-4">
            Мої активні челенджі ({activeParticipations.length})
          </h2>

          <div className="space-y-3">
            {activeParticipations.map((challenge) => {
              const GoalIcon = goalIcons[challenge.goalType] || Target;
              const progressPercent = Math.min(
                Math.round((challenge.userProgress / challenge.goalTarget) * 100),
                100
              );

              return (
                <Link
                  key={challenge.id}
                  href={`/dashboard/challenges/${challenge.id}`}
                  className="block bg-bronze/10 border border-bronze p-4 rounded-lg hover:bg-bronze/15 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-bronze/20 text-bronze rounded">
                      <GoalIcon size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          typeColors[challenge.type]
                        }`}>
                          {CHALLENGE_TYPE_LABELS[challenge.type].uk}
                        </span>
                        {challenge.isCompetitive && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500 rounded">
                            <Trophy size={10} className="inline mr-1" />
                            Змагання
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-text-100 mb-1 line-clamp-1">{challenge.title}</h3>

                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-500 mb-1">
                          <span>
                            {challenge.userProgress} / {challenge.goalTarget}{' '}
                            {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                          </span>
                          <span className="font-bold text-bronze">{progressPercent}%</span>
                        </div>
                        <div className="h-2 bg-panel-850 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-bronze transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeRemaining(challenge.endDate)}
                        </span>
                        <span className="flex items-center gap-1 text-bronze font-bold">
                          <Star size={12} />
                          +{challenge.points} балів
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="text-muted-500" size={20} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['active', 'upcoming', 'completed'] as ChallengeStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter({ ...filter, status })}
            className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors rounded ${
              filter.status === status
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-900 border border-line text-text-100 hover:border-bronze/50'
            }`}
          >
            {CHALLENGE_STATUS_LABELS[status].uk}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter({ ...filter, type: undefined })}
          className={`px-3 py-1.5 text-xs font-bold transition-colors rounded ${
            !filter.type
              ? 'bg-bronze text-bg-950'
              : 'bg-panel-900 border border-line text-text-100 hover:border-bronze/50'
          }`}
        >
          Усі
        </button>
        {(['weekly', 'monthly', 'special'] as ChallengeType[]).map((type) => (
          <button
            key={type}
            onClick={() => setFilter({ ...filter, type })}
            className={`px-3 py-1.5 text-xs font-bold transition-colors rounded ${
              filter.type === type
                ? 'bg-bronze text-bg-950'
                : 'bg-panel-900 border border-line text-text-100 hover:border-bronze/50'
            }`}
          >
            {CHALLENGE_TYPE_LABELS[type].uk}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div>
        <h2 className="font-syne text-xl font-bold text-text-100 mb-4">
          {filter.status === 'active' && 'Активні челенджі'}
          {filter.status === 'upcoming' && 'Майбутні челенджі'}
          {filter.status === 'completed' && 'Завершені челенджі'}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-bronze" size={32} />
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const GoalIcon = goalIcons[challenge.goalType] || Target;
              const isJoined = challenge.userJoined;

              return (
                <div
                  key={challenge.id}
                  className="bg-panel-900 border border-line p-4 rounded-lg hover:border-bronze/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-panel-850 text-text-200 rounded">
                      <GoalIcon size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${typeColors[challenge.type]}`}>
                          {CHALLENGE_TYPE_LABELS[challenge.type].uk}
                        </span>
                        <span className={`px-2 py-0.5 text-xs text-white rounded ${statusColors[challenge.status]}`}>
                          {CHALLENGE_STATUS_LABELS[challenge.status].uk}
                        </span>
                        {challenge.isCompetitive && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500 rounded">
                            <Trophy size={10} className="inline mr-1" />
                            Топ-{challenge.maxWinners}
                          </span>
                        )}
                        {isJoined && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-bronze/10 text-bronze border border-bronze rounded">
                            Ви долучились
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-text-100 mb-1">{challenge.title}</h3>

                      {challenge.description && (
                        <p className="text-sm text-muted-500 line-clamp-2 mb-2">
                          {challenge.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-500">
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {challenge.goalTarget} {CHALLENGE_GOAL_TYPE_LABELS[challenge.goalType].uk.toLowerCase()}
                        </span>
                        {challenge.status === 'active' && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimeRemaining(challenge.endDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {challenge.participantCount} учасників
                        </span>
                        <span className="flex items-center gap-1 text-bronze font-bold">
                          <Star size={12} />
                          +{challenge.points} балів
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/dashboard/challenges/${challenge.id}`}
                        className="px-4 py-2 text-xs font-bold border border-line text-text-100 hover:bg-panel-850 transition-colors rounded"
                      >
                        ДЕТАЛІ
                      </Link>

                      {challenge.status === 'active' && !isJoined && (
                        <button
                          onClick={() => handleJoin(challenge.id)}
                          className="px-4 py-2 text-xs font-bold bg-bronze text-bg-950 hover:bg-bronze/90 transition-colors rounded"
                        >
                          ДОЛУЧИТИСЬ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-panel-900 border border-line p-12 rounded-lg text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-500" />
            <h3 className="font-syne text-xl font-bold text-text-100 mb-2">
              {filter.status === 'active' && 'Немає активних челенджів'}
              {filter.status === 'upcoming' && 'Немає запланованих челенджів'}
              {filter.status === 'completed' && 'Немає завершених челенджів'}
            </h3>
            <p className="text-sm text-muted-500 mb-6">
              Нові челенджі з&apos;являться найближчим часом
            </p>
            <Link href="/dashboard" className="text-bronze hover:underline text-sm">
              &larr; Повернутися до огляду
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
