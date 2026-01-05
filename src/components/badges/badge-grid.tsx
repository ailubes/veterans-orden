'use client';

import { BadgeCard } from './badge-card';
import type { UserBadge, Badge } from '@/lib/challenges';

interface BadgeGridProps {
  badges: UserBadge[];
  emptyMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeGrid({ badges, emptyMessage = 'Поки немає відзнак', size = 'md' }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-500">
        <p className="text-4xl mb-2">🏅</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {badges.map((userBadge) => (
        <BadgeCard
          key={userBadge.id}
          badge={userBadge.badge}
          earnedAt={userBadge.earnedAt}
          size={size}
        />
      ))}
    </div>
  );
}

interface AllBadgesGridProps {
  allBadges: Badge[];
  earnedBadgeIds: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function AllBadgesGrid({ allBadges, earnedBadgeIds, size = 'md' }: AllBadgesGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {allBadges.map((badge) => {
        const isEarned = earnedBadgeIds.includes(badge.id);

        return (
          <div
            key={badge.id}
            className={`relative ${!isEarned ? 'opacity-40 grayscale' : ''}`}
          >
            <BadgeCard badge={badge} size={size} />
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🔒</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
