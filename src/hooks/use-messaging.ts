'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Conversation,
  Message,
  ConversationsResponse,
  MessagesResponse,
  CreateConversationRequest,
  SendMessageRequest,
  UnreadCountResponse,
} from '@/types/messaging';

interface UseMessagingReturn {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  totalUnread: number;
  unreadByConversation: Record<string, number>;
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;

  // Actions
  fetchConversations: (page?: number) => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  fetchMessages: (conversationId: string, cursor?: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (conversationId: string, data: SendMessageRequest) => Promise<Message | null>;
  createConversation: (data: CreateConversationRequest) => Promise<Conversation | null>;
  getOrCreateDM: (userId: string) => Promise<Conversation | null>;
  editMessage: (messageId: string, content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  muteConversation: (conversationId: string, duration?: number) => Promise<void>;
  unmuteConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addLocalMessage: (message: Message) => void;
  updateLocalMessage: (messageId: string, updates: Partial<Message>) => void;
  removeLocalMessage: (messageId: string) => void;
}

export function useMessaging(): UseMessagingReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesCursor, setMessagesCursor] = useState<string | undefined>(undefined);

  const getAuthHeaders = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token || ''}`,
    };
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/conversations?page=${page}&limit=20`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data: ConversationsResponse = await response.json();

      if (page === 1) {
        setConversations(data.conversations);
      } else {
        setConversations((prev) => [...prev, ...data.conversations]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch single conversation
  const fetchConversation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/conversations/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setCurrentConversation(data.conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch messages
  const fetchMessages = useCallback(async (conversationId: string, cursor?: string) => {
    setMessagesLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const url = cursor
        ? `/api/messaging/conversations/${conversationId}/messages?cursor=${cursor}`
        : `/api/messaging/conversations/${conversationId}/messages`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: MessagesResponse = await response.json();

      if (cursor) {
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }

      setHasMoreMessages(data.hasMore);
      setMessagesCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setMessagesLoading(false);
    }
  }, [getAuthHeaders]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !hasMoreMessages || !messagesCursor) return;
    await fetchMessages(currentConversation.id, messagesCursor);
  }, [currentConversation, hasMoreMessages, messagesCursor, fetchMessages]);

  // Send message
  const sendMessage = useCallback(async (
    conversationId: string,
    data: SendMessageRequest
  ): Promise<Message | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to send message');
      }

      const result = await response.json();
      setMessages((prev) => [...prev, result.message]);
      return result.message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [getAuthHeaders]);

  // Create conversation
  const createConversation = useCallback(async (
    data: CreateConversationRequest
  ): Promise<Conversation | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create conversation');
      }

      const result = await response.json();
      setConversations((prev) => [result.conversation, ...prev]);
      return result.conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [getAuthHeaders]);

  // Get or create DM
  const getOrCreateDM = useCallback(async (userId: string): Promise<Conversation | null> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/dm/${userId}`, {
        headers,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get or create DM');
      }

      const result = await response.json();

      if (result.created) {
        setConversations((prev) => [result.conversation, ...prev]);
      }

      return result.conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [getAuthHeaders]);

  // Edit message
  const editMessage = useCallback(async (
    messageId: string,
    content: string
  ): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to edit message');
      }

      const result = await response.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? result.message : m))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [getAuthHeaders]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/messages/${messageId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete message');
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, content: null }
            : m
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [getAuthHeaders]);

  // Mark as read
  const markAsRead = useCallback(async (conversationId: string, messageId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/messaging/messages/${messageId}/read`, {
        method: 'POST',
        headers,
      });

      // Update local unread count
      setUnreadByConversation((prev) => {
        const { [conversationId]: removed, ...rest } = prev;
        return rest;
      });

      // Update conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );

      // Update total
      await fetchUnreadCount();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [getAuthHeaders]);

  // React to message
  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/messaging/messages/${messageId}/reactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to react to message');
      }

      const result = await response.json();

      // Update message with new reactions
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;

          const reactions = Object.entries(result.reactions || {}).map(
            ([emoji, users]: [string, unknown]) => ({
              emoji,
              count: (users as { userId: string }[]).length,
              users: (users as { userId: string; firstName: string; lastName: string }[]).map(u => ({
                id: u.userId,
                firstName: u.firstName,
                lastName: u.lastName,
              })),
              hasReacted: (users as { userId: string }[]).some(u => u.userId === m.senderId),
            })
          );

          return { ...m, reactions };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [getAuthHeaders]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/messaging/unread', { headers });

      if (!response.ok) return;

      const data: UnreadCountResponse = await response.json();
      setTotalUnread(data.totalUnread);
      setUnreadByConversation(data.byConversation);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [getAuthHeaders]);

  // Mute conversation
  const muteConversation = useCallback(async (conversationId: string, duration?: number) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/messaging/conversations/${conversationId}/mute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ duration }),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, isMuted: true } : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [getAuthHeaders]);

  // Unmute conversation
  const unmuteConversation = useCallback(async (conversationId: string) => {
    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/messaging/conversations/${conversationId}/mute`, {
        method: 'DELETE',
        headers,
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, isMuted: false } : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [getAuthHeaders]);

  // Local message management (for optimistic updates)
  const addLocalMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLocalMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
    );
  }, []);

  const removeLocalMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  // Fetch unread count on mount and poll every 30 seconds
  useEffect(() => {
    fetchUnreadCount();

    // Poll for unread count updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  return {
    conversations,
    currentConversation,
    messages,
    totalUnread,
    unreadByConversation,
    loading,
    messagesLoading,
    error,
    hasMoreMessages,
    fetchConversations,
    fetchConversation,
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    createConversation,
    getOrCreateDM,
    editMessage,
    deleteMessage,
    markAsRead,
    reactToMessage,
    fetchUnreadCount,
    muteConversation,
    unmuteConversation,
    setCurrentConversation,
    addLocalMessage,
    updateLocalMessage,
    removeLocalMessage,
  };
}
