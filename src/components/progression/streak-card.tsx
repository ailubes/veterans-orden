import { Flame, Award, Calendar } from 'lucide-react';

interface StreakCardProps {
  streak: {
    current: number;
    longest: number;
    totalDays: number;
    nextMilestone: number;
    daysUntilMilestone: number;
  };
}

/**
 * StreakCard component - shows user's activity streak
 * Displays current streak, longest streak, and total active days
 */
export default function StreakCard({ streak }: StreakCardProps) {
  const progressToMilestone = streak.nextMilestone > 0
    ? ((streak.current / streak.nextMilestone) * 100)
    : 0;

  return (
    <div className="border-2 border-timber-dark bg-canvas card-with-joints p-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-accent" />
        <h3 className="font-syne text-xl font-bold text-timber-dark">
          Серія активності
        </h3>
      </div>

      <div className="space-y-6">
        {/* Current Streak */}
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-syne text-4xl font-bold text-accent">
              {streak.current}
            </span>
            <span className="font-mono text-sm text-timber-dark/60">
              {streak.current === 1 ? 'день' : streak.current < 5 ? 'дні' : 'днів'}
            </span>
          </div>
          <p className="font-mono text-sm text-timber-dark/80">
            Поточна серія
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Longest Streak */}
          <div className="border border-timber-dark/20 bg-timber-dark/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-timber-dark/60" />
              <span className="font-mono text-xs text-timber-dark/60">
                Найдовша серія
              </span>
            </div>
            <div className="font-syne text-2xl font-bold text-timber-dark">
              {streak.longest}
            </div>
          </div>

          {/* Total Days */}
          <div className="border border-timber-dark/20 bg-timber-dark/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-timber-dark/60" />
              <span className="font-mono text-xs text-timber-dark/60">
                Всього днів
              </span>
            </div>
            <div className="font-syne text-2xl font-bold text-timber-dark">
              {streak.totalDays}
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-mono text-xs text-timber-dark/60">
              До наступної віхи
            </span>
            <span className="font-mono text-sm font-semibold text-timber-dark">
              {streak.daysUntilMilestone} {
                streak.daysUntilMilestone === 1
                  ? 'день'
                  : streak.daysUntilMilestone < 5
                    ? 'дні'
                    : 'днів'
              }
            </span>
          </div>
          <div className="h-2 bg-timber-dark/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progressToMilestone)}%` }}
            />
          </div>
          <p className="font-mono text-xs text-timber-dark/60 mt-1">
            Мета: {streak.nextMilestone} днів 🔥
          </p>
        </div>

        {/* Encouragement */}
        {streak.current === 0 && (
          <div className="border-l-2 border-accent pl-3">
            <p className="font-mono text-sm text-timber-dark/80">
              Почніть серію активності вже сьогодні!
            </p>
          </div>
        )}

        {streak.current > 0 && streak.current < 7 && (
          <div className="border-l-2 border-accent pl-3">
            <p className="font-mono text-sm text-timber-dark/80">
              Продовжуйте! Серія набирає обертів 💪
            </p>
          </div>
        )}

        {streak.current >= 7 && (
          <div className="border-l-2 border-green-600 pl-3">
            <p className="font-mono text-sm text-green-700">
              Чудова серія! Ви - приклад для наслідування 🌟
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
