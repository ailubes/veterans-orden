/**
 * Challenge Progress Tracker
 * Auto-tracking hooks to be called from various user actions
 */

import { createClient } from '@/lib/supabase/server';
import type { ChallengeGoalType } from './types';
import { updateProgress, checkAndCompleteChallenge } from './challenge-service';

/**
 * Update progress for all active challenges tracking the specified goal type
 * This is the core function that gets called from integration hooks
 */
export async function updateChallengeProgressForUser(
  userId: string,
  goalType: ChallengeGoalType,
  increment: number = 1
): Promise<string[]> {
  const supabase = await createClient();

  // Find all active challenges for this goal type that the user has joined
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select(`
      id,
      challenge_id,
      progress,
      completed_at,
      challenges:challenge_id (
        id,
        goal_type,
        goal_target,
        status
      )
    `)
    .eq('user_id', userId)
    .is('completed_at', null);

  if (!participations) {
    return [];
  }

  const completedChallengeIds: string[] = [];

  for (const participation of participations) {
    const challenge = participation.challenges as unknown as {
      id: string;
      goal_type: string;
      goal_target: number;
      status: string;
    };

    // Skip if challenge doesn't match or isn't active
    if (!challenge || challenge.goal_type !== goalType || challenge.status !== 'active') {
      continue;
    }

    // Update progress
    await updateProgress(challenge.id, userId, increment);

    // Check if challenge is completed
    const result = await checkAndCompleteChallenge(challenge.id, userId);
    if (result?.completed) {
      completedChallengeIds.push(challenge.id);
    }
  }

  return completedChallengeIds;
}

/**
 * Check if user has any active challenges for completion
 * Returns list of challenge IDs that were completed
 */
export async function checkUserChallengeCompletions(userId: string): Promise<string[]> {
  const supabase = await createClient();

  // Get all active participations
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select(`
      challenge_id,
      progress,
      challenges:challenge_id (
        goal_target,
        status
      )
    `)
    .eq('user_id', userId)
    .is('completed_at', null);

  if (!participations) {
    return [];
  }

  const completedChallengeIds: string[] = [];

  for (const participation of participations) {
    const challenge = participation.challenges as unknown as {
      goal_target: number;
      status: string;
    };

    if (!challenge || challenge.status !== 'active') {
      continue;
    }

    // Check if already at target
    if (participation.progress >= challenge.goal_target) {
      const result = await checkAndCompleteChallenge(participation.challenge_id, userId);
      if (result?.completed) {
        completedChallengeIds.push(participation.challenge_id);
      }
    }
  }

  return completedChallengeIds;
}

// ----- INTEGRATION HOOKS -----
// These functions should be called from their respective action handlers

/**
 * Hook to be called after task completion
 * Call this from: src/app/api/tasks/[id]/complete/route.ts
 */
export async function onTaskCompleted(userId: string, taskId: string): Promise<void> {
  try {
    await updateChallengeProgressForUser(userId, 'tasks', 1);
  } catch (error) {
    // Log but don't fail the main operation
    console.error('Failed to update challenge progress for task:', error);
  }
}

/**
 * Hook to be called after event attendance is recorded
 * Call this from: src/app/api/admin/events/[id]/attendance/route.ts
 */
export async function onEventAttended(userId: string, eventId: string): Promise<void> {
  try {
    await updateChallengeProgressForUser(userId, 'events', 1);
  } catch (error) {
    console.error('Failed to update challenge progress for event:', error);
  }
}

/**
 * Hook to be called after vote is cast
 * Call this from: src/app/api/votes/[id]/cast/route.ts
 */
export async function onVoteCast(userId: string, voteId: string): Promise<void> {
  try {
    await updateChallengeProgressForUser(userId, 'votes', 1);
  } catch (error) {
    console.error('Failed to update challenge progress for vote:', error);
  }
}

/**
 * Hook to be called after successful referral
 * Call this from: src/app/(auth)/onboarding/page.tsx (server action)
 */
export async function onReferralCompleted(referrerId: string, referredUserId: string): Promise<void> {
  try {
    await updateChallengeProgressForUser(referrerId, 'referrals', 1);
  } catch (error) {
    console.error('Failed to update challenge progress for referral:', error);
  }
}

/**
 * Hook to be called after points are earned
 * Call this from: src/lib/points/points-service.ts awardPoints function
 * Note: Only for 'points' goal type challenges
 */
export async function onPointsEarned(userId: string, amount: number): Promise<void> {
  try {
    // For points-based challenges, we increment by the amount earned
    await updateChallengeProgressForUser(userId, 'points', amount);
  } catch (error) {
    console.error('Failed to update challenge progress for points:', error);
  }
}

// ----- AUTO-JOIN HELPERS -----

/**
 * Auto-join user to all active challenges they're eligible for
 * Can be called when user logs in or visits challenges page
 */
export async function autoJoinEligibleChallenges(userId: string): Promise<string[]> {
  const supabase = await createClient();

  // Get active challenges user hasn't joined
  const { data: activeChallenges } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active');

  if (!activeChallenges) {
    return [];
  }

  // Get challenges user has already joined
  const { data: existingParticipations } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .eq('user_id', userId);

  const joinedChallengeIds = new Set(existingParticipations?.map(p => p.challenge_id) || []);

  // Find challenges to join
  const challengesToJoin = activeChallenges.filter(c => !joinedChallengeIds.has(c.id));

  // This would auto-join - but typically we want manual join
  // Uncomment if auto-join is desired:
  // for (const challenge of challengesToJoin) {
  //   await joinChallenge(challenge.id, userId);
  // }

  return challengesToJoin.map(c => c.id);
}

/**
 * Get challenges that are ending soon (for notifications)
 */
export async function getChallengesEndingSoon(hoursThreshold: number = 24): Promise<string[]> {
  const supabase = await createClient();

  const now = new Date();
  const threshold = new Date(now.getTime() + hoursThreshold * 60 * 60 * 1000);

  const { data: challenges } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .lte('end_date', threshold.toISOString())
    .gt('end_date', now.toISOString());

  return challenges?.map(c => c.id) || [];
}

/**
 * Process challenges that should be activated (start_date has passed)
 */
export async function activateScheduledChallenges(): Promise<number> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: toActivate } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'upcoming')
    .lte('start_date', now);

  if (!toActivate || toActivate.length === 0) {
    return 0;
  }

  await supabase
    .from('challenges')
    .update({ status: 'active', updated_at: now })
    .eq('status', 'upcoming')
    .lte('start_date', now);

  return toActivate.length;
}

/**
 * Process challenges that should be completed (end_date has passed)
 */
export async function completeEndedChallenges(): Promise<number> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data: toComplete } = await supabase
    .from('challenges')
    .select('id')
    .eq('status', 'active')
    .lte('end_date', now);

  if (!toComplete || toComplete.length === 0) {
    return 0;
  }

  // Import completeChallenge to properly award rewards
  const { completeChallenge } = await import('./challenge-service');

  let completed = 0;
  for (const challenge of toComplete) {
    try {
      await completeChallenge(challenge.id);
      completed++;
    } catch (error) {
      console.error(`Failed to complete challenge ${challenge.id}:`, error);
    }
  }

  return completed;
}
