/**
 * Permission System for Admin Panel
 *
 * Handles role-based access control and regional leader scoping.
 * Regional leaders can only see/manage members in their referral tree.
 *
 * Role hierarchy:
 * free_viewer < prospect < silent_member < full_member <
 * group_leader < regional_leader < admin < super_admin
 */

import { createClient } from '@/lib/supabase/server';

export type UserRole =
  | 'free_viewer'
  | 'prospect'
  | 'silent_member'
  | 'full_member'
  | 'group_leader'
  | 'regional_leader'
  | 'admin'
  | 'super_admin';

export interface AdminProfile {
  id: string;
  clerk_id: string;
  role: UserRole;
  email: string;
  first_name: string;
  last_name: string;
}

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
 * Check if a user (regional leader) has access to a specific member
 * by checking if the member is in their referral tree
 */
export async function checkReferralTreeAccess(
  regionalLeaderId: string,
  targetUserId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get all members in the regional leader's referral tree
  const { data, error } = await supabase.rpc('get_referral_tree', {
    root_user_id: regionalLeaderId,
  });

  if (error) {
    console.error('[Permission Check Error]', error);
    return false;
  }

  // Check if target user is in the tree
  return data?.some((member: { id: string }) => member.id === targetUserId) || false;
}

/**
 * Get admin profile for current user
 * Returns null if user is not authenticated or not an admin
 */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, clerk_id, role, email, first_name, last_name')
    .eq('clerk_id', user.id)
    .single();

  if (!profile || !isAdmin(profile.role as UserRole)) {
    return null;
  }

  return profile as AdminProfile;
}

/**
 * Check if admin can manage (edit/delete) a specific entity
 *
 * Rules:
 * - Super Admin: Can manage anything
 * - Admin: Can manage anything except cannot assign super_admin role
 * - Regional Leader: Can only manage entities they created or members in their tree
 */
export async function canManageEntity(
  adminProfile: AdminProfile,
  entityType: 'member' | 'event' | 'vote' | 'task' | 'news',
  entity: {
    id: string;
    created_by?: string;
    organizer_id?: string;
  }
): Promise<boolean> {
  // Super admin and admin can manage everything
  if (isSuperAdmin(adminProfile.role) || adminProfile.role === 'admin') {
    return true;
  }

  // Regional leader checks
  if (isRegionalLeader(adminProfile.role)) {
    // For members, check if in referral tree
    if (entityType === 'member') {
      return await checkReferralTreeAccess(adminProfile.id, entity.id);
    }

    // For other entities, check if they created it
    const creatorId = entity.created_by || entity.organizer_id;
    return creatorId === adminProfile.id;
  }

  return false;
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

/**
 * Can the admin send notifications to a specific scope?
 *
 * Rules:
 * - Super Admin & Admin: Can send to anyone
 * - Regional Leader: Can only send to their referral tree
 */
export function canSendNotificationTo(
  adminRole: UserRole,
  scope: 'user' | 'role' | 'oblast' | 'group' | 'referral_tree'
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

/**
 * Filter query for regional leaders
 * Returns SQL filter to apply to queries for regional leader scoping
 */
export async function getRegionalLeaderFilter(
  adminProfile: AdminProfile
): Promise<{ filterType: 'all' | 'referral_tree'; userIds?: string[] }> {
  if (isSuperAdmin(adminProfile.role) || adminProfile.role === 'admin') {
    return { filterType: 'all' };
  }

  if (isRegionalLeader(adminProfile.role)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc('get_referral_tree', {
      root_user_id: adminProfile.id,
    });

    const userIds = data?.map((member: { id: string }) => member.id) || [];
    return { filterType: 'referral_tree', userIds };
  }

  return { filterType: 'all' };
}
