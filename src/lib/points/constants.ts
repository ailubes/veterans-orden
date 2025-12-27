// Points conversion rate: 1 point = 0.1 UAH
export const POINTS_TO_UAH_RATE = 0.1;

// Calculate UAH value from points
export function pointsToUAH(points: number): number {
  return points * POINTS_TO_UAH_RATE;
}

// Calculate points needed for UAH amount
export function uahToPoints(uah: number): number {
  return Math.ceil(uah / POINTS_TO_UAH_RATE);
}

// Default points values (can be overridden by organization_settings)
export const DEFAULT_POINTS = {
  TASK_COMPLETION: 20,
  EVENT_ATTENDANCE: 10,
  VOTE_CAST: 5,
  REFERRAL_SUCCESS: 50,
  CHALLENGE_WIN: 100,
  DAILY_LOGIN: 1,
  WEEK_STREAK: 5,
  MONTH_STREAK: 25,
  POST_CREATE: 5,
  COMMENT_CREATE: 2,
  SOCIAL_SHARE: 3,
} as const;

// User levels
export const USER_LEVELS = [
  { level: 1, name: 'Новачок', nameEn: 'Novice', minPoints: 0 },
  { level: 2, name: 'Активіст', nameEn: 'Activist', minPoints: 100 },
  { level: 3, name: 'Лідер', nameEn: 'Leader', minPoints: 500 },
  { level: 4, name: 'Експерт', nameEn: 'Expert', minPoints: 1000 },
  { level: 5, name: 'Легенда', nameEn: 'Legend', minPoints: 5000 },
] as const;

// Calculate user level from points
export function getUserLevel(points: number): typeof USER_LEVELS[number] {
  for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
    if (points >= USER_LEVELS[i].minPoints) {
      return USER_LEVELS[i];
    }
  }
  return USER_LEVELS[0];
}

// Calculate points needed for next level
export function getPointsToNextLevel(currentPoints: number): number | null {
  const currentLevel = getUserLevel(currentPoints);
  const currentLevelIndex = USER_LEVELS.findIndex(l => l.level === currentLevel.level);

  if (currentLevelIndex === USER_LEVELS.length - 1) {
    return null; // Already at max level
  }

  const nextLevel = USER_LEVELS[currentLevelIndex + 1];
  return nextLevel.minPoints - currentPoints;
}

// Login streak bonuses
export const STREAK_BONUSES: Record<number, number> = {
  1: 1,   // Daily login
  7: 5,   // Week streak bonus
  14: 10, // Two week streak bonus
  30: 25, // Month streak bonus
};

// Get streak bonus for a given streak length
export function getStreakBonus(streakDays: number): number {
  const bonuses = Object.entries(STREAK_BONUSES)
    .map(([days, points]) => ({ days: parseInt(days), points }))
    .filter(b => streakDays >= b.days)
    .sort((a, b) => b.days - a.days);

  return bonuses[0]?.points || 0;
}

// Transaction type labels
export const TRANSACTION_TYPE_LABELS: Record<string, { uk: string; en: string }> = {
  earn_task: { uk: 'Виконання завдання', en: 'Task completion' },
  earn_event: { uk: 'Відвідування події', en: 'Event attendance' },
  earn_vote: { uk: 'Участь у голосуванні', en: 'Vote cast' },
  earn_referral: { uk: 'Запрошення члена', en: 'Referral' },
  earn_daily_login: { uk: 'Щоденний вхід', en: 'Daily login' },
  earn_content: { uk: 'Створення контенту', en: 'Content creation' },
  earn_challenge: { uk: 'Виграш челенджу', en: 'Challenge win' },
  earn_admin: { uk: 'Адмін нарахування', en: 'Admin adjustment' },
  spend_marketplace: { uk: 'Покупка в магазині', en: 'Marketplace purchase' },
  spend_event: { uk: 'Оплата події', en: 'Event payment' },
  spend_admin: { uk: 'Адмін коригування', en: 'Admin adjustment' },
  expire_annual: { uk: 'Згорання балів', en: 'Points expired' },
  refund: { uk: 'Повернення балів', en: 'Refund' },
};

// Expiration warning thresholds (days before expiration)
export const EXPIRATION_WARNING_DAYS = {
  URGENT: 7,
  SOON: 30,
};
