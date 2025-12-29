/**
 * Role Progression Service
 *
 * Handles the 8-tier membership role progression system:
 * 0. Прихильник (Supporter) - Registered, no contribution
 * 1. Кандидат (Candidate) - Made contribution (49+ UAH)
 * 2. Член Мережі (Member) - 2 recruited candidates
 * 3. Почесний Член (Honorary) - 2 recruits became members
 * 4. Лідер Мережі (Leader) - 8 personal + 49 total referrals
 * 5. Регіональний лідер (Regional) - 6 helped→leader + 400 total
 * 6. Національний лідер (National) - 4 helped→regional + 4000 total
 * 7. Провідник Мережі (Guide) - 2 helped→national + 25000 total
 */

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import {
  users,
  roleAdvancements,
  roleRequirements,
  userReferralStats,
  advancementRequests,
} from '@/lib/db/schema';
import { MEMBERSHIP_ROLES, STAFF_ROLES, PRIVILEGE_LABELS } from '@/lib/constants';

// Types
export type MembershipRole =
  | 'supporter'
  | 'candidate'
  | 'member'
  | 'honorary_member'
  | 'network_leader'
  | 'regional_leader'
  | 'national_leader'
  | 'network_guide';

export type StaffRole = 'none' | 'news_editor' | 'admin' | 'super_admin';

export type AdvancementTrigger =
  | 'contribution'
  | 'referral_count'
  | 'tree_count'
  | 'helped_advance'
  | 'manual';

export interface RoleRequirement {
  id: string;
  role: MembershipRole;
  roleLevel: number;
  displayNameUk: string;
  descriptionUk: string | null;
  requiresContribution: boolean;
  minContributionAmount: number | null;
  minDirectReferrals: number;
  minDirectReferralsAtRole: MembershipRole | null;
  minTotalReferrals: number;
  minHelpedAdvance: number;
  helpedAdvanceFromRole: MembershipRole | null;
  helpedAdvanceToRole: MembershipRole | null;
  privileges: string[];
}

export interface ReferralStats {
  userId: string;
  directReferrals: {
    supporters: number;
    candidates: number;
    members: number;
    honoraryMembers: number;
    networkLeaders: number;
    regionalLeaders: number;
    nationalLeaders: number;
    networkGuides: number;
    total: number;
  };
  totalTreeCount: number;
  helpedAdvance: {
    toCandidate: number;
    toMember: number;
    toHonorary: number;
    toLeader: number;
    toRegional: number;
    toNational: number;
    toGuide: number;
  };
  lastCalculatedAt: Date | null;
}

export interface RoleProgress {
  currentRole: MembershipRole;
  currentRoleLevel: number;
  currentRoleLabel: string;
  nextRole: MembershipRole | null;
  nextRoleLevel: number | null;
  nextRoleLabel: string | null;
  isEligible: boolean;
  progressPercent: number;
  requirements: {
    type: 'contribution' | 'direct_referrals' | 'total_referrals' | 'helped_advance';
    label: string;
    current: number;
    required: number;
    isMet: boolean;
    atRole?: MembershipRole;
    fromRole?: MembershipRole;
    toRole?: MembershipRole;
  }[];
  privileges: {
    current: string[];
    next: string[];
  };
}

export interface RoleAdvancement {
  id: string;
  userId: string;
  fromRole: MembershipRole;
  toRole: MembershipRole;
  advancedAt: Date;
  advancedBy: string | null;
  triggerType: AdvancementTrigger;
  triggerData: Record<string, unknown>;
  approvedBy: string | null;
  approvedAt: Date | null;
}

// Service Functions

/**
 * Get user's role progress toward next level
 */
