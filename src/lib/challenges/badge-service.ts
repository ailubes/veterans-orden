/**
 * Badge Service
 * Manages badges/achievements for users
 */

import { createClient } from '@/lib/supabase/server';
import type { Badge, UserBadge, BadgeRarity, BadgeCategory } from './types';

// ----- BADGE MANAGEMENT -----

/**
 * Award a badge to a user
 * Throws if user already has the badge
 */
export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  const supabase = await createClient();

  // Check if badge exists
  const { data: badge } = await supabase
    .from('badges')
    .select('id')
    .eq('id', badgeId)
    .single();

  if (!badge) {
    throw new Error(`Badge not found: ${badgeId}`);
  }

  // Check if user already has this badge
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', badgeId)
    .single();

  if (existing) {
    throw new Error('User already has this badge');
  }

  // Award the badge
  const { error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: badgeId,
    });

  if (error) {
    throw new Error(`Failed to award badge: ${error.message}`);
  }
}

/**
 * Check if a user has a specific badge
 */
export async function hasBadge(userId: string, badgeId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', badgeId)
    .single();

  return !!data;
}

/**
 * Get all badges earned by a user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = await createClient();

  // Get user achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('id, achievement_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (!achievements || achievements.length === 0) {
    return [];
  }

  // Get badge details
  const badgeIds = achievements.map(a => a.achievement_id);
  const { data: badges } = await supabase
    .from('badges')
    .select('*')
    .in('id', badgeIds);

  const badgeMap: Record<string, Badge> = {};
  badges?.forEach(b => {
    badgeMap[b.id] = mapBadgeFromDb(b);
  });

  return achievements.map(a => ({
    id: a.id,
    badgeId: a.achievement_id,
    userId,
    earnedAt: a.earned_at,
    badge: badgeMap[a.achievement_id],
  })).filter(ub => ub.badge); // Only return badges that exist
}

/**
 * Get a specific badge by ID
 */
export async function getBadge(badgeId: string): Promise<Badge | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('badges')
    .select('*')
    .eq('id', badgeId)
    .single();

  if (!data) {
    return null;
  }

  return mapBadgeFromDb(data);
}

/**
 * List all badges, optionally filtered by category
 */
export async function listBadges(category?: BadgeCategory): Promise<Badge[]> {
  const supabase = await createClient();

  let query = supabase.from('badges').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  const { data } = await query.order('rarity', { ascending: false });

  if (!data) {
    return [];
  }

  return data.map(mapBadgeFromDb);
}

/**
 * Get user's badge count by category
 */
export async function getUserBadgeCount(userId: string): Promise<{ total: number; byCategory: Record<string, number> }> {
  const supabase = await createClient();

  const badges = await getUserBadges(userId);

  const byCategory: Record<string, number> = {};
  badges.forEach(ub => {
    const category = ub.badge?.category || 'unknown';
    byCategory[category] = (byCategory[category] || 0) + 1;
  });

  return {
    total: badges.length,
    byCategory,
  };
}

/**
 * Get user's badge progress for a specific badge type
 * Returns how close they are to earning it
 */
export async function getBadgeProgress(
  userId: string,
  badgeId: string
): Promise<{ earned: boolean; progress: number; target: number }> {
  const supabase = await createClient();

  // Check if already earned
  const earned = await hasBadge(userId, badgeId);
  if (earned) {
    return { earned: true, progress: 100, target: 100 };
  }

  // Calculate progress based on badge type
  // This is a simplified version - real implementation would vary by badge
  switch (badgeId) {
    case 'referral_star': {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by_id', userId);
      return { earned: false, progress: count || 0, target: 10 };
    }

    case 'task_titan': {
      const { count } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');
      return { earned: false, progress: count || 0, target: 50 };
    }

    case 'event_enthusiast': {
      const { count } = await supabase
        .from('event_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('attended', true);
      return { earned: false, progress: count || 0, target: 10 };
    }

    case 'voting_voice': {
      const { count } = await supabase
        .from('user_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return { earned: false, progress: count || 0, target: 20 };
    }

    case 'challenge_streak_3': {
      const { count } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      return { earned: false, progress: count || 0, target: 3 };
    }

    case 'challenge_streak_5': {
      const { count } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      return { earned: false, progress: count || 0, target: 5 };
    }

    default:
      return { earned: false, progress: 0, target: 1 };
  }
}

// ----- HELPER FUNCTIONS -----

function mapBadgeFromDb(data: Record<string, unknown>): Badge {
  return {
    id: data.id as string,
    nameUk: data.name_uk as string,
    nameEn: data.name_en as string,
    descriptionUk: data.description_uk as string | null,
    descriptionEn: data.description_en as string | null,
    iconUrl: data.icon_url as string | null,
    category: data.category as BadgeCategory,
    rarity: data.rarity as BadgeRarity,
    createdAt: data.created_at as string,
  };
}
