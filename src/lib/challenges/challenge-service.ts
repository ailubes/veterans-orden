/**
 * Challenge Service
 * Core business logic for challenges CRUD, participation, and rewards
 */

import { createClient } from '@/lib/supabase/server';
import { awardPoints } from '@/lib/points';
import type {
  Challenge,
  ChallengeParticipant,
  ChallengeWithProgress,
  ChallengeWithDetails,
  ChallengeLeaderboardEntry,
  CreateChallengeParams,
  UpdateChallengeParams,
  ListChallengesOptions,
  JoinChallengeResult,
  ChallengeCompletionResult,
  ChallengeRewardsResult,
  ChallengeStatus,
} from './types';
import { CHALLENGE_BADGES, CHALLENGE_REWARDS } from './constants';
import { awardBadge } from './badge-service';

// ----- CRUD OPERATIONS -----

/**
 * Create a new challenge
 */
export async function createChallenge(params: CreateChallengeParams): Promise<Challenge> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      title: params.title,
      description: params.description || null,
      type: params.type,
      goal_type: params.goalType,
      goal_target: params.goalTarget,
      points: params.points ?? CHALLENGE_REWARDS.DEFAULT_POINTS,
      badge_id: params.badgeId || null,
      is_competitive: params.isCompetitive ?? false,
      max_winners: params.maxWinners ?? CHALLENGE_REWARDS.COMPETITIVE_DEFAULT_WINNERS,
      image_url: params.imageUrl || null,
      start_date: typeof params.startDate === 'string' ? params.startDate : params.startDate.toISOString(),
      end_date: typeof params.endDate === 'string' ? params.endDate : params.endDate.toISOString(),
      status: 'upcoming',
      created_by_id: params.createdById,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create challenge: ${error?.message}`);
  }

  return mapChallengeFromDb(data);
}

/**
 * Update an existing challenge
 */
export async function updateChallenge(id: string, params: UpdateChallengeParams): Promise<Challenge> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.title !== undefined) updateData.title = params.title;
  if (params.description !== undefined) updateData.description = params.description;
  if (params.type !== undefined) updateData.type = params.type;
  if (params.goalType !== undefined) updateData.goal_type = params.goalType;
  if (params.goalTarget !== undefined) updateData.goal_target = params.goalTarget;
  if (params.points !== undefined) updateData.points = params.points;
  if (params.badgeId !== undefined) updateData.badge_id = params.badgeId;
  if (params.isCompetitive !== undefined) updateData.is_competitive = params.isCompetitive;
  if (params.maxWinners !== undefined) updateData.max_winners = params.maxWinners;
  if (params.imageUrl !== undefined) updateData.image_url = params.imageUrl;
  if (params.startDate !== undefined) {
    updateData.start_date = typeof params.startDate === 'string' ? params.startDate : params.startDate.toISOString();
  }
  if (params.endDate !== undefined) {
    updateData.end_date = typeof params.endDate === 'string' ? params.endDate : params.endDate.toISOString();
  }
  if (params.status !== undefined) updateData.status = params.status;

  const { data, error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update challenge: ${error?.message}`);
  }

  return mapChallengeFromDb(data);
}

/**
 * Get a single challenge by ID
 */
export async function getChallenge(id: string): Promise<Challenge | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapChallengeFromDb(data);
}

/**
 * Get challenge with user progress and details
 */
export async function getChallengeWithProgress(
  id: string,
  userId?: string
): Promise<ChallengeWithProgress | null> {
  const supabase = await createClient();

  // Get challenge
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !challenge) {
    return null;
  }

  // Get participant count
  const { count: participantCount } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id);

  // Get user participation if userId provided
  let userProgress = 0;
  let userCompleted = false;
  let userJoined = false;

  if (userId) {
    const { data: participant } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', id)
      .eq('user_id', userId)
      .single();

    if (participant) {
      userJoined = true;
      userProgress = participant.progress || 0;
      userCompleted = !!participant.completed_at;
    }
  }

  const mapped = mapChallengeFromDb(challenge);
  const percentComplete = mapped.goalTarget > 0
    ? Math.min(100, Math.round((userProgress / mapped.goalTarget) * 100))
    : 0;

  return {
    ...mapped,
    userProgress,
    userCompleted,
    userJoined,
    participantCount: participantCount || 0,
    percentComplete,
  };
}

/**
 * List challenges with optional filters
 */
