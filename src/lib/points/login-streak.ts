import { createClient } from '@/lib/supabase/server';
import { awardPoints } from './points-service';
import { STREAK_BONUSES } from './constants';

interface LoginStreakResult {
  streakDays: number;
  pointsAwarded: number;
  isNewStreak: boolean;
  message: string;
}

/**
 * Process user login and award streak points
 * Should be called once per day per user
 */
export async function processLoginStreak(userId: string): Promise<LoginStreakResult> {
  const supabase = await createClient();
  const now = new Date();

  // Get user's current streak data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('login_streak, last_login_at, first_name')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const lastLoginAt = user.last_login_at ? new Date(user.last_login_at) : null;
  const currentStreak = user.login_streak || 0;

  // Calculate if this is a new day
  const isNewDay = !lastLoginAt || !isSameDay(now, lastLoginAt);

  if (!isNewDay) {
    // Already logged in today - no points awarded
    return {
      streakDays: currentStreak,
      pointsAwarded: 0,
      isNewStreak: false,
      message: 'Ви вже отримали бонус за вхід сьогодні',
    };
  }

  // Check if streak continues or breaks
  let newStreak: number;
  const isConsecutiveDay = lastLoginAt && isYesterday(lastLoginAt, now);

  if (isConsecutiveDay) {
    // Streak continues
    newStreak = currentStreak + 1;
  } else {
    // Streak breaks or starts fresh
    newStreak = 1;
  }

  // Calculate points to award based on streak milestones
  const pointsToAward = getStreakPoints(newStreak);

  // Update user streak data
  await supabase
    .from('users')
    .update({
      login_streak: newStreak,
      last_login_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', userId);

  // Award points
  try {
    await awardPoints({
      userId,
      amount: pointsToAward,
      type: 'earn_daily_login',
      description: getStreakDescription(newStreak),
    });
  } catch (error) {
    console.error('Failed to award login streak points:', error);
    // Continue even if points fail
  }

  return {
    streakDays: newStreak,
    pointsAwarded: pointsToAward,
    isNewStreak: true,
    message: getStreakMessage(newStreak, pointsToAward),
  };
}

/**
 * Get points to award based on streak day
 */
function getStreakPoints(streakDays: number): number {
  // Check for milestone bonuses (defined in constants)
  const milestones = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending

  for (const milestone of milestones) {
    if (streakDays === milestone) {
      return STREAK_BONUSES[milestone];
    }
  }

  // Default daily login points
  return STREAK_BONUSES[1] || 1;
}

/**
 * Get description for points transaction
 */
function getStreakDescription(streakDays: number): string {
  if (streakDays === 1) {
    return 'Щоденний вхід';
  } else if (streakDays === 7) {
    return 'Бонус за тиждень активності!';
  } else if (streakDays === 14) {
    return 'Бонус за 2 тижні активності!';
  } else if (streakDays === 30) {
    return 'Бонус за місяць активності!';
  } else if (streakDays % 30 === 0) {
    return `Бонус за ${streakDays / 30} місяці активності!`;
  }

  return `Серія входів: ${streakDays} днів`;
}

/**
 * Get user-friendly message
 */
function getStreakMessage(streakDays: number, points: number): string {
  if (streakDays === 1) {
    return `Вітаємо! +${points} балів за вхід`;
  } else if (streakDays === 7) {
    return `🎉 Тиждень активності! +${points} балів (серія: ${streakDays} днів)`;
  } else if (streakDays === 14) {
    return `🔥 Два тижні активності! +${points} балів (серія: ${streakDays} днів)`;
  } else if (streakDays === 30) {
    return `⭐ Місяць активності! +${points} балів (серія: ${streakDays} днів)`;
  } else if (streakDays % 30 === 0) {
    return `🏆 ${streakDays} днів активності! +${points} балів`;
  }

  return `✅ Серія: ${streakDays} днів. +${points} балів`;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date1 is yesterday relative to date2
 */
function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);

  return isSameDay(date1, yesterday);
}

/**
 * Get user's current streak info without awarding points
 */
export async function getUserStreak(userId: string): Promise<{
  currentStreak: number;
  lastLogin: string | null;
  nextMilestone: number | null;
  pointsAtNextMilestone: number | null;
}> {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('users')
    .select('login_streak, last_login_at')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const currentStreak = user.login_streak || 0;

  // Find next milestone
  const milestones = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => a - b);

  const nextMilestone = milestones.find((m) => m > currentStreak) || null;
  const pointsAtNextMilestone = nextMilestone ? STREAK_BONUSES[nextMilestone] : null;

  return {
    currentStreak,
    lastLogin: user.last_login_at,
    nextMilestone,
    pointsAtNextMilestone,
  };
}
