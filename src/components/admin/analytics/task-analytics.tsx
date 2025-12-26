'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Clock, Star, Trophy, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

interface TaskAnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgCompletionTimeHours: number;
  };
  statusCounts: {
    open: number;
    in_progress: number;
    pending_review: number;
    completed: number;
    cancelled: number;
  };
  typeCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  submissionStats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  pointsStats: {
    totalAwarded: number;
    totalPossible: number;
    awardRate: number;
  };
  dailyTrend: Array<{ date: string; count: number }>;
  topPerformers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    completedCount: number;
  }>;
}

const typeLabels: Record<string, string> = {
  recruitment: 'Рекрутинг',
  outreach: 'Охоплення',
  event_support: 'Підтримка подій',
  content: 'Контент',
  administrative: 'Адміністративне',
  other: 'Інше',
};

const priorityLabels: Record<string, string> = {
  urgent: 'Терміново',
  high: 'Високий',
  medium: 'Середній',
  low: 'Низький',
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

export function TaskAnalytics() {
  const [data, setData] = useState<TaskAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics/tasks');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Помилка завантаження даних');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-timber-dark/10 w-1/3" />
          <div className="h-40 bg-timber-dark/10" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative text-center">
        <p className="text-red-600">{error || 'Немає даних'}</p>
      </div>
    );
  }

  // Calculate max for chart scaling
  const maxDailyCount = Math.max(...data.dailyTrend.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Task Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-canvas border-2 border-timber-dark p-3 sm:p-4 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="text-accent" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-timber-beam truncate">ВИКОНАНО</p>
              <p className="font-syne text-xl sm:text-2xl font-bold">{data.overview.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-3 sm:p-4 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-timber-beam truncate">КОНВЕРСІЯ</p>
              <p className="font-syne text-xl sm:text-2xl font-bold">{data.overview.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-3 sm:p-4 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Star className="text-yellow-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-timber-beam truncate">БАЛІВ</p>
              <p className="font-syne text-xl sm:text-2xl font-bold">{data.pointsStats.totalAwarded.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-canvas border-2 border-timber-dark p-3 sm:p-4 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="text-purple-500" size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-timber-beam truncate">СЕР. ЧАС</p>
              <p className="font-syne text-xl sm:text-2xl font-bold">{data.overview.avgCompletionTimeHours}г</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-canvas border-2 border-timber-dark p-4 sm:p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <h3 className="font-syne text-base sm:text-lg font-bold mb-4">Виконання за останні 30 днів</h3>

          <div className="h-32 sm:h-40 flex items-end gap-px sm:gap-1">
            {data.dailyTrend.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 bg-accent/20 hover:bg-accent/40 transition-colors relative group"
                style={{
                  height: `${(day.count / maxDailyCount) * 100}%`,
                  minHeight: day.count > 0 ? '4px' : '0',
                }}
              >
                {day.count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-timber-dark text-canvas text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.count} завд.
                    <br />
                    {new Date(day.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-xs text-timber-beam">
            <span>30 днів тому</span>
            <span>Сьогодні</span>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-canvas border-2 border-timber-dark p-4 sm:p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-syne text-base sm:text-lg font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" size={18} />
              Топ виконавці
            </h3>
            <Link href="/admin/members" className="text-xs text-accent hover:underline">
              Всі →
            </Link>
          </div>

          {data.topPerformers.length > 0 ? (
            <div className="space-y-3">
              {data.topPerformers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-timber-dark/10 text-timber-beam'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-timber-dark/10 overflow-hidden flex items-center justify-center">
                    {performer.avatarUrl ? (
                      <img src={performer.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={16} className="text-timber-beam" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {performer.firstName} {performer.lastName}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-accent">
                    {performer.completedCount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-timber-beam text-center py-4">
              Немає даних про виконавців
            </p>
          )}
        </div>
      </div>

      {/* Status and Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-canvas border-2 border-timber-dark p-4 sm:p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />

          <h3 className="font-syne text-base sm:text-lg font-bold mb-4">Розподіл за статусом</h3>

          <div className="space-y-3">
            {[
              { key: 'open', label: 'Відкрито', color: 'bg-blue-500' },
              { key: 'in_progress', label: 'В роботі', color: 'bg-yellow-500' },
              { key: 'pending_review', label: 'На перевірці', color: 'bg-purple-500' },
              { key: 'completed', label: 'Виконано', color: 'bg-green-500' },
              { key: 'cancelled', label: 'Скасовано', color: 'bg-red-500' },
            ].map(status => {
              const count = data.statusCounts[status.key as keyof typeof data.statusCounts] || 0;
              const percentage = data.overview.totalTasks > 0
                ? (count / data.overview.totalTasks) * 100
                : 0;
              return (
                <div key={status.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{status.label}</span>
                    <span className="font-mono text-sm font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-timber-dark/10">
                    <div
                      className={`h-full ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-canvas border-2 border-timber-dark p-4 sm:p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />

          <h3 className="font-syne text-base sm:text-lg font-bold mb-4">Розподіл за пріоритетом</h3>

          <div className="space-y-3">
            {['urgent', 'high', 'medium', 'low'].map(priority => {
              const count = data.priorityCounts[priority] || 0;
              const percentage = data.overview.totalTasks > 0
                ? (count / data.overview.totalTasks) * 100
                : 0;
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{priorityLabels[priority]}</span>
                    <span className="font-mono text-sm font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-timber-dark/10">
                    <div
                      className={`h-full ${priorityColors[priority]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submissions Stats */}
      <div className="bg-timber-dark text-canvas p-4 sm:p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="font-syne text-base sm:text-lg font-bold">Статистика підтверджень</h3>
          <Link
            href="/admin/tasks/submissions"
            className="text-sm text-accent hover:underline"
          >
            Перевірити →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <p className="text-xs opacity-60">ВСЬОГО</p>
            <p className="font-syne text-xl sm:text-2xl font-bold">{data.submissionStats.total}</p>
          </div>
          <div>
            <p className="text-xs opacity-60">ОЧІКУЮТЬ</p>
            <p className="font-syne text-xl sm:text-2xl font-bold text-yellow-400">
              {data.submissionStats.pending}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-60">ПІДТВЕРДЖЕНО</p>
            <p className="font-syne text-xl sm:text-2xl font-bold text-green-400">
              {data.submissionStats.approved}
            </p>
          </div>
          <div>
            <p className="text-xs opacity-60">ВІДХИЛЕНО</p>
            <p className="font-syne text-xl sm:text-2xl font-bold text-red-400">
              {data.submissionStats.rejected}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
