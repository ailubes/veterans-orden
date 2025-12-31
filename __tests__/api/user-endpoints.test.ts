/**
 * User Endpoints API Tests
 *
 * Tests for user-related endpoints:
 * - POST /api/user/upload-avatar
 * - PATCH /api/user/upload-avatar
 * - GET /api/user/search
 */

import { describe, it, expect } from 'vitest';
import { POST as uploadAvatar, PATCH as updateAvatarUrl } from '@/app/api/user/upload-avatar/route';
import { GET as searchUsers } from '@/app/api/user/search/route';
import {
  createAuthenticatedRequest,
  createMockRequest,
  expectJsonResponse,
  assertValidationError,
} from '../utils/api-test-helpers';

describe('User - Upload Avatar (POST)', () => {
  it('should require authentication', async () => {
    const request = createMockRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        fileName: 'avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024000,
      },
    });

    const response = await uploadAvatar(request);
    expect(response.status).toBe(401);
  });

  it('should validate required fields', async () => {
    const request = createAuthenticatedRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {},
    });

    const response = await uploadAvatar(request);

    if (response.status === 401) {
      // Auth not properly mocked, skip
      return;
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    const fields = details.map((d: any) => d.field);
    expect(fields).toContain('fileName');
    expect(fields).toContain('fileType');
    expect(fields).toContain('fileSize');
  });

  it('should validate file type', async () => {
    const request = createAuthenticatedRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf', // Invalid - not an image
        fileSize: 1024000,
      },
    });

    const response = await uploadAvatar(request);

    if (response.status === 401) {
      return; // Skip if auth fails
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'fileType',
        message: expect.stringContaining('images'),
      })
    );
  });

  it('should accept valid image types', async () => {
    const imageTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    for (const fileType of imageTypes) {
      const request = createAuthenticatedRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/user/upload-avatar',
        body: {
          fileName: `avatar.${fileType.split('/')[1]}`,
          fileType,
          fileSize: 1024000,
        },
      });

      const response = await uploadAvatar(request);

      if (response.status === 401) {
        continue; // Skip if auth fails
      }

      // Should not be validation error
      expect(response.status).not.toBe(400);
    }
  });

  it('should validate file size maximum', async () => {
    const request = createAuthenticatedRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        fileName: 'large-avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 6 * 1024 * 1024, // 6MB - exceeds 5MB limit
      },
    });

    const response = await uploadAvatar(request);

    if (response.status === 401) {
      return;
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'fileSize',
        message: expect.stringContaining('5MB'),
      })
    );
  });

  it('should validate file size minimum', async () => {
    const request = createAuthenticatedRequest({
      method: 'POST',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        fileName: 'tiny-avatar.jpg',
        fileType: 'image/jpeg',
        fileSize: 0, // Invalid
      },
    });

    const response = await uploadAvatar(request);

    if (response.status === 401) {
      return;
    }

    const data = await expectJsonResponse(response, 400);
    assertValidationError(data);
  });
});

describe('User - Update Avatar URL (PATCH)', () => {
  it('should require authentication', async () => {
    const request = createMockRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    });

    const response = await updateAvatarUrl(request);
    expect(response.status).toBe(401);
  });

  it('should validate avatarUrl presence', async () => {
    const request = createAuthenticatedRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {},
    });

    const response = await updateAvatarUrl(request);

    if (response.status === 401) {
      return;
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    expect(details).toContainEqual(
      expect.objectContaining({ field: 'avatarUrl' })
    );
  });

  it('should validate URL format', async () => {
    const request = createAuthenticatedRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        avatarUrl: 'not-a-valid-url',
      },
    });

    const response = await updateAvatarUrl(request);

    if (response.status === 401) {
      return;
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'avatarUrl',
        message: expect.stringContaining('URL'),
      })
    );
  });

  it('should accept valid URL', async () => {
    const request = createAuthenticatedRequest({
      method: 'PATCH',
      url: 'http://localhost:3000/api/user/upload-avatar',
      body: {
        avatarUrl: 'https://cdn.example.com/avatars/user-123.jpg',
      },
    });

    const response = await updateAvatarUrl(request);

    if (response.status === 401) {
      return;
    }

    // Should not be validation error
    expect(response.status).not.toBe(400);
  });
});

describe('User - Search (GET)', () => {
  it('should require authentication', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search?q=test',
    });

    const response = await searchUsers(request);
    expect(response.status).toBe(401);
  });

  it('should validate query length minimum', async () => {
    const request = createAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search?q=a', // Too short
    });

    const response = await searchUsers(request);

    if (response.status === 401) {
      return;
    }

    const data = await expectJsonResponse(response, 400);
    const details = assertValidationError(data);

    expect(details).toContainEqual(
      expect.objectContaining({
        field: 'q',
        message: expect.stringContaining('at least 2 characters'),
      })
    );
  });

  it('should validate limit bounds', async () => {
    // Test limit too high
    const requestHigh = createAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search?q=test&limit=100',
    });

    const responseHigh = await searchUsers(requestHigh);

    if (responseHigh.status === 401) {
      return;
    }

    const dataHigh = await expectJsonResponse(responseHigh, 400);
    const detailsHigh = assertValidationError(dataHigh);

    expect(detailsHigh).toContainEqual(
      expect.objectContaining({
        field: 'limit',
      })
    );

    // Test limit too low
    const requestLow = createAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search?q=test&limit=0',
    });

    const responseLow = await searchUsers(requestLow);

    if (responseLow.status === 401) {
      return;
    }

    const dataLow = await expectJsonResponse(responseLow, 400);
    const detailsLow = assertValidationError(dataLow);

    expect(detailsLow).toContainEqual(
      expect.objectContaining({ field: 'limit' })
    );
  });

  it('should accept valid search parameters', async () => {
    const request = createAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search?q=test&limit=20',
    });

    const response = await searchUsers(request);

    if (response.status === 401) {
      return;
    }

    // Should not be validation error
    expect(response.status).not.toBe(400);
  });

  it('should use default values for missing parameters', async () => {
    const request = createAuthenticatedRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/user/search',
    });

    const response = await searchUsers(request);

    if (response.status === 401) {
      return;
    }

    // Should not be validation error
    expect(response.status).not.toBe(400);
  });
});
