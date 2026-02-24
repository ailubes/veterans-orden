'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Target, Sparkles, ChevronDown, ChevronUp, ArrowRight, Users, CreditCard, Star } from 'lucide-react';
import Link from 'next/link';
import TaskCard from '@/components/progression/task-card';
import RoleJourney from '@/components/progression/role-journey';
import { HelpTooltip } from '@/components/help/help-tooltip';
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

// Concrete next-steps per role, shown when tasks are unavailable
const NEXT_STEPS: Record<string, { icon: typeof CreditCard; title: string; description: string; cta: string; ctaUrl: string }[]> = {
  supporter: [
    {
      icon: CreditCard,
      title: 'Зробіть перший членський внесок',
      description: 'Оформіть членство від 49 грн, щоб перейти на рівень «Кандидат в члени» та отримати право голосу на праймеріз.',
      cta: 'Оформити членство',
      ctaUrl: 'payment:basic_49',
    },
  ],
  candidate: [
    {
      icon: Users,
      title: 'Запросіть 2 кандидатів',
      description: 'Запросіть щонайменше 2 друзів, які зареєструються та оформлять власний членський внесок — і ви станете «Членом Ордену».',
      cta: 'Запросити друзів',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  member: [
    {
      icon: Users,
      title: 'Допоможіть 2 кандидатам стати Членами',
      description: '2 з ваших запрошених самі мають залучити по 2 кандидатів. Активно підтримуйте свою мережу, щоб досягти рівня «Почесного Члена».',
      cta: 'Мої реферали',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  honorary_member: [
    {
      icon: Users,
      title: '8 особистих та 49 загальних рефералів',
      description: 'Залучіть 8 особистих рефералів та забезпечте зростання загальної мережі до 49 учасників — для рівня «Лідера Ордену».',
      cta: 'Переглянути рефералів',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  network_leader: [
    {
      icon: Users,
      title: '6 рефералів-Лідерів та 400 загальних',
      description: 'Допоможіть 6 з ваших учасників досягти рівня «Лідер Ордену», а загальній мережі — зрости до 400 осіб.',
      cta: 'Переглянути рефералів',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  regional_leader: [
    {
      icon: Users,
      title: '4 рефералів-Регіональних лідерів та 4 000 загальних',
      description: 'Допоможіть 4 учасникам досягти рівня «Регіонального лідера», а загальній мережі — зрости до 4 000 осіб.',
      cta: 'Переглянути рефералів',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  national_leader: [
    {
      icon: Users,
      title: '2 рефералів-Національних лідерів та 25 000 загальних',
      description: 'Допоможіть 2 учасникам досягти рівня «Національного лідера», а загальній мережі — зрости до 25 000 осіб.',
      cta: 'Переглянути рефералів',
      ctaUrl: '/dashboard/referrals',
    },
  ],
  network_guide: [],
};

export default function ProgressionPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async (tierId: string) => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Помилка створення платежу');

      if (json.hutkoToken) {
        router.push(`/pay?token=${json.hutkoToken}&orderId=${encodeURIComponent(json.orderId)}&tier=${tierId}`);
      } else {
        // payLater — show feedback in place
        setPaymentError('Платіжну систему не налаштовано. Ваш запит зареєстровано — реквізити надійдуть на пошту.');
      }
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Помилка оплати');
    } finally {
      setPaymentLoading(false);
    }
  };

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
          <div className="h-32 bg-panel-850/10 rounded" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-panel-850/10 rounded" />
              <div className="h-40 bg-panel-850/10 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-60 bg-panel-850/10 rounded" />
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
          <Trophy className="w-16 h-16 text-bronze flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-syne text-4xl font-bold text-text-100">
                Ваш шлях в Ордені
              </h1>
              <HelpTooltip pageSlug="dashboard-progression" elementId="role-journey" position="right" />
            </div>
            <p className="font-mono text-lg text-text-100/80">
              Відстежуйте свій прогрес та досягнення
            </p>
          </div>
        </div>

        {/* Current Role Badge */}
        {(() => {
          // Compute next role locally as fallback when API progress is null
          const rolesArray = Object.values(MEMBERSHIP_ROLES).sort((a, b) => a.level - b.level);
          const currentIdx = rolesArray.findIndex(r => r.key === data.currentRole.role);
          const nextRoleInfo = currentIdx >= 0 && currentIdx < rolesArray.length - 1
            ? rolesArray[currentIdx + 1]
            : null;
          const progress = data.progress ?? (nextRoleInfo ? {
            nextRole: nextRoleInfo.key,
            nextRoleLevel: nextRoleInfo.level,
            nextRoleLabel: nextRoleInfo.label,
            progressPercent: 0,
            isEligible: false,
          } : null);

          return (
            <div className="border-2 border-bronze bg-bronze/5 card-with-joints p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-syne text-3xl font-bold text-bronze">
                      {data.currentRole.displayName}
                    </span>
                    <span className="font-mono text-sm text-text-100/60">
                      Рівень {data.currentRole.level}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-text-100/80">
                    {data.currentRole.description}
                  </p>
                </div>

                {progress?.nextRole && (
                  <div className="min-w-[200px]">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-mono text-xs text-text-100/60">
                        До: {progress.nextRoleLabel}
                      </span>
                      <span className="font-mono text-sm font-semibold text-text-100">
                        {progress.progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 bg-panel-850/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bronze rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(2, progress.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) - Next Steps + Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next Steps — always shown, derived from MEMBERSHIP_ROLES */}
          {(() => {
            const steps = NEXT_STEPS[data.currentRole.role] ?? [];
            if (steps.length === 0) return null;
            return (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-text-100" />
                  <h2 className="font-syne text-2xl font-bold text-text-100">
                    Що потрібно зробити
                  </h2>
                  <HelpTooltip pageSlug="dashboard-progression" elementId="current-tasks" position="right" />
                </div>
                <div className="space-y-4">
                  {paymentError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {paymentError}
                    </div>
                  )}
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isPaymentAction = step.ctaUrl.startsWith('payment:');
                    const tierId = isPaymentAction ? step.ctaUrl.replace('payment:', '') : null;
                    return (
                      <div key={i} className="border-2 border-bronze/40 bg-bronze/5 card-with-joints p-6 flex flex-col sm:flex-row items-start gap-5">
                        <div className="flex-shrink-0 w-12 h-12 bg-bronze/10 border border-bronze/30 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-bronze" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-syne text-xl font-bold text-text-100 mb-2">{step.title}</h3>
                          <p className="font-mono text-sm text-text-100/80 mb-4">{step.description}</p>
                          {isPaymentAction ? (
                            <button
                              onClick={() => handlePayment(tierId!)}
                              disabled={paymentLoading}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bronze text-canvas font-mono text-sm font-semibold border-2 border-bronze hover:bg-panel-850 hover:border-line transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {paymentLoading ? 'ЗАВАНТАЖЕННЯ...' : step.cta}
                              {!paymentLoading && <ArrowRight className="w-4 h-4" />}
                            </button>
                          ) : (
                            <Link
                              href={step.ctaUrl}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bronze text-canvas font-mono text-sm font-semibold border-2 border-bronze hover:bg-panel-850 hover:border-line transition-all duration-200"
                            >
                              {step.cta}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* Current Tasks — only shown when backend tasks exist */}
          {data.incompleteTasks.length > 0 && (
            <section id="current-tasks">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-text-100" />
                <h2 className="font-syne text-2xl font-bold text-text-100">
                  Поточні завдання
                </h2>
              </div>
              <div className="space-y-4">
                {data.incompleteTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

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
            <section className="border border-line rounded-lg bg-panel-900 card-with-joints p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-text-100" />
                <h3 className="font-syne text-lg font-bold text-text-100">
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
                      border border-line/20 bg-panel-850/5
                      hover:bg-panel-850/10
                      transition-colors
                    "
                  >
                    <Trophy className="w-5 h-5 text-bronze flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm font-semibold text-text-100 truncate">
                        {achievement.title}
                      </div>
                      <div className="font-mono text-xs text-text-100/60">
                        {new Date(achievement.earnedAt).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Next Level Privileges */}
          {(() => {
            const rolesArray = Object.values(MEMBERSHIP_ROLES).sort((a, b) => a.level - b.level);
            const currentIdx = rolesArray.findIndex(r => r.key === data.currentRole.role);
            const nextRoleInfo = currentIdx >= 0 && currentIdx < rolesArray.length - 1
              ? rolesArray[currentIdx + 1]
              : null;
            if (!nextRoleInfo) return null;

            const currentPrivs = new Set(rolesArray[currentIdx]?.privileges ?? []);
            const newPrivs = (nextRoleInfo.privileges as readonly string[]).filter(p => !currentPrivs.has(p as never));

            return (
              <section className="border border-line rounded-lg bg-panel-900 card-with-joints p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-bronze" />
                  <h3 className="font-syne text-lg font-bold text-text-100">
                    Наступний рівень
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="font-syne text-2xl font-bold text-bronze mb-1">
                    {nextRoleInfo.label}
                  </div>
                  <div className="font-mono text-xs text-text-100/60">
                    Рівень {nextRoleInfo.level}
                  </div>
                </div>

                {newPrivs.length > 0 && (
                  <>
                    <h4 className="font-mono text-sm font-semibold text-text-100 mb-3">
                      Нові можливості:
                    </h4>
                    <ul className="space-y-2">
                      {newPrivs.map((priv) => (
                        <li key={priv} className="flex items-start gap-2 font-mono text-sm text-text-100/80">
                          <Star className="w-4 h-4 text-bronze flex-shrink-0 mt-0.5" />
                          {PRIVILEGE_LABELS[priv] || priv}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            );
          })()}
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
