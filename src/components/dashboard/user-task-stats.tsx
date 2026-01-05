'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Clock, Star, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface UserStats {
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    pendingReview: number;
  };
  pointsStats: {
    total: number;
    fromTasks: number;
  };
  activity: {
    completedThisWeek: number;
    completedThisMonth: number;
    recentCompleted: Array<{
      id: string;
      title: string;
      points: number;
      completedAt: string;
    }>;
  };
  rank: {
    position: number;
    totalParticipants: number;
    percentile: number;
  };
}

export function UserTaskStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/me/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-panel-900 border border-line p-6 rounded-lg animate-pulse">
        <div className="h-6 bg-panel-850 w-1/3 mb-4 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-panel-850 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-panel-900 border border-line p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="mono text-bronze text-xs tracking-widest mb-1">// МОЯ СТАТИСТИКА</p>
          <h2 className="font-syne text-xl font-bold text-text-100">Прогрес у завданнях</h2>
        </div>
        <Link
          href="/dashboard/tasks"
          className="text-sm text-bronze hover:text-text-100 flex items-center gap-1 transition-colors"
        >
          Всі завдання
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-panel-850 border border-line p-4 text-center rounded">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <CheckSquare className="text-green-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold text-text-100">{stats.taskStats.completed}</p>
          <p className="text-xs text-muted-500">Виконано</p>
        </div>

        <div className="bg-panel-850 border border-line p-4 text-center rounded">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
            <Clock className="text-yellow-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold text-text-100">{stats.taskStats.inProgress}</p>
          <p className="text-xs text-muted-500">В роботі</p>
        </div>

        <div className="bg-panel-850 border border-line p-4 text-center rounded">
          <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-2">
            <Star className="text-bronze" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold text-text-100">{stats.pointsStats.total}</p>
          <p className="text-xs text-muted-500">Балів</p>
        </div>

        <div className="bg-panel-850 border border-line p-4 text-center rounded">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="text-purple-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold text-text-100">#{stats.rank.position}</p>
          <p className="text-xs text-muted-500">Рейтинг</p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-line">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm text-text-200">
              <strong className="text-text-100">{stats.activity.completedThisWeek}</strong> за тиждень
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-bronze" />
            <span className="text-sm text-text-200">
              <strong className="text-text-100">{stats.activity.completedThisMonth}</strong> за місяць
            </span>
          </div>
        </div>

        {stats.rank.totalParticipants > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-500">
              Топ {stats.rank.percentile}% з {stats.rank.totalParticipants} учасників
            </p>
          </div>
        )}
      </div>

      {/* Recent Completed */}
      {stats.activity.recentCompleted.length > 0 && (
        <div className="mt-6 pt-4 border-t border-line">
          <p className="text-xs text-muted-500 mb-3">ОСТАННІ ВИКОНАНІ</p>
          <div className="space-y-2">
            {stats.activity.recentCompleted.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <span className="text-sm text-text-200 truncate flex-1 mr-4">{task.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-bronze font-bold">+{task.points}</span>
                  <span className="text-xs text-muted-500">
                    {formatDateShort(task.completedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