export async function listChallenges(options: ListChallengesOptions = {}): Promise<ChallengeWithProgress[]> {
  const supabase = await createClient();

  let query = supabase.from('challenges').select('*');

  // Filter by status
  if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.in('status', options.status);
    } else {
      query = query.eq('status', options.status);
    }
  }

  // Filter by type
  if (options.type) {
    query = query.eq('type', options.type);
  }

  // Order
  const orderBy = options.orderBy || 'startDate';
  const orderDir = options.orderDir || 'desc';
  const orderColumn = orderBy === 'startDate' ? 'start_date' : orderBy === 'endDate' ? 'end_date' : 'created_at';
  query = query.order(orderColumn, { ascending: orderDir === 'asc' });

  // Pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data: challenges, error } = await query;

  if (error || !challenges) {
    return [];
  }

  // Get participant counts
  const challengeIds = challenges.map(c => c.id);
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  const countMap: Record<string, number> = {};
  participantCounts?.forEach(p => {
    countMap[p.challenge_id] = (countMap[p.challenge_id] || 0) + 1;
  });

  // Get user participation if userId provided
  let userParticipation: Record<string, { progress: number; completedAt: string | null }> = {};
  if (options.userId) {
    const { data: participants } = await supabase
      .from('challenge_participants')
      .select('challenge_id, progress, completed_at')
      .eq('user_id', options.userId)
      .in('challenge_id', challengeIds);

    participants?.forEach(p => {
      userParticipation[p.challenge_id] = {
        progress: p.progress || 0,
        completedAt: p.completed_at,
      };
    });
  }

  return challenges.map(c => {
    const mapped = mapChallengeFromDb(c);
    const participation = userParticipation[c.id];
    const userProgress = participation?.progress || 0;
    const percentComplete = mapped.goalTarget > 0
      ? Math.min(100, Math.round((userProgress / mapped.goalTarget) * 100))
      : 0;

    return {
      ...mapped,
      userProgress,
      userCompleted: !!participation?.completedAt,
      userJoined: !!participation,
      participantCount: countMap[c.id] || 0,
      percentComplete,
    };
  });
}

/**
 * Delete a challenge (only if not started)
 */
export async function deleteChallenge(id: string): Promise<void> {
  const supabase = await createClient();

  const challenge = await getChallenge(id);
  if (!challenge) {
    throw new Error('Challenge not found');
  }

  if (challenge.status === 'active' || challenge.status === 'completed') {
    throw new Error('Cannot delete active or completed challenges');
  }

  // Delete participants first
  await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', id);

  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete challenge: ${error.message}`);
  }
}

// ----- PARTICIPANT MANAGEMENT -----

/**
 * Join a challenge
 */
export async function joinChallenge(challengeId: string, userId: string): Promise<JoinChallengeResult> {
  const supabase = await createClient();

  // Verify challenge exists and is joinable
  const challenge = await getChallenge(challengeId);
  if (!challenge) {
    return { success: false, error: 'Челендж не знайдено' };
  }

  if (challenge.status !== 'active' && challenge.status !== 'upcoming') {
    return { success: false, error: 'Цей челендж вже закінчився' };
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from('challenge_participants')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { success: false, error: 'Ви вже приєднались до цього челенджу' };
  }

  // Create participant record
  const { data: participant, error } = await supabase
    .from('challenge_participants')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      progress: 0,
    })
    .select()
    .single();

  if (error || !participant) {
    return { success: false, error: `Помилка приєднання: ${error?.message}` };
  }

  return {
    success: true,
    participant: mapParticipantFromDb(participant),
  };
}

/**
 * Leave a challenge (only if not completed)
 */
export async function leaveChallenge(challengeId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // Check if participant exists and hasn't completed
  const { data: participant } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    throw new Error('Ви не приєднані до цього челенджу');
  }

  if (participant.completed_at) {
    throw new Error('Не можна вийти з завершеного челенджу');
  }

  const { error } = await supabase
    .from('challenge_participants')
    .delete()
    .eq('challenge_id', challengeId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Помилка виходу: ${error.message}`);
  }
}

/**
 * Get user's active challenges
 */
