/**
 * Permission utility functions that can be used in both client and server components
 * These are pure functions without any server-side dependencies
 *
 * Two-tier role system:
 * 1. StaffRole - Administrative access (none, news_editor, admin, super_admin)
 * 2. MembershipRole - Network progression (supporter → network_guide)
 *
 * Admin panel access requires either:
 * - staff_role = admin/super_admin (full access)
 * - membership_role = regional_leader+ (limited to their region)
 */

import type { MembershipRole } from '@/lib/constants';

// Staff roles for administrative access
export type StaffRole = 'none' | 'news_editor' | 'admin' | 'super_admin';

// Legacy UserRole type - kept for backwards compatibility during migration
export type UserRole =
  | 'free_viewer'
  | 'prospect'
  | 'silent_member'
  | 'full_member'
  | 'group_leader'
  | 'regional_leader'
  | 'admin'
  | 'super_admin';

// Membership roles that grant limited admin access (to their region only)
const LEADER_MEMBERSHIP_ROLES: MembershipRole[] = [
  'regional_leader',
  'national_leader',
  'network_guide',
];

// ============================================
// STAFF ROLE CHECKS (System-wide admin access)
// ============================================

/**
 * Check if staff role has admin access (admin or super_admin)
 */
export function isStaffAdmin(staffRole: StaffRole | null | undefined): boolean {
  return staffRole === 'admin' || staffRole === 'super_admin';
}

/**
 * Check if staff role is super admin
 */
export function isStaffSuperAdmin(staffRole: StaffRole | null | undefined): boolean {
  return staffRole === 'super_admin';
}

/**
 * Check if staff role can manage news/content (news_editor or higher)
 */
export function isNewsEditor(staffRole: StaffRole | null | undefined): boolean {
  return staffRole === 'news_editor' || isStaffAdmin(staffRole);
}

// ============================================
// COMBINED ACCESS CHECKS
// ============================================

/**
 * Check if user has admin panel access
 * Either through staff role OR through leadership membership role
 */
export function hasAdminAccess(
  staffRole: StaffRole | null | undefined,
  membershipRole?: MembershipRole | null
): boolean {
  // Staff admins always have full access
  if (isStaffAdmin(staffRole)) return true;

  // Regional leaders (by membership) have limited access
  if (membershipRole && LEADER_MEMBERSHIP_ROLES.includes(membershipRole)) {
    return true;
  }

  return false;
}

/**
 * Check if user is a regional leader by membership ONLY (not staff admin)
 * These users have limited admin access scoped to their referral tree
 */
export function isRegionalLeaderOnly(
  staffRole: StaffRole | null | undefined,
  membershipRole: MembershipRole | null | undefined
): boolean {
  // If they're a staff admin, they have full access (not "regional only")
  if (isStaffAdmin(staffRole)) return false;

  // Check if they have admin access through membership role
  return !!membershipRole && LEADER_MEMBERSHIP_ROLES.includes(membershipRole);
}

/**
 * Check if user is a leader by membership role (network_leader or higher)
 */
export function isMembershipLeader(membershipRole: MembershipRole | null | undefined): boolean {
  if (!membershipRole) return false;
  const leaderRoles: MembershipRole[] = [
    'network_leader',
    'regional_leader',
    'national_leader',
    'network_guide',
  ];
  return leaderRoles.includes(membershipRole);
}

// ============================================
// LEGACY FUNCTIONS (for backwards compatibility)
// These will be deprecated once all code is migrated
// ============================================

/**
 * @deprecated Use hasAdminAccess() or isStaffAdmin() instead
 * Check if user has admin access (admin, super_admin, or regional_leader)
 */
export function isAdmin(role: UserRole | StaffRole | null | undefined): boolean {
  if (!role) return false;
  // Support both legacy role values and new staff role values
  return ['admin', 'super_admin', 'regional_leader'].includes(role);
}

/**
 * @deprecated Use isStaffSuperAdmin() instead
 * Check if user is super admin
 */
