/**
 * Messaging permission utilities
 * Determines who can message whom based on roles and relationships
 *
 * DM Rules:
 * 1. Staff admins (staff_role = admin/super_admin) → Can DM ANYONE
 * 2. Regional leaders (membership_role = regional_leader+) → Can DM anyone in their referral tree
 * 3. Members with 2+ referrals → Can DM their direct referrals
 * 4. Leaders (network_leader+) → Can DM other leaders + their referrals
 * 5. Anyone can reply to received messages
 */

import { MEMBERSHIP_ROLES, MembershipRole } from '@/lib/constants';
import { MessagingSettings } from '@/types/messaging';
import type { StaffRole } from '@/lib/permissions-utils';

// Role hierarchy levels for comparison
const ROLE_LEVELS: Record<MembershipRole, number> = {
  supporter: 0,
  candidate: 1,
  member: 2,
  honorary_member: 3,
  network_leader: 4,
  regional_leader: 5,
  national_leader: 6,
  network_guide: 7,
};

// Membership roles that grant referral tree DM access
const REGIONAL_LEADER_ROLES: MembershipRole[] = [
  'regional_leader',
  'national_leader',
  'network_guide',
];

/**
 * Get the numeric level of a membership role
 */
export function getRoleLevel(role: MembershipRole): number {
  return ROLE_LEVELS[role] ?? 0;
}

/**
 * Check if a role meets the minimum level
 */
export function hasMinRole(role: MembershipRole, minRole: MembershipRole): boolean {
  return getRoleLevel(role) >= getRoleLevel(minRole);
}

/**
 * Check if a role is a leader role (network_leader or higher)
 */
export function isLeaderRole(role: MembershipRole): boolean {
  return getRoleLevel(role) >= 4; // network_leader = level 4
}

/**
 * Check if membership role is regional leader or higher
 */
export function isRegionalLeaderMembership(role: MembershipRole | null | undefined): boolean {
  return !!role && REGIONAL_LEADER_ROLES.includes(role);
}

/**
 * Check if staff role is admin (can DM anyone)
 */
export function isStaffAdminForMessaging(staffRole: StaffRole | null | undefined): boolean {
  return staffRole === 'admin' || staffRole === 'super_admin';
}

/**
 * Get the minimum role required to initiate DMs from settings
 */
export function getMinDMInitiatorRole(settings: MessagingSettings): MembershipRole {
  const roles = settings.messaging_dm_initiator_roles;
  if (!roles || roles.length === 0) return 'network_leader';

  // Find the lowest level role that can initiate
  let minLevel = 7;
  let minRole: MembershipRole = 'network_guide';

  for (const role of roles) {
    const level = ROLE_LEVELS[role as MembershipRole];
    if (level !== undefined && level < minLevel) {
      minLevel = level;
      minRole = role as MembershipRole;
    }
  }

  return minRole;
}

/**
 * Check if a user can initiate DMs based on their roles
 */
export function canInitiateDMs(
  senderMembershipRole: MembershipRole,
  senderStaffRole: StaffRole | null | undefined,
  settings: MessagingSettings
): boolean {
  if (!settings.messaging_enabled || !settings.messaging_dm_enabled) {
    return false;
  }

  // Staff admins can ALWAYS initiate DMs
  if (isStaffAdminForMessaging(senderStaffRole)) {
    return true;
  }

  // Regional leaders (by membership) can initiate DMs to their tree
  if (isRegionalLeaderMembership(senderMembershipRole)) {
    return true;
  }

  // Check against allowed roles in settings
  const allowedRoles = settings.messaging_dm_initiator_roles || [];
  return allowedRoles.includes(senderMembershipRole);
}

/**
 * Check if a user can create group chats based on their role
 */
export function canCreateGroupChats(
  senderMembershipRole: MembershipRole,
  senderStaffRole: StaffRole | null | undefined,
  settings: MessagingSettings
): boolean {
  if (!settings.messaging_enabled || !settings.messaging_group_chat_enabled) {
    return false;
  }

  // Staff admins can always create groups
  if (isStaffAdminForMessaging(senderStaffRole)) {
    return true;
  }

  const allowedRoles = settings.messaging_group_creator_roles || [];
  return allowedRoles.includes(senderMembershipRole);
}

/**
 * Check if sender can message a specific recipient
 *
 * Rules:
 * 1. Staff admins can message ANYONE
 * 2. Regional leaders (membership) can message anyone in their referral tree
 * 3. Members with 2+ referrals can message their direct referrals
 * 4. Leaders (network_leader+) can message other leaders
 * 5. Leaders can message users in groups they lead
 * 6. Anyone can reply to received messages (checked separately)
 * 7. Same group members can message each other (when enabled)
 */
export interface CanMessageParams {
  senderMembershipRole: MembershipRole;
  senderStaffRole?: StaffRole | null;
  senderReferralCount?: number; // Number of direct referrals sender has
  recipientMembershipRole: MembershipRole;
  isDirectReferral: boolean; // Is recipient a direct referral of sender?
  isInReferralTree: boolean; // Is recipient in sender's referral tree? (for regional leaders)
  isInLeaderGroup: boolean;
  isSameGroup: boolean;
  settings: MessagingSettings;
}

