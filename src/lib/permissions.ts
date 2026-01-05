/**
 * Permission System for Admin Panel
 *
 * Handles role-based access control and regional leader scoping.
 *
 * Two-tier role system:
 * 1. StaffRole (staff_role) - Administrative access (none, news_editor, admin, super_admin)
 * 2. MembershipRole (membership_role) - Network progression (supporter → network_guide)
 *
 * Admin panel access:
 * - Staff admins (admin/super_admin): Full system access
 * - Regional leaders (membership): Limited to their referral tree
 */

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedUser, type AuthResult } from '@/lib/auth/get-user';
import type { MembershipRole } from '@/lib/constants';
import {
  type StaffRole,
  type UserRole,
  isStaffAdmin,
  isStaffSuperAdmin,
  hasAdminAccess,
  isRegionalLeaderOnly,
  // Legacy re-exports for backwards compatibility
  isAdmin,
  isSuperAdmin,
  isRegionalLeader,
} from '@/lib/permissions-utils';

// Re-export types and utility functions from permissions-utils
export type { UserRole, StaffRole } from '@/lib/permissions-utils';

export {
  isAdmin,
  isSuperAdmin,
  isRegionalLeader,
  isStaffAdmin,
  isStaffSuperAdmin,
  isNewsEditor,
  hasAdminAccess,
  isRegionalLeaderOnly,
  canChangeRole,
  canSuspendMembers,
  canImpersonate,
  canAccessSystemSettings,
  canSendNotificationTo,
  getAssignableRoles,
  getAssignableStaffRoles,
} from '@/lib/permissions-utils';

export interface AdminProfile {
  id: string;
  auth_id: string;
  staff_role: StaffRole;
  membership_role: MembershipRole;
  email: string;
  first_name: string;
  last_name: string;
  // Legacy field - kept for backwards compatibility during migration
  role?: UserRole;
}


/**
 * Check if a user (regional leader) has access to a specific member
 * by checking if the member is in their referral tree
 * @param supabaseClient Optional supabase client (for mobile auth support)
 */
export async function checkReferralTreeAccess(
  regionalLeaderId: string,
  targetUserId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient?: any
): Promise<boolean> {
  const supabase = supabaseClient || await createClient();

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
 * @deprecated Use getAdminProfileFromRequest for API routes
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
    .select('id, auth_id, staff_role, membership_role, role, email, first_name, last_name')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  // Check if user has admin access (either staff admin or regional leader by membership)
  const staffRole = (profile.staff_role || 'none') as StaffRole;
  const membershipRole = (profile.membership_role || 'supporter') as MembershipRole;

  if (!hasAdminAccess(staffRole, membershipRole)) {
    return null;
  }

  return {
    id: profile.id,
    auth_id: profile.auth_id,
    staff_role: staffRole,
    membership_role: membershipRole,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    role: profile.role as UserRole, // Legacy field
  };
}

/**
 * Get admin profile from request (supports both web and mobile auth)
 * Returns admin profile and supabase client for further queries
 * Throws an error response if user is not authenticated or not an admin
 */
export async function getAdminProfileFromRequest(
  request: Request
): Promise<{ profile: AdminProfile; auth: AuthResult }> {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: profile } = await auth.supabase
    .from('users')
    .select('id, auth_id, staff_role, membership_role, role, email, first_name, last_name')
    .eq('auth_id', auth.user.id)
    .single();

  if (!profile) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const staffRole = (profile.staff_role || 'none') as StaffRole;
  const membershipRole = (profile.membership_role || 'supporter') as MembershipRole;

  if (!hasAdminAccess(staffRole, membershipRole)) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const adminProfile: AdminProfile = {
    id: profile.id,
    auth_id: profile.auth_id,
    staff_role: staffRole,
    membership_role: membershipRole,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    role: profile.role as UserRole, // Legacy field
  };

  return { profile: adminProfile, auth };
}

/**
 * Check if admin can manage (edit/delete) a specific entity
 *
 * Rules:
 * - Staff Admin (admin/super_admin): Can manage anything
 * - Regional Leader (by membership): Can only manage entities they created or members in their tree
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
  // Staff admins can manage everything
  if (isStaffAdmin(adminProfile.staff_role)) {
    return true;
  }

  // Regional leaders (by membership only) - limited to their region
  if (isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)) {
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
 * Filter query for regional leaders
 * Returns SQL filter to apply to queries for regional leader scoping
 */
export async function getRegionalLeaderFilter(
  adminProfile: AdminProfile
): Promise<{ filterType: 'all' | 'referral_tree'; userIds?: string[] }> {
  // Staff admins see everything
  if (isStaffAdmin(adminProfile.staff_role)) {
    return { filterType: 'all' };
  }

  // Regional leaders (by membership) only see their referral tree
  if (isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc('get_referral_tree', {
      root_user_id: adminProfile.id,
    });

    const userIds = data?.map((member: { id: string }) => member.id) || [];
    return { filterType: 'referral_tree', userIds };
  }

  return { filterType: 'all' };
}
