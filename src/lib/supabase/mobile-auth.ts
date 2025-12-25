import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface MobileAuthResult {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  } | null;
  supabase: ReturnType<typeof createSupabaseClient>;
  error: string | null;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: Request | NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}

/**
 * Check if request has Bearer token (mobile) vs cookies (web)
 */
export function isMobileRequest(request: Request | NextRequest): boolean {
  return extractBearerToken(request) !== null;
}

/**
 * Get user from Bearer token for mobile requests
 */
export async function getMobileUser(request: Request | NextRequest): Promise<MobileAuthResult> {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      user: null,
      supabase: createSupabaseClient(supabaseUrl, supabaseAnonKey),
      error: 'No Bearer token provided',
    };
  }

  // Create a Supabase client with the user's JWT
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Verify the token and get user
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      supabase,
      error: error?.message || 'Invalid token',
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      user_metadata: user.user_metadata,
    },
    supabase,
    error: null,
  };
}

/**
 * Sign in with email/password and return tokens for mobile
 */
export async function createMobileSession(
  email: string,
  password: string
): Promise<{ data: TokenResponse | null; error: string | null }> {
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return {
      data: null,
      error: error?.message || 'Authentication failed',
    };
  }

  return {
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      token_type: 'bearer',
      user: {
        id: data.user.id,
        email: data.user.email!,
      },
    },
    error: null,
  };
}

/**
 * Sign up with email/password and return tokens for mobile
 */
export async function createMobileAccount(
  email: string,
  password: string,
  metadata?: { first_name?: string; last_name?: string }
): Promise<{ data: TokenResponse | null; error: string | null; needsConfirmation?: boolean }> {
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  // Check if email confirmation is required
  if (!data.session) {
    return {
      data: null,
      error: null,
      needsConfirmation: true,
    };
  }

  return {
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      token_type: 'bearer',
      user: {
        id: data.user!.id,
        email: data.user!.email!,
      },
    },
    error: null,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshMobileToken(
  refreshToken: string
): Promise<{ data: TokenResponse | null; error: string | null }> {
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return {
      data: null,
      error: error?.message || 'Failed to refresh token',
    };
  }

  return {
    data: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at,
      token_type: 'bearer',
      user: {
        id: data.user!.id,
        email: data.user!.email!,
      },
    },
    error: null,
  };
}

/**
 * Sign out and invalidate the session (requires service role for server-side)
 */
export async function signOutMobile(userId: string): Promise<{ error: string | null }> {
  // Use service role key to sign out user
  const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await adminClient.auth.admin.signOut(userId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Verify 2FA code for mobile sign-in
 * Returns new tokens if verification succeeds
 */
export async function verifyMobile2FA(
  factorId: string,
  code: string,
  challengeId: string
): Promise<{ data: TokenResponse | null; error: string | null }> {
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error || !data) {
    return {
      data: null,
      error: error?.message || '2FA verification failed',
    };
  }

  // After MFA verification, get the session
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    return {
      data: null,
      error: 'Failed to get session after 2FA',
    };
  }

  return {
    data: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_in: sessionData.session.expires_in,
      expires_at: sessionData.session.expires_at,
      token_type: 'bearer',
      user: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email!,
      },
    },
    error: null,
  };
}
