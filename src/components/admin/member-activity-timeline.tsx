'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Calendar,
  Vote,
  CheckSquare,
  TrendingUp,
  User,
  Circle,
} from 'lucide-react';
import { ActivityItem } from '@/app/api/admin/members/[id]/activity/route';
import { formatDate, formatTime, formatRelativeTime } from '@/lib/utils';

interface MemberActivityTimelineProps {
  memberId: string;
}

const ACTIVITY_ICONS = {
  event: Calendar,
  vote: Vote,
  task: CheckSquare,
  points: TrendingUp,
  profile: User,
  other: Circle,
};

const ACTIVITY_COLORS = {
  event: 'text-blue-600',
  vote: 'text-purple-600',
  task: 'text-green-600',
  points: 'text-bronze',
  profile: 'text-muted-500',
  other: 'text-gray-500',
};

export function MemberActivityTimeline({ memberId }: MemberActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/members/${memberId}/activity`);

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Не вдалося завантажити активність');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If today, show time
    if (diffDays === 0) {
      return formatTime(dateString);
    }

    // If this week, show relative time
    if (diffDays < 7) {
      return formatRelativeTime(dateString);
    }

    // Otherwise show date
    return formatDate(dateString);
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const groups: Record<string, ActivityItem[]> = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4">АКТИВНІСТЬ ЧЛЕНА</p>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-timber-dark/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-timber-dark/10 w-3/4" />
                <div className="h-3 bg-timber-dark/10 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4">АКТИВНІСТЬ ЧЛЕНА</p>
        <div className="text-center py-8 text-muted-500">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4">АКТИВНІСТЬ ЧЛЕНА</p>
        <div className="text-center py-8 text-muted-500">
          <p className="text-sm">Поки що немає активності</p>
        </div>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <p className="label text-bronze mb-6">АКТИВНІСТЬ ЧЛЕНА</p>

      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-timber-dark/20" />
              <p className="text-xs font-bold text-muted-500 uppercase">{date}</p>
              <div className="h-px flex-1 bg-timber-dark/20" />
            </div>

            {/* Activities for this date */}
            <div className="space-y-4 relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-timber-dark/20" />

              {dateActivities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                const colorClass = ACTIVITY_COLORS[activity.type];

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 relative"
                  >
                    {/* Icon */}
                    <div
                      className={`relative z-10 w-8 h-8 bg-panel-900 border border-line rounded-lg rounded-full flex items-center justify-center ${colorClass}`}
                    >
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold mb-1">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-500 mb-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-500/60">
                            {formatActivityDate(activity.timestamp)}
                          </p>
                        </div>

                        {/* Points badge */}
                        {activity.points !== undefined && activity.points > 0 && (
                          <div className="flex-shrink-0">
                            <span className="px-2 py-1 bg-bronze/10 text-bronze text-xs font-bold border border-bronze/20">
                              +{activity.points}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Show total count */}
      <div className="mt-6 pt-4 border-t border-line/20 text-center">
        <p className="text-xs text-muted-500">
          Показано {activities.length} {activities.length === 1 ? 'активність' : 'активностей'}
        </p>
      </div>
    </div>
  );
}
