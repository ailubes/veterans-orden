'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Clock, Star, Trophy, TrendingUp, ArrowRight } from 'lucide-react';

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
      <div className="bg-canvas border-2 border-timber-dark p-6 relative animate-pulse">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="h-6 bg-timber-dark/10 w-1/3 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-timber-dark/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label text-accent mb-1">МОЯ СТАТИСТИКА</p>
          <h2 className="font-syne text-xl font-bold">Прогрес у завданнях</h2>
        </div>
        <Link
          href="/dashboard/tasks"
          className="text-sm text-accent hover:underline flex items-center gap-1"
        >
          Всі завдання
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-timber-dark/5 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <CheckSquare className="text-green-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold">{stats.taskStats.completed}</p>
          <p className="text-xs text-timber-beam">Виконано</p>
        </div>

        <div className="bg-timber-dark/5 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
            <Clock className="text-yellow-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold">{stats.taskStats.inProgress}</p>
          <p className="text-xs text-timber-beam">В роботі</p>
        </div>

        <div className="bg-timber-dark/5 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <Star className="text-accent" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold">{stats.pointsStats.total}</p>
          <p className="text-xs text-timber-beam">Балів</p>
        </div>

        <div className="bg-timber-dark/5 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
            <Trophy className="text-purple-500" size={20} />
          </div>
          <p className="font-syne text-2xl font-bold">#{stats.rank.position}</p>
          <p className="text-xs text-timber-beam">Рейтинг</p>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-timber-dark/10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm">
              <strong>{stats.activity.completedThisWeek}</strong> за тиждень
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <span className="text-sm">
              <strong>{stats.activity.completedThisMonth}</strong> за місяць
            </span>
          </div>
        </div>

        {stats.rank.totalParticipants > 0 && (
          <div className="text-right">
            <p className="text-xs text-timber-beam">
              Топ {stats.rank.percentile}% з {stats.rank.totalParticipants} учасників
            </p>
          </div>
        )}
      </div>

      {/* Recent Completed */}
      {stats.activity.recentCompleted.length > 0 && (
        <div className="mt-6 pt-4 border-t border-timber-dark/10">
          <p className="text-xs text-timber-beam mb-3">ОСТАННІ ВИКОНАНІ</p>
          <div className="space-y-2">
            {stats.activity.recentCompleted.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <span className="text-sm truncate flex-1 mr-4">{task.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-accent font-bold">+{task.points}</span>
                  <span className="text-xs text-timber-beam">
                    {new Date(task.completedAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                    })}
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
