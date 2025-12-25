'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, NotificationsResponse } from '@/types/notifications';

interface UseNotificationsOptions {
  pollInterval?: number;
  autoFetch?: boolean;
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  fetchNotifications: (page?: number, filter?: 'all' | 'unread') => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  currentPage: number;
  totalPages: number;
  total: number;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    pollInterval = 30000,
    autoFetch = true,
    limit = 20,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const currentFilter = useRef<'all' | 'unread'>('all');
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(async (
    page: number = 1,
    filter: 'all' | 'unread' = 'all'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      currentFilter.current = filter;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter,
      });

      const response = await fetch(`/api/members/notifications?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationsResponse = await response.json();

      if (isMounted.current) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [limit]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response = await fetch(`/api/members/notifications/${id}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      if (isMounted.current) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      // Revert on error
      await fetchNotifications(currentPage, currentFilter.current);
      console.error('Error marking notification as read:', err);
    }
  }, [currentPage, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);

      const response = await fetch('/api/members/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      const data = await response.json();
      if (isMounted.current) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      // Revert on error
      await fetchNotifications(currentPage, currentFilter.current);
      console.error('Error marking all notifications as read:', err);
    }
  }, [currentPage, fetchNotifications]);

  const refetch = useCallback(async () => {
    await fetchNotifications(currentPage, currentFilter.current);
  }, [currentPage, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;

    if (autoFetch) {
      fetchNotifications();
    }

    return () => {
      isMounted.current = false;
    };
  }, [autoFetch, fetchNotifications]);

  // Polling for new notifications
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      // Only poll for unread count, not full list
      fetch('/api/members/notifications?limit=1')
        .then(res => res.json())
        .then((data: NotificationsResponse) => {
          if (isMounted.current) {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {
          // Silently fail on polling errors
        });
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refetch,
    currentPage,
    totalPages,
    total,
  };
}
