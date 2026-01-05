'use client';

import { RefObject } from 'react';
import { Message, ParticipantRole } from '@/types/messaging';
import { MessageItem } from './message-item';
import { groupMessagesByDate, shouldGroupMessages } from '@/lib/messaging/utils';

interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string;
  userRole?: ParticipantRole;
  isSelectionMode?: boolean;
  selectedMessageIds?: Set<string>;
  onToggleSelect?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onStar?: (messageId: string, isStarred: boolean) => void;
  onPin?: (messageId: string, isPinned: boolean) => void;
  messageRefs?: RefObject<Map<string, HTMLDivElement>>;
}

export function MessageThread({
  messages,
  currentUserId,
  userRole = 'member',
  isSelectionMode = false,
  selectedMessageIds = new Set(),
  onToggleSelect,
  onReply,
  onForward,
  onStar,
  onPin,
  messageRefs,
}: MessageThreadProps) {
  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-muted-500 text-sm">
          Ще немає повідомлень. Напишіть перше!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messageGroups.map((group) => (
        <div key={group.date}>
          {/* Date Separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-panel-850/20" />
            <span className="text-xs text-muted-500 font-medium px-2">
              {group.dateLabel}
            </span>
            <div className="flex-1 h-px bg-panel-850/20" />
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {group.messages.map((message, index) => {
              const prevMessage = index > 0 ? group.messages[index - 1] : null;
              const isGrouped = shouldGroupMessages(prevMessage, message);

              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el && messageRefs?.current) {
                      messageRefs.current.set(message.id, el);
                    }
                  }}
                  className="transition-colors duration-500"
                >
                  <MessageItem
                    message={message}
                    isGrouped={isGrouped}
                    currentUserId={currentUserId}
                    userRole={userRole}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedMessageIds.has(message.id)}
                    onToggleSelect={onToggleSelect}
                    onReply={onReply}
                    onForward={onForward}
                    onStar={onStar}
                    onPin={onPin}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
