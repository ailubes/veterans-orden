'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useMessaging } from '@/hooks/use-messaging';
import type { Conversation, Message } from '@/types/messaging';

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

  // Actions
  openMessenger: () => void;
  closeMessenger: () => void;
  toggleMessenger: () => void;
  openConversation: (conversation: Conversation) => void;
  openNewConversation: () => void;
  openDM: (userId: string) => Promise<void>;
  backToList: () => void;
  sendMessage: (content: string, attachments?: Message['attachments']) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const MessengerContext = createContext<MessengerContextType | null>(null);

interface MessengerProviderProps {
  children: ReactNode;
}

export function MessengerProvider({ children }: MessengerProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'conversation' | 'new'>('list');

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

  const sendMessage = useCallback(async (content: string, attachments?: Message['attachments']) => {
    if (!currentConversation) return;

    await sendMsg(currentConversation.id, {
      content,
      type: attachments && attachments.length > 0 ? 'file' : 'text',
      attachments,
    });
  }, [currentConversation, sendMsg]);

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

  const value: MessengerContextType = {
    isOpen,
    activeView,
    conversations,
    currentConversation,
    messages,
    totalUnread,
    loading,
    messagesLoading,
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
