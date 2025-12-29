'use client';

import { useState, useEffect } from 'react';
import { useMessenger } from './messenger-provider';
import { ConversationItem } from './conversation-item';
import { Plus, Search, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { filterConversations } from '@/lib/messaging/utils';

export function ConversationList() {
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
      <div className="p-3 border-b border-timber-dark/20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam" />
            <Input
              type="text"
              placeholder="Пошук розмов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <button
            onClick={openNewConversation}
            className="flex items-center justify-center w-9 h-9 bg-timber-dark text-canvas hover:bg-timber-dark/90 transition-colors"
            aria-label="Нова розмова"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-timber-beam" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <MessageCircle className="w-10 h-10 text-timber-beam/50 mb-2" />
            {searchQuery ? (
              <p className="text-timber-beam text-sm">
                Нічого не знайдено за запитом "{searchQuery}"
              </p>
            ) : (
              <>
                <p className="text-timber-beam text-sm font-medium">
                  У вас ще немає розмов
                </p>
                <button
                  onClick={openNewConversation}
                  className="mt-2 text-accent text-sm hover:underline"
                >
                  Почати нову розмову
                </button>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-timber-dark/10">
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
