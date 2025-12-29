'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessenger } from './messenger-provider';
import { MessageThread } from './message-thread';
import { MessageComposer } from './message-composer';
import { TypingIndicator } from './typing-indicator';
import { Loader2 } from 'lucide-react';
import { useMessagingRealtime } from '@/hooks/use-messaging-realtime';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types/messaging';

export function ConversationView() {
  const [userId, setUserId] = useState<string | null>(null);
  const {
    currentConversation,
    messages,
    messagesLoading,
    loadMoreMessages,
  } = useMessenger();

  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Fetch user ID
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the profile ID from the users table
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();
        if (profile) {
          setUserId(profile.id);
        }
      }
    };
    fetchUser();
  }, []);

  // Real-time subscriptions
  const { sendTypingIndicator } = useMessagingRealtime({
    conversationId: currentConversation?.id || null,
    userId: userId,
    onNewMessage: (message: Message) => {
      // Handle new message - will be added to state via the hook
      // Auto-scroll if at bottom
      if (isAtBottom) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    },
    onTypingStart: (userId: string) => {
      setTypingUsers((prev) => new Set(prev).add(userId));
    },
    onTypingStop: (userId: string) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  // Track scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);

    // Load more when scrolled to top
    if (scrollTop === 0 && !messagesLoading) {
      loadMoreMessages();
    }
  };

  if (!currentConversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3"
      >
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-timber-beam" />
          </div>
        ) : (
          <>
            {messagesLoading && messages.length > 0 && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-timber-beam" />
              </div>
            )}
            <MessageThread messages={messages} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-3 pb-1">
          <TypingIndicator userIds={Array.from(typingUsers)} />
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-timber-dark/20 p-3">
        <MessageComposer
          onTyping={() => sendTypingIndicator(true)}
          onStopTyping={() => sendTypingIndicator(false)}
        />
      </div>
    </div>
  );
}
