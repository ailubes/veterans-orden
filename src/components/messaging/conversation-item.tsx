'use client';

import { Conversation } from '@/types/messaging';
import {
  formatMessageTime,
  getConversationDisplayName,
  getConversationAvatar,
  getInitials,
  formatUnreadCount,
} from '@/lib/messaging/utils';
import { Users, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { DefaultAvatar } from '@/components/ui/default-avatar';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const displayName = getConversationDisplayName(conversation, '');
  const avatarUrl = getConversationAvatar(conversation, '');
  const initials = conversation.otherParticipant
    ? getInitials(
        conversation.otherParticipant.firstName,
        conversation.otherParticipant.lastName
      )
    : conversation.name
    ? conversation.name.substring(0, 2).toUpperCase()
    : 'ГР';

  const hasUnread = conversation.unreadCount && conversation.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 hover:bg-panel-850/50 transition-colors text-left',
        hasUnread && 'bg-panel-850/30'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover border border-line rounded-lg"
          />
        ) : conversation.type === 'group' ? (
          <div className="w-12 h-12 rounded-full flex items-center justify-center border border-line rounded-lg bg-panel-850 text-canvas font-bold text-sm">
            <Users className="w-5 h-5" />
          </div>
        ) : (
          <DefaultAvatar
            sex={conversation.otherParticipant?.sex}
            size="md"
            fallbackInitials={initials}
            className="border border-line rounded-lg"
          />
        )}
        {/* Online indicator for DMs */}
        {conversation.type === 'direct' && conversation.otherParticipant?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-canvas" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-medium truncate', hasUnread && 'font-bold')}>
            {displayName}
          </span>
          <span className="text-xs text-muted-500 flex-shrink-0">
            {formatMessageTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              'text-sm truncate',
              hasUnread ? 'text-text-100 font-medium' : 'text-muted-500'
            )}
          >
            {conversation.lastMessagePreview || 'Немає повідомлень'}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {conversation.isMuted && (
              <BellOff className="w-3.5 h-3.5 text-muted-500" />
            )}
            {hasUnread && (
              <span className="bg-bronze text-canvas text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {formatUnreadCount(conversation.unreadCount!)}
              </span>
            )}
          </div>
        </div>

        {/* Group participant count */}
        {conversation.type === 'group' && (
          <p className="text-xs text-muted-500 mt-0.5">
            {conversation.participantCount} учасників
          </p>
        )}
      </div>
    </button>
  );
}
