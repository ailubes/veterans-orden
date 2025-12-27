'use client';

import Image from 'next/image';
import { BADGE_RARITY_LABELS } from '@/lib/challenges';
import type { Badge, BadgeRarity } from '@/lib/challenges';

const rarityColors: Record<BadgeRarity, string> = {
  common: 'border-gray-400 bg-gray-50',
  rare: 'border-blue-500 bg-blue-50',
  epic: 'border-purple-500 bg-purple-50',
  legendary: 'border-orange-500 bg-orange-50',
};

const rarityGlow: Record<BadgeRarity, string> = {
  common: '',
  rare: 'shadow-blue-200',
  epic: 'shadow-purple-200',
  legendary: 'shadow-orange-200 shadow-lg',
};

interface BadgeCardProps {
  badge: Badge;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function BadgeCard({ badge, earnedAt, size = 'md', showDetails = true }: BadgeCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const imageSize = {
    sm: 48,
    md: 64,
    lg: 96,
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${showDetails ? 'p-3' : ''}`}>
      <div
        className={`${sizeClasses[size]} relative rounded-lg border-2 ${rarityColors[badge.rarity]} ${rarityGlow[badge.rarity]} overflow-hidden transition-transform hover:scale-110`}
      >
        {badge.iconUrl ? (
          <Image
            src={badge.iconUrl}
            alt={badge.nameUk}
            width={imageSize[size]}
            height={imageSize[size]}
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🏅
          </div>
        )}
      </div>

      {showDetails && (
        <div className="text-center">
          <p className="font-bold text-sm line-clamp-1">{badge.nameUk}</p>
          <p className={`text-xs font-medium ${
            badge.rarity === 'common' ? 'text-gray-500' :
            badge.rarity === 'rare' ? 'text-blue-600' :
            badge.rarity === 'epic' ? 'text-purple-600' :
            'text-orange-600'
          }`}>
            {BADGE_RARITY_LABELS[badge.rarity].uk}
          </p>
          {earnedAt && (
            <p className="text-xs text-timber-beam mt-1">
              {new Date(earnedAt).toLocaleDateString('uk-UA')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
