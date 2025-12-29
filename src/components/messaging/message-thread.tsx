'use client';

import { Message } from '@/types/messaging';
import { MessageItem } from './message-item';
import { groupMessagesByDate, shouldGroupMessages } from '@/lib/messaging/utils';

interface MessageThreadProps {
  messages: Message[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-timber-beam text-sm">
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
            <div className="flex-1 h-px bg-timber-dark/20" />
            <span className="text-xs text-timber-beam font-medium px-2">
              {group.dateLabel}
            </span>
            <div className="flex-1 h-px bg-timber-dark/20" />
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {group.messages.map((message, index) => {
              const prevMessage = index > 0 ? group.messages[index - 1] : null;
              const isGrouped = shouldGroupMessages(prevMessage, message);

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isGrouped={isGrouped}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
