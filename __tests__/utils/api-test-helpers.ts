/**
 * API Test Helpers
 *
 * Utilities for testing Next.js API routes with proper authentication,
 * database mocking, and response validation.
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
    cookies = {},
  } = options;

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    init.body = JSON.stringify(body);
  }

  const request = new NextRequest(url, init);

  // Add cookies
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value);
  });

  return request;
}

/**
 * Create authenticated request with mock Supabase session
 */
export function createAuthenticatedRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  userId?: string;
  userEmail?: string;
  accessToken?: string;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    userId = 'test-user-123',
    userEmail = 'test@example.com',
    accessToken = 'mock-access-token',
  } = options;

  return createMockRequest({
    method,
    url,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cookies: {
      'sb-access-token': accessToken,
      'sb-refresh-token': 'mock-refresh-token',
    },
  });
}

/**
 * Assert response status and parse JSON
 */
export async function expectJsonResponse(
  response: Response,
  expectedStatus: number
): Promise<any> {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}. Body: ${body}`
    );
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return response.json();
}

/**
 * Assert validation error response structure
 */
export function assertValidationError(data: any) {
  if (data.error !== 'Validation failed') {
    throw new Error(`Expected validation error but got: ${JSON.stringify(data)}`);
  }

  if (data.code !== 'VALIDATION_ERROR') {
    throw new Error(`Expected VALIDATION_ERROR code but got: ${data.code}`);
  }

  if (!Array.isArray(data.details)) {
    throw new Error('Expected details array in validation error');
  }

  return data.details;
}

/**
 * Assert successful response
 */
export function assertSuccess(data: any, message?: string) {
  if (!data.success && data.error) {
    throw new Error(message || `Expected success but got error: ${data.error}`);
  }
}

/**
 * Mock Supabase client for testing
 */
export function createMockSupabaseClient() {
  const mockData: Record<string, any> = {};

  return {
    // Auth methods
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@example.com' } },
        error: null,
      }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },

    // Database methods
    from: (table: string) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockData[table], error: null }),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    }),

    // RPC methods
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),

    // Storage methods
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
      }),
    },

    // Helper to set mock data
    __setMockData: (table: string, data: any) => {
      mockData[table] = data;
    },
  };
}

/**
 * Test data factories
 */
export const factories = {
  user: (overrides?: Partial<any>) => ({
    id: 'user-123',
    clerk_id: 'clerk-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'free_viewer',
    status: 'active',
    points: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  }),

  event: (overrides?: Partial<any>) => ({
    id: 'event-123',
    title: 'Test Event',
    description: 'Test event description',
    event_type: 'meeting',
    start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_date: new Date(Date.now() + 90000000).toISOString(),
    status: 'active',
    created_by: 'user-123',
    going_count: 0,
    maybe_count: 0,
    ...overrides,
  }),

  vote: (overrides?: Partial<any>) => ({
    id: 'vote-123',
    title: 'Test Vote',
    description: 'Test vote description',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    total_votes: 0,
    eligible_roles: ['free_viewer', 'active_member'],
    ...overrides,
  }),
};

/**
 * Delay helper for async tests
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
