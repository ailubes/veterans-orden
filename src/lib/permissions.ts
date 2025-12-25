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
import { getAuthenticatedUser, type AuthResult } from '@/lib/auth/get-user';
import {
  type UserRole,
  isAdmin,
  isSuperAdmin,
  isRegionalLeader,
} from '@/lib/permissions-utils';

// Re-export types and utility functions from permissions-utils
// This allows server components to import from this file
// while client components can import from permissions-utils
export type { UserRole } from '@/lib/permissions-utils';

export {
  isAdmin,
  isSuperAdmin,
  isRegionalLeader,
  canChangeRole,
  canSuspendMembers,
  canImpersonate,
  canAccessSystemSettings,
  canSendNotificationTo,
  getAssignableRoles,
} from '@/lib/permissions-utils';

export interface AdminProfile {
  id: string;
  clerk_id: string;
  role: UserRole;
  email: string;
  first_name: string;
  last_name: string;
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
    .select('id, clerk_id, role, email, first_name, last_name')
    .eq('clerk_id', user.id)
    .single();

  if (!profile || !isAdmin(profile.role as UserRole)) {
    return null;
  }

  return profile as AdminProfile;
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
    .select('id, clerk_id, role, email, first_name, last_name')
    .eq('clerk_id', auth.user.id)
    .single();

  if (!profile || !isAdmin(profile.role as UserRole)) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return { profile: profile as AdminProfile, auth };
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