export async function getUserRoleProgress(userId: string): Promise<RoleProgress | null> {
  try {
    // Call the PostgreSQL function
    const result = await db.execute<{
      user_id: string;
      current_role: MembershipRole;
      current_role_level: number;
      current_role_name_uk: string;
      next_role: MembershipRole | null;
      next_role_level: number | null;
      next_role_name_uk: string | null;
      is_eligible: boolean;
      progress_percent: number;
      requirements: {
        missing: Array<{
          type: string;
          current: number;
          required: number;
          at_role?: string;
          from_role?: string;
          to_role?: string;
        }>;
        next_role_requirements: {
          requires_contribution: boolean;
          min_contribution_amount: number | null;
          min_direct_referrals: number;
          min_direct_referrals_at_role: string | null;
          min_total_referrals: number;
          min_helped_advance: number;
          helped_advance_from_role: string | null;
          helped_advance_to_role: string | null;
          privileges: string[];
        } | null;
      };
      stats: {
        direct_referrals: Record<string, number>;
        total_tree_count: number;
        helped_advance: Record<string, number>;
      };
    }>(sql`SELECT * FROM get_user_role_progress(${userId}::uuid)`);

    if (!result || result.length === 0) {
      return null;
    }

    const row = result[0];
    const currentRoleInfo = MEMBERSHIP_ROLES[row.current_role];
    const nextRoleInfo = row.next_role ? MEMBERSHIP_ROLES[row.next_role] : null;

    // Build requirements array
    const requirements: RoleProgress['requirements'] = [];
    const nextReqs = row.requirements?.next_role_requirements;

    if (nextReqs) {
      // Contribution requirement
      if (nextReqs.requires_contribution) {
        const hasContribution = !row.requirements.missing.some(m => m.type === 'contribution');
        requirements.push({
          type: 'contribution',
          label: `Внесок від ${(nextReqs.min_contribution_amount || 4900) / 100} грн`,
          current: hasContribution ? 1 : 0,
          required: 1,
          isMet: hasContribution,
        });
      }

      // Direct referrals requirement
      if (nextReqs.min_direct_referrals > 0) {
        const missing = row.requirements.missing.find(m => m.type === 'direct_referrals');
        requirements.push({
          type: 'direct_referrals',
          label: `${nextReqs.min_direct_referrals} прямих рефералів рівня "${MEMBERSHIP_ROLES[nextReqs.min_direct_referrals_at_role as MembershipRole]?.label || ''}"`,
          current: missing ? missing.current : nextReqs.min_direct_referrals,
          required: nextReqs.min_direct_referrals,
          isMet: !missing,
          atRole: nextReqs.min_direct_referrals_at_role as MembershipRole,
        });
      }

      // Total referrals requirement
      if (nextReqs.min_total_referrals > 0) {
        const missing = row.requirements.missing.find(m => m.type === 'total_referrals');
        requirements.push({
          type: 'total_referrals',
          label: `${nextReqs.min_total_referrals} загальних рефералів у дереві`,
          current: missing ? missing.current : nextReqs.min_total_referrals,
          required: nextReqs.min_total_referrals,
          isMet: !missing,
        });
      }

      // Helped advance requirement
      if (nextReqs.min_helped_advance > 0) {
        const missing = row.requirements.missing.find(m => m.type === 'helped_advance');
        const fromLabel = MEMBERSHIP_ROLES[nextReqs.helped_advance_from_role as MembershipRole]?.label || '';
        const toLabel = MEMBERSHIP_ROLES[nextReqs.helped_advance_to_role as MembershipRole]?.label || '';
        requirements.push({
          type: 'helped_advance',
          label: `${nextReqs.min_helped_advance} допомогли перейти з "${fromLabel}" до "${toLabel}"`,
          current: missing ? missing.current : nextReqs.min_helped_advance,
          required: nextReqs.min_helped_advance,
          isMet: !missing,
          fromRole: nextReqs.helped_advance_from_role as MembershipRole,
          toRole: nextReqs.helped_advance_to_role as MembershipRole,
        });
      }
    }

    return {
      currentRole: row.current_role,
      currentRoleLevel: row.current_role_level,
      currentRoleLabel: row.current_role_name_uk || currentRoleInfo?.label || '',
      nextRole: row.next_role,
      nextRoleLevel: row.next_role_level,
      nextRoleLabel: row.next_role_name_uk || nextRoleInfo?.label || null,
      isEligible: row.is_eligible,
      progressPercent: row.progress_percent,
      requirements,
      privileges: {
        current: [...(currentRoleInfo?.privileges || [])],
        next: [...(nextRoleInfo?.privileges || [])],
      },
    };
  } catch (error) {
    console.error('Error getting user role progress:', error);
    throw error;
  }
}

