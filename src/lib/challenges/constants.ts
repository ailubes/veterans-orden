/**
 * Challenges System Constants
 * Labels, defaults, and configuration for the challenges feature
 */

import type { ChallengeType, ChallengeGoalType, ChallengeStatus, BadgeRarity } from './types';

// ----- DURATION DEFAULTS -----

export const CHALLENGE_DURATION = {
  WEEKLY_DAYS: 7,
  MONTHLY_DAYS: 30,
  SPECIAL_DEFAULT_DAYS: 14,
} as const;

// ----- REWARD DEFAULTS -----

export const CHALLENGE_REWARDS = {
  DEFAULT_POINTS: 100,
  WEEKLY_POINTS: 50,
  MONTHLY_POINTS: 150,
  SPECIAL_POINTS: 200,
  COMPETITIVE_BONUS_MULTIPLIER: 1.5, // Winner gets 1.5x points
  COMPETITIVE_DEFAULT_WINNERS: 3,
  REFERRAL_BONUS_MULTIPLIER: 2, // Referral challenges give 2x points
} as const;

// ----- GOAL TARGETS -----

export const DEFAULT_GOAL_TARGETS: Record<ChallengeGoalType, number> = {
  referrals: 5,
  tasks: 10,
  events: 3,
  votes: 5,
  points: 100,
};

// ----- LOCALIZED LABELS -----

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, { uk: string; en: string }> = {
  weekly: { uk: 'Тижневий', en: 'Weekly' },
  monthly: { uk: 'Місячний', en: 'Monthly' },
  special: { uk: 'Спеціальний', en: 'Special' },
};

export const CHALLENGE_GOAL_TYPE_LABELS: Record<ChallengeGoalType, { uk: string; en: string; icon: string }> = {
  referrals: { uk: 'Запрошення', en: 'Referrals', icon: 'Users' },
  tasks: { uk: 'Завдання', en: 'Tasks', icon: 'CheckSquare' },
  events: { uk: 'Події', en: 'Events', icon: 'Calendar' },
  votes: { uk: 'Голосування', en: 'Votes', icon: 'Vote' },
  points: { uk: 'Бали', en: 'Points', icon: 'Coins' },
};

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, { uk: string; en: string; color: string }> = {
  upcoming: { uk: 'Очікується', en: 'Upcoming', color: 'blue' },
  active: { uk: 'Активний', en: 'Active', color: 'green' },
  completed: { uk: 'Завершено', en: 'Completed', color: 'gray' },
  cancelled: { uk: 'Скасовано', en: 'Cancelled', color: 'red' },
};

export const BADGE_RARITY_LABELS: Record<BadgeRarity, { uk: string; en: string; color: string }> = {
  common: { uk: 'Звичайний', en: 'Common', color: 'gray' },
  rare: { uk: 'Рідкісний', en: 'Rare', color: 'blue' },
  epic: { uk: 'Епічний', en: 'Epic', color: 'purple' },
  legendary: { uk: 'Легендарний', en: 'Legendary', color: 'orange' },
};

// ----- BADGE IDS -----

export const CHALLENGE_BADGES = {
  // Challenge completion badges
  WEEKLY_WARRIOR: 'weekly_warrior',
  MONTHLY_MASTER: 'monthly_master',
  CHALLENGE_CHAMPION: 'challenge_champion',

  // Goal-specific badges
  REFERRAL_STAR: 'referral_star',
  TASK_TITAN: 'task_titan',
  EVENT_ENTHUSIAST: 'event_enthusiast',
  VOTING_VOICE: 'voting_voice',

  // Streak badges
  FIRST_CHALLENGE: 'first_challenge',
  CHALLENGE_STREAK_3: 'challenge_streak_3',
  CHALLENGE_STREAK_5: 'challenge_streak_5',
} as const;

// ----- NOTIFICATION SETTINGS -----

export const CHALLENGE_NOTIFICATIONS = {
  ENDING_SOON_HOURS: 24, // Send notification 24 hours before end
  PROGRESS_MILESTONES: [50, 75, 90], // Notify at these percentage milestones
} as const;

// ----- UI HELPERS -----

export function getChallengeTypeLabel(type: ChallengeType, locale: 'uk' | 'en' = 'uk'): string {
  return CHALLENGE_TYPE_LABELS[type][locale];
}

export function getGoalTypeLabel(goalType: ChallengeGoalType, locale: 'uk' | 'en' = 'uk'): string {
  return CHALLENGE_GOAL_TYPE_LABELS[goalType][locale];
}

export function getGoalTypeIcon(goalType: ChallengeGoalType): string {
  return CHALLENGE_GOAL_TYPE_LABELS[goalType].icon;
}

export function getStatusLabel(status: ChallengeStatus, locale: 'uk' | 'en' = 'uk'): string {
  return CHALLENGE_STATUS_LABELS[status][locale];
}

export function getStatusColor(status: ChallengeStatus): string {
  return CHALLENGE_STATUS_LABELS[status].color;
}

export function getRarityLabel(rarity: BadgeRarity, locale: 'uk' | 'en' = 'uk'): string {
  return BADGE_RARITY_LABELS[rarity][locale];
}

export function getRarityColor(rarity: BadgeRarity): string {
  return BADGE_RARITY_LABELS[rarity].color;
}

export function formatGoalProgress(current: number, target: number, goalType: ChallengeGoalType, locale: 'uk' | 'en' = 'uk'): string {
  const label = getGoalTypeLabel(goalType, locale).toLowerCase();
  return locale === 'uk'
    ? `${current}/${target} ${label}`
    : `${current}/${target} ${label}`;
}

export function getDefaultPointsForType(type: ChallengeType): number {
  switch (type) {
    case 'weekly': return CHALLENGE_REWARDS.WEEKLY_POINTS;
    case 'monthly': return CHALLENGE_REWARDS.MONTHLY_POINTS;
    case 'special': return CHALLENGE_REWARDS.SPECIAL_POINTS;
    default: return CHALLENGE_REWARDS.DEFAULT_POINTS;
  }
}

export function getDefaultDurationDays(type: ChallengeType): number {
  switch (type) {
    case 'weekly': return CHALLENGE_DURATION.WEEKLY_DAYS;
    case 'monthly': return CHALLENGE_DURATION.MONTHLY_DAYS;
    case 'special': return CHALLENGE_DURATION.SPECIAL_DEFAULT_DAYS;
    default: return CHALLENGE_DURATION.WEEKLY_DAYS;
  }
}
