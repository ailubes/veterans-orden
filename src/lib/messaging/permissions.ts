/**
 * Messaging permission utilities
 * Determines who can message whom based on membership roles and settings
 */

import { MEMBERSHIP_ROLES, MembershipRole } from '@/lib/constants';
import { MessagingSettings } from '@/types/messaging';

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
 * Check if a user can initiate DMs based on their role
 */
export function canInitiateDMs(
  senderRole: MembershipRole,
  settings: MessagingSettings
): boolean {
  if (!settings.messaging_enabled || !settings.messaging_dm_enabled) {
    return false;
  }

  const allowedRoles = settings.messaging_dm_initiator_roles || [];
  return allowedRoles.includes(senderRole);
}

/**
 * Check if a user can create group chats based on their role
 */
export function canCreateGroupChats(
  senderRole: MembershipRole,
  settings: MessagingSettings
): boolean {
  if (!settings.messaging_enabled || !settings.messaging_group_chat_enabled) {
    return false;
  }

  const allowedRoles = settings.messaging_group_creator_roles || [];
  return allowedRoles.includes(senderRole);
}

/**
 * Check if sender can message a specific recipient
 *
 * Rules:
 * 1. Leaders (network_leader+) can message their direct referrals
 * 2. Leaders can message other leaders at same or higher level
 * 3. Leaders can message users in groups they lead
 * 4. Anyone can reply to received messages (checked separately)
 * 5. Future: Same group members can message each other (when enabled)
 */
export interface CanMessageParams {
  senderRole: MembershipRole;
  recipientRole: MembershipRole;
  isDirectReferral: boolean;
  isInLeaderGroup: boolean;
  isSameGroup: boolean;
  settings: MessagingSettings;
}

export function canMessageUser(params: CanMessageParams): boolean {
  const {
    senderRole,
    recipientRole,
    isDirectReferral,
    isInLeaderGroup,
    isSameGroup,
    settings,
  } = params;

  // Check if messaging is enabled
  if (!settings.messaging_enabled || !settings.messaging_dm_enabled) {
    return false;
  }

  // Check if sender can initiate DMs
  if (!canInitiateDMs(senderRole, settings)) {
    return false;
  }

  // Leaders can message their direct referrals
  if (isDirectReferral) {
    return true;
  }

  // Leaders can message other leaders (level 4+)
  if (isLeaderRole(senderRole) && isLeaderRole(recipientRole)) {
    return true;
  }

  // Leaders can message users in groups they lead
  if (isLeaderRole(senderRole) && isInLeaderGroup) {
    return true;
  }

  // Future: Same group messaging
  if (settings.messaging_same_group_enabled && isSameGroup) {
    return true;
  }

  return false;
}

/**
 * Check if user can add participants to a group chat
 */
export function canAddToGroup(
  adderRole: 'owner' | 'admin' | 'member',
  membershipRole: MembershipRole,
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
  userId: string,
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
