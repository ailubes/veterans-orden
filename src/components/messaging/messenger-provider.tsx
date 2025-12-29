'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useMessaging } from '@/hooks/use-messaging';
import type { Conversation, Message, PinnedMessage, ParticipantRole } from '@/types/messaging';

interface MessengerContextType {
  // State
  isOpen: boolean;
  activeView: 'list' | 'conversation' | 'new';
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  totalUnread: number;
  loading: boolean;
  messagesLoading: boolean;

  // Reply/Forward state
  replyToMessage: Message | null;
  forwardMessage: Message | null;

  // Selection mode
  isSelectionMode: boolean;
  selectedMessageIds: Set<string>;

  // Pinned messages
  pinnedMessages: PinnedMessage[];

  // User role in current conversation
  userRole: ParticipantRole;

  // Actions
  openMessenger: () => void;
  closeMessenger: () => void;
  toggleMessenger: () => void;
  openConversation: (conversation: Conversation) => void;
  openNewConversation: () => void;
  openDM: (userId: string) => Promise<void>;
  backToList: () => void;
  sendMessage: (content: string, attachments?: Message['attachments'], replyToId?: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;

  // Reply/Forward actions
  setReplyToMessage: (message: Message | null) => void;
  setForwardMessage: (message: Message | null) => void;

  // Selection mode actions
  toggleSelectionMode: () => void;
  toggleMessageSelection: (messageId: string) => void;
  clearSelection: () => void;

  // Star/Pin actions
  starMessage: (messageId: string) => Promise<boolean>;
  unstarMessage: (messageId: string) => Promise<boolean>;
  pinMessage: (messageId: string) => Promise<boolean>;
  unpinMessage: (messageId: string) => Promise<boolean>;

  // Forward action
  forwardMessages: (messageIds: string[], conversationIds: string[]) => Promise<boolean>;

  // Bulk delete action
  bulkDeleteMessages: (messageIds: string[]) => Promise<boolean>;
}

const MessengerContext = createContext<MessengerContextType | null>(null);

interface MessengerProviderProps {
  children: ReactNode;
}

export function MessengerProvider({ children }: MessengerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'conversation' | 'new'>('list');

  // Reply/Forward state
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);

  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());

  // Pinned messages and user role
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [userRole, setUserRole] = useState<ParticipantRole>('member');

  const {
    conversations,
    currentConversation,
    messages,
    totalUnread,
    loading,
    messagesLoading,
    hasMoreMessages,
    fetchConversations,
    fetchMessages,
    loadMoreMessages: loadMore,
    sendMessage: sendMsg,
    getOrCreateDM,
    markAsRead,
    setCurrentConversation,
    fetchUnreadCount,
  } = useMessaging();

  const openMessenger = useCallback(() => {
    setIsOpen(true);
    if (conversations.length === 0) {
      fetchConversations();
    }
  }, [conversations.length, fetchConversations]);

  const closeMessenger = useCallback(() => {
    setIsOpen(false);
    setActiveView('list');
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  const toggleMessenger = useCallback(() => {
    if (isOpen) {
      closeMessenger();
    } else {
      openMessenger();
    }
  }, [isOpen, openMessenger, closeMessenger]);

  const openConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setActiveView('conversation');

    // Reset reply/selection state
    setReplyToMessage(null);
    setForwardMessage(null);
    setIsSelectionMode(false);
    setSelectedMessageIds(new Set());

    // Fetch pinned messages from conversation
    if (conversation.pinnedMessages) {
      setPinnedMessages(conversation.pinnedMessages);
    } else {
      setPinnedMessages([]);
    }

    await fetchMessages(conversation.id);

    // Mark as read if there are unread messages
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      // Get the last message to mark as read
      // This will be done after messages are loaded
    }
  }, [setCurrentConversation, fetchMessages]);

  const openNewConversation = useCallback(() => {
    setActiveView('new');
  }, []);

  const openDM = useCallback(async (userId: string) => {
    const conversation = await getOrCreateDM(userId);
    if (conversation) {
      openConversation(conversation);
    }
  }, [getOrCreateDM, openConversation]);

  const backToList = useCallback(() => {
    setActiveView('list');
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  const sendMessage = useCallback(async (content: string, attachments?: Message['attachments'], replyToId?: string) => {
    if (!currentConversation) return;

    await sendMsg(currentConversation.id, {
      content,
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      attachments,
      replyToId: replyToId || replyToMessage?.id,
    });

    // Clear reply state after sending
    setReplyToMessage(null);
  }, [currentConversation, sendMsg, replyToMessage]);

  const loadMoreMessages = useCallback(async () => {
    if (hasMoreMessages) {
      await loadMore();
    }
  }, [hasMoreMessages, loadMore]);

  const refreshConversations = useCallback(async () => {
    await fetchConversations(1);
  }, [fetchConversations]);

  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Selection mode actions
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Clear selection when exiting selection mode
        setSelectedMessageIds(new Set());
      }
      return !prev;
    });
  }, []);

  const toggleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMessageIds(new Set());
    setIsSelectionMode(false);
  }, []);

  // Star/Unstar message
  const starMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}/star`, {
        method: 'POST',
      });
      if (!res.ok) {
        console.error('Failed to star message');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error starring message:', error);
      return false;
    }
  }, []);

  const unstarMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}/star`, {
        method: 'POST', // Toggle endpoint
      });
      if (!res.ok) {
        console.error('Failed to unstar message');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error unstarring message:', error);
      return false;
    }
  }, []);

  // Pin/Unpin message
  const pinMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}/pin`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to pin message:', data.error);
        return false;
      }
      // Refresh pinned messages
      if (currentConversation) {
        // Get updated pinned messages from response or refetch
        const data = await res.json();
        if (data.message) {
          setPinnedMessages((prev) => [
            ...prev,
            {
              id: data.message.id,
              content: data.message.content,
              senderName: data.message.sender?.firstName || 'Хтось',
              pinnedAt: data.message.pinned_at,
            },
          ]);
        }
      }
      return true;
    } catch (error) {
      console.error('Error pinning message:', error);
      return false;
    }
  }, [currentConversation]);

  const unpinMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messaging/messages/${messageId}/pin`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to unpin message');
        return false;
      }
      // Remove from pinned messages
      setPinnedMessages((prev) => prev.filter((m) => m.id !== messageId));
      return true;
    } catch (error) {
      console.error('Error unpinning message:', error);
      return false;
    }
  }, []);

  // Forward messages
  const forwardMessages = useCallback(async (messageIds: string[], conversationIds: string[]): Promise<boolean> => {
    try {
      // Forward each message to all selected conversations
      for (const messageId of messageIds) {
        const res = await fetch(`/api/messaging/messages/${messageId}/forward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationIds }),
        });
        if (!res.ok) {
          console.error('Failed to forward message:', messageId);
          return false;
        }
      }
      // Clear selection and forward state
      clearSelection();
      setForwardMessage(null);
      return true;
    } catch (error) {
      console.error('Error forwarding messages:', error);
      return false;
    }
  }, [clearSelection]);

  // Bulk delete messages
  const bulkDeleteMessages = useCallback(async (messageIds: string[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/messaging/messages/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Failed to delete messages:', data.error);
        return false;
      }

      // Clear selection after successful delete
      clearSelection();

      // Trigger a refresh to update the messages list
      if (currentConversation) {
        await fetchMessages(currentConversation.id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting messages:', error);
      return false;
    }
  }, [clearSelection, currentConversation, fetchMessages]);

  const value: MessengerContextType = {
    // State
    isOpen,
    activeView,
    conversations,
    currentConversation,
    messages,
    totalUnread,
    loading,
    messagesLoading,

    // Reply/Forward state
    replyToMessage,
    forwardMessage,

    // Selection mode
    isSelectionMode,
    selectedMessageIds,

    // Pinned messages
    pinnedMessages,

    // User role
    userRole,

    // Actions
    openMessenger,
    closeMessenger,
    toggleMessenger,
    openConversation,
    openNewConversation,
    openDM,
    backToList,
    sendMessage,
    loadMoreMessages,
    refreshConversations,
    refreshUnreadCount,

    // Reply/Forward actions
    setReplyToMessage,
    setForwardMessage,

    // Selection mode actions
    toggleSelectionMode,
    toggleMessageSelection,
    clearSelection,

    // Star/Pin actions
    starMessage,
    unstarMessage,
    pinMessage,
    unpinMessage,

    // Forward action
    forwardMessages,

    // Bulk delete action
    bulkDeleteMessages,
  };

  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  );
}

export function useMessenger() {
  const context = useContext(MessengerContext);
  if (!context) {
    throw new Error('useMessenger must be used within a MessengerProvider');
  }
  return context;
}
