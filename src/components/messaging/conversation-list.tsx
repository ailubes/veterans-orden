'use client';

import { useState, useEffect } from 'react';
import { useMessenger } from './messenger-provider';
import { ConversationItem } from './conversation-item';
import { Plus, Search, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { filterConversations } from '@/lib/messaging/utils';

interface ConversationListProps {
  compact?: boolean;
}

export function ConversationList({ compact = false }: ConversationListProps) {
  const {
    conversations,
    loading,
    openConversation,
    openNewConversation,
    refreshConversations,
  } = useMessenger();

  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations on mount
  useEffect(() => {
    if (conversations.length === 0) {
      refreshConversations();
    }
  }, [conversations.length, refreshConversations]);

  const filteredConversations = filterConversations(conversations, searchQuery);

  return (
    <div className="flex flex-col h-full">
      {/* Search and New */}
      <div className={compact ? "p-2 border-b border-line/20" : "p-3 border-b border-line/20"}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-500" />
            <Input
              type="text"
              placeholder="Пошук..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={compact ? "pl-9 h-8 text-xs" : "pl-9 h-9 text-sm"}
            />
          </div>
          {!compact && (
            <button
              onClick={openNewConversation}
              className="flex items-center justify-center w-9 h-9 bg-panel-850 text-canvas hover:bg-panel-850/90 transition-colors"
              aria-label="Нова розмова"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageCircle className="w-10 h-10 text-muted-500/50 mb-2" />
            {searchQuery ? (
              <p className="text-muted-500 text-sm">
                Нічого не знайдено за запитом "{searchQuery}"
              </p>
            ) : (
              <>
                <p className="text-muted-500 text-sm font-medium">
                  У вас ще немає розмов
                </p>
                <button
                  onClick={openNewConversation}
                  className="mt-2 text-bronze text-sm hover:underline"
                >
                  Почати нову розмову
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line/10">
            {filteredConversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  onClick={() => openConversation(conversation)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
