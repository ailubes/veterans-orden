/**
 * Mobile Authentication API Tests
 *
 * Tests for mobile auth endpoints:
 * - POST /api/mobile/auth/sign-in
 * - POST /api/mobile/auth/sign-up
 * - POST /api/mobile/auth/refresh
 * - POST /api/mobile/auth/2fa/verify
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { POST as signIn } from '@/app/api/mobile/auth/sign-in/route';
import { POST as signUp } from '@/app/api/mobile/auth/sign-up/route';
import { POST as refresh } from '@/app/api/mobile/auth/refresh/route';
import { POST as verify2FA } from '@/app/api/mobile/auth/2fa/verify/route';
import {
  createMockRequest,
  expectJsonResponse,
  assertValidationError,
} from '../utils/api-test-helpers';

describe('Mobile Auth - Sign In', () => {
  it('should validate required fields', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-in',
      body: {},
    });

    const response = await signIn(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
    expect(details).toContainEqual(
      expect.objectContaining({ field: 'password' })
    );
  });

  it('should validate email format', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-in',
      body: {
        email: 'invalid-email',
        password: 'password123',
      },
    });

    const response = await signIn(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'email',
        message: expect.stringContaining('Invalid email'),
      })
    );
  });

  it('should validate password length', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-in',
      body: {
        email: 'test@example.com',
        password: 'short',
      },
    });

    const response = await signIn(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'password',
        message: expect.stringContaining('at least 8 characters'),
      })
    );
  });

  it('should validate 2FA code format when provided', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-in',
      body: {
        email: 'test@example.com',
        password: 'password123',
        two_factor_code: '123', // Invalid - must be 6 digits
      },
    });

    const response = await signIn(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'two_factor_code',
        message: expect.stringContaining('6 digits'),
      })
    );
  });

  it('should accept valid sign-in request', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-in',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    // This will fail auth but should pass validation
    const response = await signIn(request);

    // Should return 401 (invalid credentials) not 400 (validation error)
    expect(response.status).toBe(401);
  });
});

describe('Mobile Auth - Sign Up', () => {
  it('should validate required fields', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-up',
      body: {},
    });

    const response = await signUp(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details.length).toBeGreaterThan(0);

    const fields = details.map((d: any) => d.field);
    expect(fields).toContain('email');
    expect(fields).toContain('password');
    expect(fields).toContain('first_name');
    expect(fields).toContain('last_name');
  });

  it('should validate email format', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-up',
      body: {
        email: 'not-an-email',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      },
    });

    const response = await signUp(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({ field: 'email' })
    );
  });

  it('should validate name lengths', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-up',
      body: {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'A', // Too short
        last_name: 'B', // Too short
      },
    });

    const response = await signUp(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'first_name',
        message: expect.stringContaining('at least 2 characters'),
      })
    );
  });

  it('should validate phone format when provided', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-up',
      body: {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '123456789', // Invalid format
      },
    });

    const response = await signUp(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'phone',
        message: expect.stringContaining('+380'),
      })
    );
  });

  it('should accept valid Ukrainian phone number', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/sign-up',
      body: {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '+380501234567',
      },
    });

    const response = await signUp(request);

    // Should not be validation error (400), will be other error
    expect(response.status).not.toBe(400);
  });
});

describe('Mobile Auth - Refresh Token', () => {
  it('should validate refresh_token presence', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/refresh',
      body: {},
    });

    const response = await refresh(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({ field: 'refresh_token' })
    );
  });

  it('should reject empty refresh_token', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/refresh',
      body: {
        refresh_token: '',
      },
    });

    const response = await refresh(request);
    const data = await expectJsonResponse(response, 400);

    assertValidationError(data);
  });

  it('should accept non-empty refresh_token', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/refresh',
      body: {
        refresh_token: 'some-token-value',
      },
    });

    const response = await refresh(request);

    // Should not be validation error
    expect(response.status).not.toBe(400);
  });
});

describe('Mobile Auth - 2FA Verification', () => {
  it('should validate required fields', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/2fa/verify',
      body: {},
    });

    const response = await verify2FA(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    const fields = details.map((d: any) => d.field);

    expect(fields).toContain('factor_id');
    expect(fields).toContain('code');
    expect(fields).toContain('challenge_id');
  });

  it('should validate 2FA code format', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/2fa/verify',
      body: {
        factor_id: 'factor-123',
        code: '123', // Invalid - must be 6 digits
        challenge_id: 'challenge-123',
      },
    });

    const response = await verify2FA(request);
    const data = await expectJsonResponse(response, 400);

    const details = assertValidationError(data);
    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'code',
        message: expect.stringContaining('6 digits'),
      })
    );
  });

  it('should accept valid 6-digit code', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/mobile/auth/2fa/verify',
      body: {
        factor_id: 'factor-123',
        code: '123456',
        challenge_id: 'challenge-123',
      },
    });

    const response = await verify2FA(request);

    // Should not be validation error
    expect(response.status).not.toBe(400);
  });
});