/**
 * Get user's referral statistics
 */
export async function getUserReferralStats(userId: string): Promise<ReferralStats | null> {
  try {
    const stats = await db
      .select()
      .from(userReferralStats)
      .where(eq(userReferralStats.userId, userId))
      .limit(1);

    if (!stats || stats.length === 0) {
      // Calculate stats if not cached
      await recalculateUserStats(userId);

      const newStats = await db
        .select()
        .from(userReferralStats)
        .where(eq(userReferralStats.userId, userId))
        .limit(1);

      if (!newStats || newStats.length === 0) {
        return null;
      }

      return formatReferralStats(newStats[0]);
    }

    return formatReferralStats(stats[0]);
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

function formatReferralStats(stats: typeof userReferralStats.$inferSelect): ReferralStats {
  const directTotal =
    (stats.directSupporters || 0) +
    (stats.directCandidates || 0) +
    (stats.directMembers || 0) +
    (stats.directHonoraryMembers || 0) +
    (stats.directNetworkLeaders || 0) +
    (stats.directRegionalLeaders || 0) +
    (stats.directNationalLeaders || 0) +
    (stats.directNetworkGuides || 0);

  return {
    userId: stats.userId,
    directReferrals: {
      supporters: stats.directSupporters || 0,
      candidates: stats.directCandidates || 0,
      members: stats.directMembers || 0,
      honoraryMembers: stats.directHonoraryMembers || 0,
      networkLeaders: stats.directNetworkLeaders || 0,
      regionalLeaders: stats.directRegionalLeaders || 0,
      nationalLeaders: stats.directNationalLeaders || 0,
      networkGuides: stats.directNetworkGuides || 0,
      total: directTotal,
    },
    totalTreeCount: stats.totalTreeCount || 0,
    helpedAdvance: {
      toCandidate: stats.helpedToCandidate || 0,
      toMember: stats.helpedToMember || 0,
      toHonorary: stats.helpedToHonorary || 0,
      toLeader: stats.helpedToLeader || 0,
      toRegional: stats.helpedToRegional || 0,
      toNational: stats.helpedToNational || 0,
      toGuide: stats.helpedToGuide || 0,
    },
    lastCalculatedAt: stats.lastCalculatedAt,
  };
}

/**
 * Recalculate user's referral statistics
 */
export async function recalculateUserStats(userId: string): Promise<void> {
  try {
    await db.execute(sql`SELECT recalculate_user_referral_stats(${userId}::uuid)`);
  } catch (error) {
    console.error('Error recalculating user stats:', error);
    throw error;
  }
}

/**
 * Check and advance user role if eligible
 */
export async function checkAndAdvanceRole(
  userId: string,
  adminId?: string
): Promise<{ advanced: boolean; newRole: MembershipRole | null; error?: string }> {
  try {
    // First, get the advancement mode setting
    const modeResult = await db.execute<{ value: string }>(
      sql`SELECT value FROM organization_settings WHERE key = 'role_advancement_mode'`
    );

    const mode = modeResult?.[0]?.value
      ? JSON.parse(modeResult[0].value as string)
      : 'automatic';

    // Get user's current progress
    const progress = await getUserRoleProgress(userId);

    if (!progress || !progress.isEligible || !progress.nextRole) {
      return { advanced: false, newRole: null };
    }

    if (mode === 'approval_required' && !adminId) {
      // Create advancement request instead of advancing
      await db.insert(advancementRequests).values({
        userId,
        requestedRole: progress.nextRole,
        currentRole: progress.currentRole,
        status: 'pending',
      }).onConflictDoNothing();

      return {
        advanced: false,
        newRole: null,
        error: 'approval_required',
      };
    }

    // Advance the user
    const result = await db.execute<{ advance_user_role: MembershipRole | null }>(
      sql`SELECT advance_user_role(${userId}::uuid, ${adminId || null}::uuid)`
    );

    const newRole = result?.[0]?.advance_user_role;

    return {
      advanced: !!newRole,
      newRole,
    };
  } catch (error) {
    console.error('Error checking/advancing role:', error);
    throw error;
  }
}

/**
 * Get all role requirements
 */
export async function getAllRoleRequirements(): Promise<RoleRequirement[]> {
  try {
    const requirements = await db
      .select()
      .from(roleRequirements)
      .orderBy(roleRequirements.roleLevel);

    return requirements.map((req) => ({
      id: req.id,
      role: req.role as MembershipRole,
      roleLevel: req.roleLevel,
      displayNameUk: req.displayNameUk,
      descriptionUk: req.descriptionUk,
      requiresContribution: req.requiresContribution || false,
      minContributionAmount: req.minContributionAmount,
      minDirectReferrals: req.minDirectReferrals || 0,
      minDirectReferralsAtRole: req.minDirectReferralsAtRole as MembershipRole | null,
      minTotalReferrals: req.minTotalReferrals || 0,
      minHelpedAdvance: req.minHelpedAdvance || 0,
      helpedAdvanceFromRole: req.helpedAdvanceFromRole as MembershipRole | null,
      helpedAdvanceToRole: req.helpedAdvanceToRole as MembershipRole | null,
      privileges: (req.privileges as string[]) || [],
    }));
  } catch (error) {
    console.error('Error getting role requirements:', error);
    throw error;
  }
}

/**
 * Get recent role advancements
 */
export async function getRecentAdvancements(limit = 50): Promise<
  Array<
    RoleAdvancement & {
      user?: {
        firstName: string;
        lastName: string;
      };
    }
  >
> {
  try {
    const advancements = await db
      .select({
        id: roleAdvancements.id,
        userId: roleAdvancements.userId,
        fromRole: roleAdvancements.fromRole,
        toRole: roleAdvancements.toRole,
        advancedAt: roleAdvancements.advancedAt,
        advancedBy: roleAdvancements.advancedBy,
        triggerType: roleAdvancements.triggerType,
        triggerData: roleAdvancements.triggerData,
        approvedBy: roleAdvancements.approvedBy,
        approvedAt: roleAdvancements.approvedAt,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(roleAdvancements)
      .innerJoin(users, eq(roleAdvancements.userId, users.id))
      .orderBy(sql`${roleAdvancements.advancedAt} DESC`)
      .limit(limit);

    return advancements.map((adv) => ({
      id: adv.id,
      userId: adv.userId,
      fromRole: adv.fromRole as MembershipRole,
      toRole: adv.toRole as MembershipRole,
      advancedAt: adv.advancedAt || new Date(),
      advancedBy: adv.advancedBy,
      triggerType: adv.triggerType as AdvancementTrigger,
      triggerData: (adv.triggerData as Record<string, unknown>) || {},
      approvedBy: adv.approvedBy,
      approvedAt: adv.approvedAt,
      user: {
        firstName: adv.firstName,
        lastName: adv.lastName,
      },
    }));
  } catch (error) {
    console.error('Error getting recent advancements:', error);
    throw error;
  }
}

/**
 * Manually advance a user's role (admin action)
 */
export async function manuallyAdvanceRole(
  userId: string,
  toRole: MembershipRole,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's current role
    const user = await db
      .select({ membershipRole: users.membershipRole })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentRole = user[0].membershipRole as MembershipRole;
    const currentLevel = MEMBERSHIP_ROLES[currentRole]?.level || 0;
    const targetLevel = MEMBERSHIP_ROLES[toRole]?.level || 0;

    if (targetLevel <= currentLevel) {
      return { success: false, error: 'Can only advance to higher roles' };
    }

    // Update user's role
    await db
      .update(users)
      .set({
        membershipRole: toRole,
        roleAdvancedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Record the advancement
    await db.insert(roleAdvancements).values({
      userId,
      fromRole: currentRole,
      toRole,
      triggerType: 'manual',
      triggerData: {
        manual_by: adminId,
        reason: reason || 'Manual advancement by admin',
      },
      approvedBy: adminId,
      approvedAt: new Date(),
    });

    // Recalculate referrer's stats if user has a referrer
    const userWithReferrer = await db
      .select({ referredById: users.referredById })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userWithReferrer[0]?.referredById) {
      await recalculateUserStats(userWithReferrer[0].referredById);
    }

    return { success: true };
  } catch (error) {
    console.error('Error manually advancing role:', error);
    throw error;
  }
}

/**
 * Get pending advancement requests
 */
export async function getPendingAdvancementRequests(): Promise<
  Array<{
    id: string;
    userId: string;
    requestedRole: MembershipRole;
    currentRole: MembershipRole;
    requestedAt: Date;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>
> {
  try {
    const requests = await db
      .select({
        id: advancementRequests.id,
        userId: advancementRequests.userId,
        requestedRole: advancementRequests.requestedRole,
        currentRole: advancementRequests.currentRole,
        requestedAt: advancementRequests.requestedAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(advancementRequests)
      .innerJoin(users, eq(advancementRequests.userId, users.id))
      .where(eq(advancementRequests.status, 'pending'))
      .orderBy(sql`${advancementRequests.requestedAt} ASC`);

    return requests.map((req) => ({
      id: req.id,
      userId: req.userId,
      requestedRole: req.requestedRole as MembershipRole,
      currentRole: req.currentRole as MembershipRole,
      requestedAt: req.requestedAt || new Date(),
      user: {
        firstName: req.firstName,
        lastName: req.lastName,
        email: req.email,
      },
    }));
  } catch (error) {
    console.error('Error getting pending advancement requests:', error);
    throw error;
  }
}

/**
 * Approve or reject an advancement request
 */
export async function processAdvancementRequest(
  requestId: string,
  adminId: string,
  approved: boolean,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the request
    const request = await db
      .select()
      .from(advancementRequests)
      .where(eq(advancementRequests.id, requestId))
      .limit(1);

    if (!request || request.length === 0) {
      return { success: false, error: 'Request not found' };
    }

    const req = request[0];

    if (req.status !== 'pending') {
      return { success: false, error: 'Request already processed' };
    }

    if (approved) {
      // Advance the user
      const result = await manuallyAdvanceRole(
        req.userId,
        req.requestedRole as MembershipRole,
        adminId,
        'Approved advancement request'
      );

      if (!result.success) {
        return result;
      }

      // Update request status
      await db
        .update(advancementRequests)
        .set({
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(advancementRequests.id, requestId));
    } else {
      // Reject the request
      await db
        .update(advancementRequests)
        .set({
          status: 'rejected',
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'Rejected by admin',
        })
        .where(eq(advancementRequests.id, requestId));
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing advancement request:', error);
    throw error;
  }
}

/**
 * Check if a user has a specific privilege
 */
export function userHasPrivilege(
  membershipRole: MembershipRole,
  staffRole: StaffRole,
  privilege: string
): boolean {
  // Staff admins have all privileges
  if (staffRole === 'super_admin' || staffRole === 'admin') {
    return true;
  }

  // Check membership role privileges
  const roleInfo = MEMBERSHIP_ROLES[membershipRole];
  const privileges = roleInfo?.privileges as readonly string[] | undefined;
  return privileges?.includes(privilege) || false;
}

/**
 * Get the label for a privilege
 */
export function getPrivilegeLabel(privilege: string): string {
  return PRIVILEGE_LABELS[privilege as keyof typeof PRIVILEGE_LABELS] || privilege;
}

/**
 * Get role display info
 */
export function getRoleDisplayInfo(role: MembershipRole) {
  return MEMBERSHIP_ROLES[role] || null;
}
