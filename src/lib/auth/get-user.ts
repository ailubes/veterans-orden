import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMobileUser, isMobileRequest, MobileAuthResult } from '@/lib/supabase/mobile-auth';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>;
  isMobile: boolean;
  error: string | null;
}

type UserProfile = {
  id: string;
  auth_id: string | null;
  role: string | null;
  staff_role: string | null;
};

export function getEffectiveAdminRole(profile: UserProfile | null): string | null {
  if (!profile) return null;
  if (profile.staff_role && profile.staff_role !== 'none') {
    return profile.staff_role;
  }
  return profile.role;
}

/**
 * Unified authentication helper that works for both:
 * - Web requests (cookie-based authentication)
 * - Mobile requests (Bearer token authentication)
 *
 * Usage in API routes:
 * ```typescript
 * export async function GET(request: Request) {
 *   const { user, supabase, error } = await getAuthenticatedUser(request);
 *   if (!user) {
 *     return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
 *   }
 *   // Use supabase client for queries...
 * }
 * ```
 */
export async function getAuthenticatedUser(request: Request | NextRequest): Promise<AuthResult> {
  // Check if this is a mobile request (has Bearer token)
  if (isMobileRequest(request)) {
    const mobileResult: MobileAuthResult = await getMobileUser(request);
    return {
      user: mobileResult.user,
      supabase: mobileResult.supabase,
      isMobile: true,
      error: mobileResult.error,
    };
  }

  // Fall back to cookie-based authentication for web
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      supabase,
      isMobile: false,
      error: error?.message || null,
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      user_metadata: user.user_metadata,
    },
    supabase,
    isMobile: false,
    error: null,
  };
}

/**
 * Get user with profile data from database
 * Useful for routes that need user role information
 */
export async function getAuthenticatedUserWithProfile(request: Request | NextRequest) {
  const authResult = await getAuthenticatedUser(request);

  if (!authResult.user) {
    return {
      ...authResult,
      profile: null,
    };
  }

  // Get user profile from database by auth_id (primary mapping)
  const { data: profileByAuthId, error: profileByAuthIdError } = await authResult.supabase
    .from('users')
    .select('*')
    .eq('auth_id', authResult.user.id)
    .single();

  if (profileByAuthIdError && profileByAuthIdError.code !== 'PGRST116') {
    console.error('Error fetching user profile by auth_id:', profileByAuthIdError);
  }

  let profile = profileByAuthId;

  // Backward compatibility: some records use auth UUID as users.id without auth_id set
  if (!profile) {
    const { data: profileById, error: profileByIdError } = await authResult.supabase
      .from('users')
      .select('*')
      .eq('id', authResult.user.id)
      .single();

    if (profileByIdError && profileByIdError.code !== 'PGRST116') {
      console.error('Error fetching user profile by id fallback:', profileByIdError);
    }

    profile = profileById || null;
  }

  return {
    ...authResult,
    profile: profile || null,
  };
}

/**
 * Check if user has admin privileges (admin or super_admin role)
 */
export async function requireAdminUser(request: Request | NextRequest) {
  const result = await getAuthenticatedUserWithProfile(request);

  if (!result.user) {
    return {
      ...result,
      isAdmin: false,
      error: result.error || 'Unauthorized',
    };
  }

  const effectiveAdminRole = getEffectiveAdminRole(result.profile);
  const isAdmin = !!effectiveAdminRole && ['admin', 'super_admin'].includes(effectiveAdminRole);

  return {
    ...result,
    isAdmin,
    error: isAdmin ? null : 'Admin access required',
  };
}

/**
 * Check if user has super admin privileges
 */
export async function requireSuperAdminUser(request: Request | NextRequest) {
  const result = await getAuthenticatedUserWithProfile(request);

  if (!result.user) {
    return {
      ...result,
      isSuperAdmin: false,
      error: result.error || 'Unauthorized',
    };
  }

  const effectiveAdminRole = getEffectiveAdminRole(result.profile);
  const isSuperAdmin = effectiveAdminRole === 'super_admin';

  return {
    ...result,
    isSuperAdmin,
    error: isSuperAdmin ? null : 'Super admin access required',
  };
}
