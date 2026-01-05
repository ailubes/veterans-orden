'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Forward, Search, Check, Loader2, X } from 'lucide-react';
import { useMessenger } from './messenger-provider';
import type { Conversation, Message } from '@/types/messaging';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getInitials } from '@/lib/messaging/utils';
import { DefaultAvatar } from '@/components/ui/default-avatar';

interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  selectedMessageIds?: Set<string>;
}

export function ForwardModal({
  isOpen,
  onClose,
  message,
  selectedMessageIds,
}: ForwardModalProps) {
  const { conversations, forwardMessages, currentConversation } = useMessenger();
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedConversations(new Set());
      setComment('');
      setSearch('');
    }
  }, [isOpen]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    if (conv.id === currentConversation?.id) return false; // Exclude current conversation

    const searchLower = search.toLowerCase();
    if (conv.name && conv.name.toLowerCase().includes(searchLower)) return true;
    if (conv.otherParticipant) {
      const fullName = `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`.toLowerCase();
      if (fullName.includes(searchLower)) return true;
    }
    return search === '';
  });

  const toggleConversation = (conversationId: string) => {
    setSelectedConversations((prev) => {
      const next = new Set(prev);
      if (next.has(conversationId)) {
        next.delete(conversationId);
      } else {
        next.add(conversationId);
      }
      return next;
    });
  };

  const handleForward = async () => {
    if (selectedConversations.size === 0) return;

    setLoading(true);
    try {
      const messageIds = selectedMessageIds && selectedMessageIds.size > 0
        ? Array.from(selectedMessageIds)
        : message ? [message.id] : [];

      if (messageIds.length === 0) return;

      const success = await forwardMessages(messageIds, Array.from(selectedConversations));
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const getConversationDisplay = (conv: Conversation) => {
    if (conv.type === 'direct' && conv.otherParticipant) {
      return {
        name: `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`,
        avatarUrl: conv.otherParticipant.avatarUrl,
        initials: getInitials(conv.otherParticipant.firstName, conv.otherParticipant.lastName),
      };
    }
    return {
      name: conv.name || 'Група',
      avatarUrl: conv.avatarUrl,
      initials: conv.name?.charAt(0).toUpperCase() || 'Г',
    };
  };

  const messageCount = selectedMessageIds && selectedMessageIds.size > 0
    ? selectedMessageIds.size
    : message ? 1 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="w-5 h-5" />
            Переслати повідомлення
            {messageCount > 1 && (
              <span className="text-sm text-muted-500">({messageCount})</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук розмов..."
            className="w-full pl-9 pr-4 py-2 border border-line/20 rounded-lg text-sm focus:outline-none focus:border-line"
          />
        </div>

        {/* Conversation list */}
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {filteredConversations.length === 0 ? (
            <p className="text-center text-sm text-muted-500 py-4">
              Немає доступних розмов
            </p>
          ) : (
            filteredConversations.map((conv) => {
              const display = getConversationDisplay(conv);
              const isSelected = selectedConversations.has(conv.id);

              return (
                <button
                  key={conv.id}
                  onClick={() => toggleConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2 rounded-lg transition-colors',
                    isSelected ? 'bg-bronze/20' : 'hover:bg-timber-light/50'
                  )}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    {display.avatarUrl ? (
                      <Image
                        src={display.avatarUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar
                        sex={conv.type === 'direct' ? conv.otherParticipant?.sex : null}
                        size="md"
                        fallbackInitials={display.initials}
                      />
                    )}
                    {conv.type === 'group' && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-bronze text-canvas text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {conv.participantCount}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm truncate">{display.name}</p>
                    {conv.type === 'group' && (
                      <p className="text-xs text-muted-500">Група</p>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-bronze border-bronze text-canvas'
                        : 'border-line/30'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Comment input */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Додати коментар (необов'язково)..."
            className="w-full resize-none rounded-lg border border-line/20 px-3 py-2 text-sm focus:outline-none focus:border-line min-h-[60px]"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-500 hover:text-timber-dark transition-colors"
          >
            Скасувати
          </button>
          <button
            onClick={handleForward}
            disabled={selectedConversations.size === 0 || loading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedConversations.size > 0 && !loading
                ? 'bg-bronze text-canvas hover:bg-bronze/90'
                : 'bg-timber-light text-muted-500 cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Forward className="w-4 h-4" />
            )}
            Переслати
            {selectedConversations.size > 0 && ` (${selectedConversations.size})`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
