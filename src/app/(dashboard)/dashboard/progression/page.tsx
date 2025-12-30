'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import TaskCard from '@/components/progression/task-card';
import RoleJourney from '@/components/progression/role-journey';
import StreakCard from '@/components/progression/streak-card';
import AchievementModal from '@/components/progression/achievement-modal';
import MilestoneModal from '@/components/progression/milestone-modal';
import { MEMBERSHIP_ROLES } from '@/lib/constants';
import type { MembershipRole } from '@/lib/services/role-progression';

interface ProgressionData {
  currentRole: {
    role: string;
    level: number;
    displayName: string;
    description: string;
    icon: string;
    color: string;
  };
  roleJourney: Array<{
    role: string;
    level: number;
    displayName: string;
    icon: string;
    isPast: boolean;
    isCurrent: boolean;
    isFuture: boolean;
  }>;
  tasks: any[];
  incompleteTasks: any[];
  completedTasks: any[];
  streak: {
    current: number;
    longest: number;
    totalDays: number;
    nextMilestone: number;
    daysUntilMilestone: number;
  };
  achievements: Array<{
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  milestones: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
  }>;
  progress: {
    currentRole: string;
    currentRoleLevel: number;
    currentRoleLabel: string;
    nextRole: string | null;
    nextRoleLevel: number | null;
    nextRoleLabel: string | null;
    isEligible: boolean;
    progressPercent: number;
  } | null;
  newPrivileges: string[];
}

const PRIVILEGE_LABELS: Record<string, string> = {
  newsletter: 'Отримання новин',
  primary_voting: 'Голосування на праймеріз',
  full_voting: 'Повне голосування',
  event_attendance: 'Участь у подіях',
  task_execution: 'Виконання завдань',
  referral_tree: 'Перегляд реферального дерева',
  event_organization: 'Організація подій',
  task_creation: 'Створення завдань',
  council_access: 'Доступ до Ради Лідерів',
  nomination_rights: 'Право висування кандидатів',
};