export function canMessageUser(params: CanMessageParams): boolean {
  const {
    senderMembershipRole,
    senderStaffRole,
    senderReferralCount = 0,
    recipientMembershipRole,
    isDirectReferral,
    isInReferralTree,
    isInLeaderGroup,
    isSameGroup,
    settings,
  } = params;

  // Check if messaging is enabled
  if (!settings.messaging_enabled || !settings.messaging_dm_enabled) {
    return false;
  }

  // 1. Staff admins can message ANYONE
  if (isStaffAdminForMessaging(senderStaffRole)) {
    return true;
  }

  // 2. Regional leaders (membership) can message anyone in their referral tree
  if (isRegionalLeaderMembership(senderMembershipRole) && isInReferralTree) {
    return true;
  }

  // 3. Members with 2+ referrals can message their direct referrals
  if (senderReferralCount >= 2 && isDirectReferral) {
    return true;
  }

  // 4. Leaders can message other leaders (level 4+)
  if (isLeaderRole(senderMembershipRole) && isLeaderRole(recipientMembershipRole)) {
    return true;
  }

  // 5. Leaders can message users in groups they lead
  if (isLeaderRole(senderMembershipRole) && isInLeaderGroup) {
    return true;
  }

  // 6. Same group messaging (when enabled)
  if (settings.messaging_same_group_enabled && isSameGroup) {
    return true;
  }

  // Check general DM initiator permission as fallback
  if (canInitiateDMs(senderMembershipRole, senderStaffRole, settings)) {
    // Leaders can message their direct referrals
    if (isLeaderRole(senderMembershipRole) && isDirectReferral) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can add participants to a group chat
 */
export function canAddToGroup(
  adderRole: 'owner' | 'admin' | 'member',
  _membershipRole: MembershipRole,
  settings: MessagingSettings
): boolean {
  if (!settings.messaging_enabled || !settings.messaging_group_chat_enabled) {
    return false;
  }

  // Only owner and admin can add participants
  return adderRole === 'owner' || adderRole === 'admin';
}

/**
 * Check if user can remove participants from a group chat
 */
export function canRemoveFromGroup(
  removerRole: 'owner' | 'admin' | 'member',
  targetRole: 'owner' | 'admin' | 'member'
): boolean {
  // Owner can remove anyone except themselves
  if (removerRole === 'owner' && targetRole !== 'owner') {
    return true;
  }

  // Admin can remove members (not owner or other admins)
  if (removerRole === 'admin' && targetRole === 'member') {
    return true;
  }

  return false;
}

/**
 * Check if user can edit a message
 */
export function canEditMessage(
  userId: string,
  message: { senderId: string | null; createdAt: string },
  settings: MessagingSettings
): boolean {
  // Can only edit own messages
  if (message.senderId !== userId) {
    return false;
  }

  // Check edit window
  const editWindowMinutes = settings.messaging_edit_window_minutes || 15;
  const createdAt = new Date(message.createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;

  return diffMinutes <= editWindowMinutes;
}

/**
 * Check if user can delete a message
 */
export function canDeleteMessage(
  userId: string,
  participantRole: 'owner' | 'admin' | 'member',
  message: { senderId: string | null }
): boolean {
  // Can always delete own messages
  if (message.senderId === userId) {
    return true;
  }

  // Group owner/admin can delete any message
  return participantRole === 'owner' || participantRole === 'admin';
}

/**
 * Check if user can send attachments
 */
export function canSendAttachments(
  settings: MessagingSettings
): boolean {
  return settings.messaging_enabled && settings.messaging_attachments_enabled;
}

/**
 * Validate attachment file
 */
export function validateAttachment(
  file: { size: number; mimeType: string },
  settings: MessagingSettings
): { valid: boolean; error?: string } {
  const maxSizeBytes = (settings.messaging_max_attachment_size_mb || 10) * 1024 * 1024;
  const allowedTypes = settings.messaging_allowed_attachment_types || [];

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Файл занадто великий. Максимум: ${settings.messaging_max_attachment_size_mb} МБ`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimeType)) {
    return {
      valid: false,
      error: 'Цей тип файлу не дозволено',
    };
  }

  return { valid: true };
}

/**
 * Check rate limit for message sending
 */
export interface RateLimitCheck {
  allowed: boolean;
  remainingMessages: number;
  resetInSeconds: number;
}

export async function checkMessageRateLimit(
  _userId: string,
  recentMessageCount: number,
  settings: MessagingSettings
): Promise<RateLimitCheck> {
  const limit = settings.messaging_rate_limit_messages_per_minute || 30;

  if (recentMessageCount >= limit) {
    return {
      allowed: false,
      remainingMessages: 0,
      resetInSeconds: 60,
    };
  }

  return {
    allowed: true,
    remainingMessages: limit - recentMessageCount,
    resetInSeconds: 60,
  };
}