export async function getUserChallenges(userId: string): Promise<ChallengeWithProgress[]> {
  const supabase = await createClient();

  // Get user's participations
  const { data: participations } = await supabase
    .from('challenge_participants')
    .select('challenge_id, progress, completed_at')
    .eq('user_id', userId);

  if (!participations || participations.length === 0) {
    return [];
  }

  const challengeIds = participations.map(p => p.challenge_id);

  // Get challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .in('id', challengeIds)
    .order('end_date', { ascending: true });

  if (!challenges) {
    return [];
  }

  // Build participation map
  const participationMap: Record<string, { progress: number; completedAt: string | null }> = {};
  participations.forEach(p => {
    participationMap[p.challenge_id] = {
      progress: p.progress || 0,
      completedAt: p.completed_at,
    };
  });

  // Get participant counts
  const { data: participantCounts } = await supabase
    .from('challenge_participants')
    .select('challenge_id')
    .in('challenge_id', challengeIds);

  const countMap: Record<string, number> = {};
  participantCounts?.forEach(p => {
    countMap[p.challenge_id] = (countMap[p.challenge_id] || 0) + 1;
  });

  return challenges.map(c => {
    const mapped = mapChallengeFromDb(c);
    const participation = participationMap[c.id];
    const userProgress = participation?.progress || 0;
    const percentComplete = mapped.goalTarget > 0
      ? Math.min(100, Math.round((userProgress / mapped.goalTarget) * 100))
      : 0;

    return {
      ...mapped,
      userProgress,
      userCompleted: !!participation?.completedAt,
      userJoined: true,
      participantCount: countMap[c.id] || 0,
      percentComplete,
    };
  });
}

// ----- PROGRESS MANAGEMENT -----

/**
 * Update participant progress
 */
export async function updateProgress(
  challengeId: string,
  userId: string,
  increment: number = 1
): Promise<void> {
  const supabase = await createClient();

  // Get current participation
  const { data: participant } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    return; // User not in this challenge
  }

  if (participant.completed_at) {
    return; // Already completed
  }

  const newProgress = (participant.progress || 0) + increment;

  await supabase
    .from('challenge_participants')
    .update({ progress: newProgress })
    .eq('id', participant.id);
}

/**
 * Check if user has completed a challenge and award rewards
 */
export async function checkAndCompleteChallenge(
  challengeId: string,
  userId: string
): Promise<ChallengeCompletionResult | null> {
  const supabase = await createClient();

  // Get challenge and participant
  const challenge = await getChallenge(challengeId);
  if (!challenge) {
    return null;
  }

  const { data: participant } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .single();

  if (!participant || participant.completed_at) {
    return null;
  }

  // Check if goal met
  if (participant.progress < challenge.goalTarget) {
    return null;
  }

  // Mark as completed
  await supabase
    .from('challenge_participants')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('id', participant.id);

  // Award points (non-competitive challenges get points immediately)
  let pointsAwarded = 0;
  if (!challenge.isCompetitive) {
    await awardPoints({
      userId,
      amount: challenge.points || CHALLENGE_REWARDS.DEFAULT_POINTS,
      type: 'earn_challenge',
      referenceType: 'challenge',
      referenceId: challengeId,
      description: `Завершення челенджу: ${challenge.title}`,
    });
    pointsAwarded = challenge.points || CHALLENGE_REWARDS.DEFAULT_POINTS;
  }

  // Award badge if specified (non-competitive)
  let badgeAwarded: string | null = null;
  if (!challenge.isCompetitive && challenge.badgeId) {
    try {
      await awardBadge(userId, challenge.badgeId);
      badgeAwarded = challenge.badgeId;
    } catch {
      // Badge may already be owned
    }
  }

  // Award first challenge badge if this is user's first
  const { count: completedCount } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  if (completedCount === 1) {
    try {
      await awardBadge(userId, CHALLENGE_BADGES.FIRST_CHALLENGE);
      if (!badgeAwarded) badgeAwarded = CHALLENGE_BADGES.FIRST_CHALLENGE;
    } catch {
      // Badge may already be owned
    }
  }

  return {
    completed: true,
    pointsAwarded,
    badgeAwarded,
  };
}

// ----- STATUS MANAGEMENT -----

/**
 * Activate a challenge (change status from upcoming to active)
 */
export async function activateChallenge(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('challenges')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'upcoming');

  if (error) {
    throw new Error(`Failed to activate challenge: ${error.message}`);
  }
}

/**
 * Complete a challenge and award rewards to winners (for competitive challenges)
 */
export async function completeChallenge(id: string): Promise<ChallengeRewardsResult> {
  const supabase = await createClient();

  const challenge = await getChallenge(id);
  if (!challenge) {
    throw new Error('Challenge not found');
  }

  // Update status
  await supabase
    .from('challenges')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  // For competitive challenges, rank participants and award rewards
  if (challenge.isCompetitive) {
    return await awardCompetitiveRewards(challenge);
  }

  // For non-competitive, just count who completed
  const { count: completedCount } = await supabase
    .from('challenge_participants')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', id)
    .not('completed_at', 'is', null);

  return {
    winnersCount: completedCount || 0,
    totalPointsAwarded: (completedCount || 0) * (challenge.points || 0),
    badgesAwarded: challenge.badgeId ? (completedCount || 0) : 0,
    participantsRanked: 0,
  };
}

/**
 * Cancel a challenge
 */