export default function ProgressionPage() {
  const [data, setData] = useState<ProgressionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch progression data
        const response = await fetch('/api/user/progression');
        if (!response.ok) {
          throw new Error('Failed to fetch progression data');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to load data');
        }

        setData(result.data);

        // Show first uncelebrated milestone
        if (result.data.milestones && result.data.milestones.length > 0) {
          setCurrentMilestone(result.data.milestones[0]);
        }

        // Track activity in background (don't await)
        fetch('/api/user/activity', { method: 'POST' }).catch((err) => {
          console.error('[Progression] Failed to track activity:', err);
        });
      } catch (err) {
        console.error('[Progression] Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleMilestoneCelebrate = (milestoneId: string) => {
    // Remove celebrated milestone
    setCurrentMilestone(null);

    // Show next milestone if any
    if (data?.milestones) {
      const remaining = data.milestones.filter((m) => m.id !== milestoneId);
      if (remaining.length > 0) {
        setTimeout(() => {
          setCurrentMilestone(remaining[0]);
        }, 1000);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-timber-dark/10 rounded" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-timber-dark/10 rounded" />
              <div className="h-40 bg-timber-dark/10 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-60 bg-timber-dark/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-2 border-red-600 bg-red-50 p-8 text-center">
          <p className="font-mono text-red-700">
            Помилка завантаження даних: {error || 'Невідома помилка'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-8">
        <div className="flex items-start gap-4 mb-6">
          <Trophy className="w-16 h-16 text-accent flex-shrink-0" />
          <div>
            <h1 className="font-syne text-4xl font-bold text-timber-dark mb-2">
              Ваш шлях у Мережі
            </h1>
            <p className="font-mono text-lg text-timber-dark/80">
              Відстежуйте свій прогрес та досягнення
            </p>
          </div>
        </div>

        {/* Current Role Badge */}
        <div className="border-2 border-accent bg-accent/5 card-with-joints p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-syne text-3xl font-bold text-accent">
                  {data.currentRole.displayName}
                </span>
                <span className="font-mono text-sm text-timber-dark/60">
                  Рівень {data.currentRole.level}
                </span>
              </div>
              <p className="font-mono text-sm text-timber-dark/80">
                {data.currentRole.description}
              </p>
            </div>

            {/* Progress to next role */}
            {data.progress?.nextRole && (
              <div className="min-w-[200px]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-mono text-xs text-timber-dark/60">
                    До наступного рівня
                  </span>
                  <span className="font-mono text-sm font-semibold text-timber-dark">
                    {data.progress.progressPercent}%
                  </span>
                </div>
                <div className="h-2 bg-timber-dark/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${data.progress.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) - Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Tasks */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-timber-dark" />
              <h2 className="font-syne text-2xl font-bold text-timber-dark">
                Поточні завдання
              </h2>
            </div>

            {data.incompleteTasks.length > 0 ? (
              <div className="space-y-4">
                {data.incompleteTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="border-2 border-green-600 bg-green-50 p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="font-syne text-2xl font-bold text-green-700 mb-2">
                  Всі завдання виконано!
                </h3>
                <p className="font-mono text-sm text-green-600">
                  {data.progress?.isEligible
                    ? 'Ви готові до наступного рівня! 🎉'
                    : 'Чудова робота! Продовжуйте в тому ж дусі.'}
                </p>
              </div>
            )}
          </section>

          {/* Completed Tasks (Collapsible) */}
          {data.completedTasks.length > 0 && (
            <section>
              <button
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className="
                  flex items-center gap-2 mb-4
                  font-mono text-sm text-green-600
                  hover:text-green-700 transition-colors
                "
              >
                {showCompletedTasks ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
                Виконані завдання ({data.completedTasks.length})
              </button>

              {showCompletedTasks && (
                <div className="space-y-4">
                  {data.completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right Column (1/3) - Sidebar */}
        <div className="space-y-6">
          {/* Streak Card */}
          <StreakCard streak={data.streak} />

          {/* Recent Achievements */}
          {data.achievements.length > 0 && (
            <section className="border-2 border-timber-dark bg-canvas card-with-joints p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-timber-dark" />
                <h3 className="font-syne text-lg font-bold text-timber-dark">
                  Останні досягнення
                </h3>
              </div>

              <div className="space-y-2">
                {data.achievements.slice(0, 5).map((achievement) => (
                  <button
                    key={achievement.id}
                    onClick={() => setSelectedAchievement(achievement)}
                    className="
                      w-full text-left
                      flex items-center gap-3 p-3
                      border border-timber-dark/20 bg-timber-dark/5
                      hover:bg-timber-dark/10
                      transition-colors
                    "
                  >
                    <Trophy className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-semibold text-timber-dark truncate">
                        {achievement.title}
                      </div>
                      <div className="font-mono text-xs text-timber-dark/60">
                        {new Date(achievement.earnedAt).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Next Level Info */}
          {data.progress?.nextRole && (
            <section className="border-2 border-timber-dark bg-canvas card-with-joints p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h3 className="font-syne text-lg font-bold text-timber-dark">
                  Наступний рівень
                </h3>
              </div>

              <div className="mb-4">
                <div className="font-syne text-2xl font-bold text-accent mb-1">
                  {data.progress.nextRoleLabel}
                </div>
                <div className="font-mono text-xs text-timber-dark/60">
                  Рівень {data.progress.nextRoleLevel}
                </div>
              </div>

              {data.newPrivileges.length > 0 && (
                <>
                  <h4 className="font-mono text-sm font-semibold text-timber-dark mb-3">
                    Нові можливості:
                  </h4>
                  <ul className="space-y-2">
                    {data.newPrivileges.map((priv) => (
                      <li
                        key={priv}
                        className="flex items-start gap-2 font-mono text-sm text-timber-dark/80"
                      >
                        <span className="text-accent">✨</span>
                        {PRIVILEGE_LABELS[priv] || priv}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Role Journey */}
      <section className="mt-12">
        <RoleJourney roles={data.roleJourney} />
      </section>

      {/* Modals */}
      {currentMilestone && (
        <MilestoneModal
          milestone={currentMilestone}
          onCelebrate={handleMilestoneCelebrate}
        />
      )}

      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}
