/**
 * Challenges System Types
 * Defines TypeScript interfaces for the challenges gamification feature
 */

// ----- ENUMS -----

export type ChallengeType = 'weekly' | 'monthly' | 'special';
export type ChallengeGoalType = 'referrals' | 'tasks' | 'events' | 'votes' | 'points';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'challenge' | 'achievement' | 'special';

// ----- CHALLENGE INTERFACES -----

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  goalType: ChallengeGoalType;
  goalTarget: number;
  points: number;
  badgeId: string | null;
  isCompetitive: boolean;
  maxWinners: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  progress: number;
  completedAt: string | null;
  joinedAt: string;
  rewardClaimed: boolean;
  finalRank: number | null;
}

export interface ChallengeWithProgress extends Challenge {
  userProgress: number;
  userCompleted: boolean;
  userJoined: boolean;
  participantCount: number;
  percentComplete: number;
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  oderId: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  progress: number;
  completedAt: string | null;
  isCurrentUser: boolean;
}

export interface ChallengeWithDetails extends Challenge {
  participantCount: number;
  completedCount: number;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  badge?: Badge | null;
}

// ----- BADGE INTERFACES -----

export interface Badge {
  id: string;
  nameUk: string;
  nameEn: string;
  descriptionUk: string | null;
  descriptionEn: string | null;
  iconUrl: string | null;
  category: BadgeCategory;
  rarity: BadgeRarity;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  badgeId: string;
  userId: string;
  earnedAt: string;
  badge: Badge;
}

// ----- SERVICE PARAMS -----

export interface CreateChallengeParams {
  title: string;
  description?: string;
  type: ChallengeType;
  goalType: ChallengeGoalType;
  goalTarget: number;
  points?: number;
  badgeId?: string;
  isCompetitive?: boolean;
  maxWinners?: number;
  imageUrl?: string;
  startDate: Date | string;
  endDate: Date | string;
  createdById: string;
}

export interface UpdateChallengeParams {
  title?: string;
  description?: string;
  type?: ChallengeType;
  goalType?: ChallengeGoalType;
  goalTarget?: number;
  points?: number;
  badgeId?: string | null;
  isCompetitive?: boolean;
  maxWinners?: number;
  imageUrl?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: ChallengeStatus;
}

export interface ListChallengesOptions {
  status?: ChallengeStatus | ChallengeStatus[];
  type?: ChallengeType;
  userId?: string; // Include user progress if provided
  limit?: number;
  offset?: number;
  orderBy?: 'startDate' | 'endDate' | 'createdAt';
  orderDir?: 'asc' | 'desc';
}

export interface ChallengeProgressUpdate {
  userId: string;
  goalType: ChallengeGoalType;
  increment?: number;
  referenceType?: string;
  referenceId?: string;
}

// ----- RESULT TYPES -----

export interface JoinChallengeResult {
  success: boolean;
  participant?: ChallengeParticipant;
  error?: string;
}

export interface ChallengeCompletionResult {
  completed: boolean;
  pointsAwarded: number;
  badgeAwarded: string | null;
  rank?: number; // For competitive challenges
}

export interface ChallengeRewardsResult {
  winnersCount: number;
  totalPointsAwarded: number;
  badgesAwarded: number;
  participantsRanked: number;
}
