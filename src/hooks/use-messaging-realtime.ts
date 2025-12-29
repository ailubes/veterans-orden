'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { Message, UserPresence } from '@/types/messaging';

interface UseMessagingRealtimeProps {
  conversationId: string | null;
  userId: string | null;
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
  onMessageDelete?: (messageId: string) => void;
  onTypingStart?: (userId: string) => void;
  onTypingStop?: (userId: string) => void;
  onPresenceChange?: (presence: UserPresence) => void;
}

interface UseMessagingRealtimeReturn {
  sendTypingIndicator: (isTyping: boolean) => void;
  updatePresence: (conversationId: string | null) => void;
  isConnected: boolean;
}

export function useMessagingRealtime({
  conversationId,
  userId,
  onNewMessage,
  onMessageUpdate,
  onMessageDelete,
  onTypingStart,
  onTypingStop,
  onPresenceChange,
}: UseMessagingRealtimeProps): UseMessagingRealtimeReturn {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Create Supabase client for realtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle incoming realtime events
  const handleInsert = useCallback((payload: { new: Record<string, unknown> }) => {
    if (!onNewMessage) return;

    const msg = payload.new;
    const message: Message = {
      id: msg.id as string,
      conversationId: msg.conversation_id as string,
      senderId: msg.sender_id as string | null,
      sender: null, // Will need to be enriched
      type: msg.type as 'text' | 'image' | 'file' | 'system',
      content: msg.content as string | null,
      attachments: (msg.attachments || []) as Message['attachments'],
      replyToId: msg.reply_to_id as string | null,
      replyTo: null,
      reactions: [],
      isEdited: msg.is_edited as boolean,
      editedAt: msg.edited_at as string | null,
      isDeleted: msg.is_deleted as boolean,
      deletedAt: msg.deleted_at as string | null,
      status: msg.status as Message['status'],
      createdAt: msg.created_at as string,
      updatedAt: msg.updated_at as string,
    };

    onNewMessage(message);
  }, [onNewMessage]);

  const handleUpdate = useCallback((payload: { new: Record<string, unknown> }) => {
    const msg = payload.new;

    if (msg.is_deleted && onMessageDelete) {
      onMessageDelete(msg.id as string);
      return;
    }

    if (!onMessageUpdate) return;

    const message: Message = {
      id: msg.id as string,
      conversationId: msg.conversation_id as string,
      senderId: msg.sender_id as string | null,
      sender: null,
      type: msg.type as 'text' | 'image' | 'file' | 'system',
      content: msg.content as string | null,
      attachments: (msg.attachments || []) as Message['attachments'],
      replyToId: msg.reply_to_id as string | null,
      replyTo: null,
      reactions: [],
      isEdited: msg.is_edited as boolean,
      editedAt: msg.edited_at as string | null,
      isDeleted: msg.is_deleted as boolean,
      deletedAt: msg.deleted_at as string | null,
      status: msg.status as Message['status'],
      createdAt: msg.created_at as string,
      updatedAt: msg.updated_at as string,
    };

    onMessageUpdate(message);
  }, [onMessageUpdate, onMessageDelete]);

  // Subscribe to conversation messages
  useEffect(() => {
    if (!conversationId) {
      // Cleanup existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Subscribe to messages in this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        handleUpdate
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId: typingUserId, isTyping } = payload.payload as {
          userId: string;
          isTyping: boolean;
        };

        if (typingUserId === userId) return; // Ignore own typing

        if (isTyping && onTypingStart) {
          onTypingStart(typingUserId);
        } else if (!isTyping && onTypingStop) {
          onTypingStop(typingUserId);
        }
      })
      .subscribe((status) => {
        isConnectedRef.current = status === 'SUBSCRIBED';
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, userId, supabase, handleInsert, handleUpdate, onTypingStart, onTypingStop]);

  // Subscribe to presence updates
  useEffect(() => {
    if (!userId) return;

    const presenceChannel = supabase
      .channel('presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          if (!onPresenceChange) return;

          const p = payload.new as Record<string, unknown>;
          onPresenceChange({
            userId: p.user_id as string,
            isOnline: p.is_online as boolean,
            lastSeenAt: p.last_seen_at as string,
            currentConversationId: p.current_conversation_id as string | null,
          });
        }
      )
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      supabase.removeChannel(presenceChannel);
      presenceChannelRef.current = null;
    };
  }, [userId, supabase, onPresenceChange]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !userId || !conversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing event
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, isTyping },
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { userId, isTyping: false },
        });
      }, 3000);
    }
  }, [userId, conversationId]);

  // Update presence
  const updatePresence = useCallback(async (currentConversationId: string | null) => {
    if (!userId) return;

    try {
      await fetch('/api/messaging/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOnline: true,
          currentConversationId,
        }),
      });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [userId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    sendTypingIndicator,
    updatePresence,
    isConnected: isConnectedRef.current,
  };
}
