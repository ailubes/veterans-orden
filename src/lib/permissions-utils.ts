/**
 * Permission utility functions that can be used in both client and server components
 * These are pure functions without any server-side dependencies
 */

export type UserRole =
  | 'free_viewer'
  | 'prospect'
  | 'silent_member'
  | 'full_member'
  | 'group_leader'
  | 'regional_leader'
  | 'admin'
  | 'super_admin';

/**
 * Check if user has admin access (admin, super_admin, or regional_leader)
 */
export function isAdmin(role: UserRole): boolean {
  return ['admin', 'super_admin', 'regional_leader'].includes(role);
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

/**
 * Check if user is regional leader
 */
export function isRegionalLeader(role: UserRole): boolean {
  return role === 'regional_leader';
}

/**
 * Can the admin change role of a user?
 *
 * Rules:
 * - Super Admin: Can change any role
 * - Admin: Can change any role except super_admin
 * - Regional Leader: Cannot change roles
 */
export function canChangeRole(
  adminRole: UserRole,
  currentRole: UserRole,
  newRole: UserRole
): boolean {
  if (isSuperAdmin(adminRole)) {
    return true;
  }

  if (adminRole === 'admin') {
    // Admin cannot promote to super_admin or demote super_admins
    if (newRole === 'super_admin' || currentRole === 'super_admin') {
      return false;
    }
    return true;
  }

  // Regional leaders cannot change roles
  return false;
}

/**
 * Can the admin suspend/unsuspend users?
 *
 * Only super_admin and admin can suspend
 */
export function canSuspendMembers(adminRole: UserRole): boolean {
  return isSuperAdmin(adminRole) || adminRole === 'admin';
}

/**
 * Can the admin impersonate users?
 *
 * Only super_admin can impersonate
 */
export function canImpersonate(adminRole: UserRole): boolean {
  return isSuperAdmin(adminRole);
}

/**
 * Can the admin access system settings?
 *
 * Only super_admin can access system settings
 */
export function canAccessSystemSettings(adminRole: UserRole): boolean {
  return isSuperAdmin(adminRole);
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
 * - Super Admin & Admin: Can send to anyone
 * - Regional Leader: Can only send to their referral tree or specific users
 */
export function canSendNotificationTo(
  adminRole: UserRole,
  scope: NotificationScope
): boolean {
  if (isSuperAdmin(adminRole) || adminRole === 'admin') {
    return true;
  }

  if (isRegionalLeader(adminRole)) {
    // Regional leaders can only send to their referral tree or specific users in it
    return scope === 'referral_tree' || scope === 'user';
  }

  return false;
}

/**
 * Get list of roles that admin can assign
 */
export function getAssignableRoles(adminRole: UserRole): UserRole[] {
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