export function isSuperAdmin(role: UserRole | StaffRole | null | undefined): boolean {
  return role === 'super_admin';
}

/**
 * @deprecated Regional leader is now a membership role, not an admin role
 * Check if user is regional leader
 */
export function isRegionalLeader(role: UserRole | null | undefined): boolean {
  return role === 'regional_leader';
}

// ============================================
// PERMISSION ACTION CHECKS
// ============================================

/**
 * Can the admin change role of a user?
 *
 * Rules:
 * - Super Admin: Can change any role
 * - Admin: Can change any role except super_admin
 * - Regional Leader: Cannot change roles
 */
export function canChangeRole(
  adminStaffRole: StaffRole | null | undefined,
  _currentRole: string,
  newRole: string
): boolean {
  if (isStaffSuperAdmin(adminStaffRole)) {
    return true;
  }

  if (adminStaffRole === 'admin') {
    // Admin cannot promote to super_admin
    if (newRole === 'super_admin') {
      return false;
    }
    return true;
  }

  // Regional leaders (membership only) cannot change roles
  return false;
}

/**
 * Can the admin suspend/unsuspend users?
 * Only staff super_admin and admin can suspend
 */
export function canSuspendMembers(staffRole: StaffRole | null | undefined): boolean {
  return isStaffAdmin(staffRole);
}

/**
 * Can the admin impersonate users?
 * Only staff super_admin can impersonate
 */
export function canImpersonate(staffRole: StaffRole | null | undefined): boolean {
  return isStaffSuperAdmin(staffRole);
}

/**
 * Can the admin access system settings?
 * Only staff super_admin can access system settings
 */
export function canAccessSystemSettings(staffRole: StaffRole | null | undefined): boolean {
  return isStaffSuperAdmin(staffRole);
}

export type NotificationScope =
  | 'all'
  | 'user'
  | 'role'
  | 'oblast'
  | 'tier'
  | 'group'
  | 'referral_tree'
  | 'payment_expired'
  | 'never_paid';

/**
 * Can the admin send notifications to a specific scope?
 *
 * Rules:
 * - Staff Super Admin & Admin: Can send to anyone
 * - Regional Leader (membership): Can only send to their referral tree or specific users
 */
export function canSendNotificationTo(
  staffRole: StaffRole | null | undefined,
  membershipRole: MembershipRole | null | undefined,
  scope: NotificationScope
): boolean {
  // Staff admins can send to anyone
  if (isStaffAdmin(staffRole)) {
    return true;
  }

  // Regional leaders (by membership) can only send to their tree or specific users
  if (isRegionalLeaderOnly(staffRole, membershipRole)) {
    return scope === 'referral_tree' || scope === 'user';
  }

  return false;
}

/**
 * Get list of staff roles that admin can assign
 */
export function getAssignableStaffRoles(adminStaffRole: StaffRole | null | undefined): StaffRole[] {
  if (isStaffSuperAdmin(adminStaffRole)) {
    return ['none', 'news_editor', 'admin', 'super_admin'];
  }

  if (adminStaffRole === 'admin') {
    // Cannot assign super_admin
    return ['none', 'news_editor', 'admin'];
  }

  // Regional leaders cannot assign staff roles
  return [];
}

/**
 * @deprecated Use getAssignableStaffRoles() instead
 * Get list of roles that admin can assign
 */
export function getAssignableRoles(adminRole: UserRole | StaffRole): UserRole[] {
  if (isSuperAdmin(adminRole)) {
    return [
      'free_viewer',
      'prospect',
      'silent_member',
      'full_member',
      'group_leader',
      'regional_leader',
      'admin',
      'super_admin',
    ];
  }

  if (adminRole === 'admin') {
    return [
      'free_viewer',
      'prospect',
      'silent_member',
      'full_member',
      'group_leader',
      'regional_leader',
      'admin',
      // Cannot assign super_admin
    ];
  }

  // Regional leaders cannot assign roles
  return [];
}
