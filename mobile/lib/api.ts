/**
 * Typed fetch helpers for calling the Next.js API routes.
 *
 * All requests include the Supabase session Bearer token for mobile auth.
 * The web API routes already support Bearer token authentication via
 * src/lib/supabase/mobile-auth.ts.
 */

import { supabase } from './supabase';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL!;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${APP_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers || {}) },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Members ──────────────────────────────────────────────────────────────────

export const api = {
  me: {
    get: () => apiFetch<any>('/api/members/me'),
    getPoints: () => apiFetch<any>('/api/me/points'),
    update: (data: {
      firstName?: string; lastName?: string; city?: string; bio?: string;
      phone?: string; additionalPhone?: string;
      hasViber?: boolean; hasWhatsapp?: boolean; hasSignal?: boolean;
      facebookUrl?: string; education?: string; profession?: string;
      katottgCode?: string; settlementName?: string; hromadaName?: string;
      raionName?: string; oblastNameKatottg?: string;
    }) =>
      apiFetch<any>('/api/members/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  events: {
    list: () => apiFetch<{ events: any[] }>('/api/events'),
    rsvp: (id: string, status: 'going' | 'maybe' | 'not_going') =>
      apiFetch(`/api/events/${id}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
  },

  tasks: {
    list: () => apiFetch<{ tasks: any[] }>('/api/tasks'),
    complete: (id: string, report: string) =>
      apiFetch(`/api/tasks/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ report }),
      }),
  },

  votes: {
    list: () => apiFetch<{ votes: any[] }>('/api/votes'),
    cast: (id: string, optionId: string) =>
      apiFetch(`/api/votes/${id}/cast`, {
        method: 'POST',
        body: JSON.stringify({ option_id: optionId }),
      }),
  },

  resources: {
    list: (category?: string) =>
      apiFetch<{ resources: any[] }>(
        category ? `/api/resources?category=${category}` : '/api/resources'
      ),
  },

  notifications: {
    list: () => apiFetch<{ notifications: any[]; unreadCount: number }>('/api/members/notifications'),
    markRead: (id: string) =>
      apiFetch(`/api/members/notifications/${id}/read`, { method: 'POST' }),
  },

  challenges: {
    getAll: () => apiFetch<{ challenges: any[] }>('/api/challenges'),
  },

  pushToken: {
    register: (token: string) =>
      apiFetch('/api/user/push-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
  },

  // ── Social Network ───────────────────────────────────────────────────────────
  posts: {
    list: (cursor?: string, limit?: number, type?: string, userId?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());
      if (type) params.append('type', type);
      if (userId) params.append('userId', userId);
      return apiFetch<{ posts: any[]; nextCursor: string | null }>(`/api/posts?${params.toString()}`);
    },
    get: (id: string) => apiFetch<{ post: any }>(`/api/posts/${id}`),
    create: (data: { content: string; content_type?: string; media_urls?: string[]; link_preview?: any; visibility?: string }) =>
      apiFetch<{ post: any }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<{ content: string; media_urls: string[]; link_preview: any; visibility: string }>) =>
      apiFetch<{ post: any }>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),
    like: (id: string, reaction_type?: string) =>
      apiFetch(`/api/posts/${id}/like`, {
        method: 'POST',
        body: JSON.stringify({ reaction_type }),
      }),
    unlike: (id: string) =>
      apiFetch(`/api/posts/${id}/like`, { method: 'DELETE' }),
  },

  comments: {
    list: (postId: string) =>
      apiFetch<{ comments: any[] }>(`/api/posts/${postId}/comments`),
    create: (postId: string, content: string, parent_id?: string) =>
      apiFetch<{ comment: any }>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parent_id }),
      }),
    update: (id: string, content: string) =>
      apiFetch<{ comment: any }>(`/api/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),
    delete: (id: string) =>
      apiFetch(`/api/comments/${id}`, { method: 'DELETE' }),
    like: (id: string) =>
      apiFetch(`/api/comments/${id}/like`, { method: 'POST' }),
    unlike: (id: string) =>
      apiFetch(`/api/comments/${id}/like`, { method: 'DELETE' }),
    replies: (id: string) =>
      apiFetch<{ replies: any[] }>(`/api/comments/${id}/replies`),
  },

  follows: {
    follow: (userId: string) =>
      apiFetch(`/api/users/${userId}/follow`, { method: 'POST' }),
    unfollow: (userId: string) =>
      apiFetch(`/api/users/${userId}/follow`, { method: 'DELETE' }),
    followers: (userId?: string) =>
      apiFetch<{ followers: any[]; nextCursor: string | null }>(`/api/follows/followers?${userId ? `userId=${userId}` : ''}`),
    following: (userId?: string) =>
      apiFetch<{ following: any[]; nextCursor: string | null }>(`/api/follows/following?${userId ? `userId=${userId}` : ''}`),
  },

  feed: {
    get: (cursor?: string, limit?: number, type?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());
      if (type) params.append('type', type);
      return apiFetch<{ feed: any[]; nextCursor: string | null }>(`/api/feed?${params.toString()}`);
    },
  },

  community: {
    list: (filters?: { search?: string; unit?: string; city?: string; profession?: string; page?: number; limit?: number }) => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.unit) params.append('unit', filters.unit);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.profession) params.append('profession', filters.profession);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      return apiFetch<{ members: any[]; pagination: any }>(`/api/community?${params.toString()}`);
    },
  },

  users: {
    get: (id: string) =>
      apiFetch<{ profile: any }>(`/api/users/${id}`),
    posts: (id: string, cursor?: string) =>
      apiFetch<{ posts: any[]; nextCursor: string | null }>(`/api/users/${id}/posts?${cursor ? `cursor=${cursor}` : ''}`),
  },

  katottg: {
    search: (q: string) =>
      apiFetch<{ results: any[] }>(`/api/katottg?search=${encodeURIComponent(q)}`),
  },

  progression: {
    get: () => apiFetch<{ success: boolean; data: any }>('/api/user/progression'),
    celebrateMilestone: (id: string) =>
      apiFetch(`/api/user/milestones/${id}/celebrate`, { method: 'POST' }),
  },

  payments: {
    create: (tierId: string) =>
      apiFetch<{ hutkoToken?: string; orderId?: string }>('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({ tierId }),
      }),
  },

  messaging: {
    conversations: (page?: number) =>
      apiFetch<{ conversations: any[]; total: number; page: number; totalPages: number }>(
        `/api/messaging/conversations?page=${page || 1}`
      ),
    dm: (userId: string) =>
      apiFetch<{ conversation: any; created: boolean }>(`/api/messaging/dm/${userId}`),
    messages: (conversationId: string, cursor?: string) => {
      const params = cursor ? `?cursor=${cursor}` : '';
      return apiFetch<{ messages: any[]; hasMore: boolean; nextCursor?: string }>(
        `/api/messaging/conversations/${conversationId}/messages${params}`
      );
    },
    sendMessage: (conversationId: string, content: string) =>
      apiFetch<{ message: any }>(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, type: 'text' }),
      }),
    markRead: (messageId: string) =>
      apiFetch<{ success: boolean }>(`/api/messaging/messages/${messageId}/read`, { method: 'POST' }),
    unread: () =>
      apiFetch<{ totalUnread: number; byConversation: Record<string, number> }>('/api/messaging/unread'),
  },
};