export async function cancelChallenge(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('challenges')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to cancel challenge: ${error.message}`);
  }
}

// ----- LEADERBOARD -----

/**
 * Get leaderboard for a competitive challenge
 */
export async function getChallengeLeaderboard(
  challengeId: string,
  limit: number = 10,
  currentUserId?: string
): Promise<ChallengeLeaderboardEntry[]> {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from('challenge_participants')
    .select(`
      user_id,
      progress,
      completed_at,
      final_rank,
      users:user_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('challenge_id', challengeId)
    .order('progress', { ascending: false })
    .order('completed_at', { ascending: true })
    .limit(limit);

  if (!participants) {
    return [];
  }

  return participants.map((p, index) => {
    const user = p.users as unknown as { id: string; first_name: string; last_name: string; avatar_url: string | null };
    return {
      rank: p.final_rank || index + 1,
      oderId: p.user_id,
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      avatarUrl: user?.avatar_url || null,
      progress: p.progress || 0,
      completedAt: p.completed_at,
      isCurrentUser: currentUserId === p.user_id,
    };
  });
}

// ----- HELPER FUNCTIONS -----

async function awardCompetitiveRewards(challenge: Challenge): Promise<ChallengeRewardsResult> {
  const supabase = await createClient();

  // Get all participants ordered by progress and completion time
  const { data: participants } = await supabase
    .from('challenge_participants')
    .select('*')
    .eq('challenge_id', challenge.id)
    .order('progress', { ascending: false })
    .order('completed_at', { ascending: true });

  if (!participants) {
    return {
      winnersCount: 0,
      totalPointsAwarded: 0,
      badgesAwarded: 0,
      participantsRanked: 0,
    };
  }

  let winnersCount = 0;
  let totalPointsAwarded = 0;
  let badgesAwarded = 0;

  // Rank all participants and award to top winners
  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i];
    const rank = i + 1;

    // Update final rank
    await supabase
      .from('challenge_participants')
      .update({ final_rank: rank })
      .eq('id', participant.id);

    // Award rewards to winners
    if (rank <= challenge.maxWinners && participant.progress >= challenge.goalTarget) {
      winnersCount++;

      // Award points with position bonus
      const basePoints = challenge.points || CHALLENGE_REWARDS.DEFAULT_POINTS;
      const bonusMultiplier = rank === 1 ? CHALLENGE_REWARDS.COMPETITIVE_BONUS_MULTIPLIER : 1;
      const pointsToAward = Math.round(basePoints * bonusMultiplier);

      await awardPoints({
        userId: participant.user_id,
        amount: pointsToAward,
        type: 'earn_challenge',
        referenceType: 'challenge',
        referenceId: challenge.id,
        description: `${rank} місце в челенджі: ${challenge.title}`,
        metadata: { rank, isWinner: true },
      });

      totalPointsAwarded += pointsToAward;

      // Award badge to winner
      if (challenge.badgeId) {
        try {
          await awardBadge(participant.user_id, challenge.badgeId);
          badgesAwarded++;
        } catch {
          // Badge may already be owned
        }
      }

      // Award champion badge to first place
      if (rank === 1) {
        try {
          await awardBadge(participant.user_id, CHALLENGE_BADGES.CHALLENGE_CHAMPION);
          badgesAwarded++;
        } catch {
          // Badge may already be owned
        }
      }

      // Mark reward as claimed
      await supabase
        .from('challenge_participants')
        .update({ reward_claimed: true })
        .eq('id', participant.id);
    }
  }

  return {
    winnersCount,
    totalPointsAwarded,
    badgesAwarded,
    participantsRanked: participants.length,
  };
}

function mapChallengeFromDb(data: Record<string, unknown>): Challenge {
  return {
    id: data.id as string,
    title: data.title as string,
    description: data.description as string | null,
    type: data.type as Challenge['type'],
    goalType: data.goal_type as Challenge['goalType'],
    goalTarget: data.goal_target as number,
    points: data.points as number,
    badgeId: data.badge_id as string | null,
    isCompetitive: data.is_competitive as boolean,
    maxWinners: data.max_winners as number,
    imageUrl: data.image_url as string | null,
    startDate: data.start_date as string,
    endDate: data.end_date as string,
    status: data.status as Challenge['status'],
    createdById: data.created_by_id as string | null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapParticipantFromDb(data: Record<string, unknown>): ChallengeParticipant {
  return {
    id: data.id as string,
    challengeId: data.challenge_id as string,
    userId: data.user_id as string,
    progress: data.progress as number,
    completedAt: data.completed_at as string | null,
    joinedAt: data.joined_at as string,
    rewardClaimed: data.reward_claimed as boolean,
    finalRank: data.final_rank as number | null,
  };
}
