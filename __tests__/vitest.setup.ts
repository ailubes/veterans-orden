import { vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

function createMockSupabase() {
  return {
    from: (table: string) => {
      const query = {
        select: () => query,
        or: () => query,
        neq: () => query,
        eq: () => query,
        single: async () => ({
          data: table === 'users' ? { id: 'profile-test-id' } : null,
          error: null,
        }),
        limit: async () => ({
          data: [],
          error: null,
        }),
      };

      return {
        ...query,
        update: () => ({
          eq: async () => ({ error: null }),
        }),
      };
    },
  };
}

vi.mock('@/lib/auth/get-user', () => ({
  getAuthenticatedUser: async (request: Request) => {
    const hasBearer = !!request.headers.get('Authorization')?.startsWith('Bearer ');
    return {
      user: hasBearer ? { id: 'auth-test-id', email: 'test@example.com' } : null,
      supabase: createMockSupabase(),
      isMobile: hasBearer,
      error: hasBearer ? null : 'Unauthorized',
    };
  },
}));

vi.mock('@/lib/supabase/mobile-auth', () => ({
  createMobileSession: async () => ({ data: null, error: 'Authentication failed' }),
  createMobileAccount: async () => ({ data: null, error: null, needsConfirmation: true }),
  refreshMobileToken: async () => ({ data: null, error: 'Failed to refresh token' }),
  verifyMobile2FA: async () => ({ data: null, error: '2FA verification failed' }),
  getMobileUser: async () => ({
    user: { id: 'auth-test-id', email: 'test@example.com' },
    supabase: createMockSupabase(),
    error: null,
  }),
  isMobileRequest: (request: Request) =>
    !!request.headers.get('Authorization')?.startsWith('Bearer '),
  extractBearerToken: (request: Request) => {
    const value = request.headers.get('Authorization');
    if (!value?.startsWith('Bearer ')) return null;
    return value.slice(7);
  },
}));

vi.mock('@/lib/storage/s3-storage', () => ({
  generatePresignedUploadUrl: async () => ({
    uploadUrl: 'https://example-bucket.s3.amazonaws.com/mock-upload',
    publicUrl: 'https://cdn.example.com/mock-avatar.jpg',
    s3Key: 'user_avatar/mock-avatar.jpg',
  }),
}));
