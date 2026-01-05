'use client';

import { useState } from 'react';
import { Pin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PinnedMessage } from '@/types/messaging';
import { cn } from '@/lib/utils';

interface PinnedMessagesBarProps {
  pinnedMessages: PinnedMessage[];
  onNavigateToMessage: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
  canUnpin?: boolean;
}

export function PinnedMessagesBar({
  pinnedMessages,
  onNavigateToMessage,
  onUnpin,
  canUnpin = false,
}: PinnedMessagesBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const currentMessage = pinnedMessages[currentIndex];
  const hasMultiple = pinnedMessages.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? pinnedMessages.length - 1 : prev - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === pinnedMessages.length - 1 ? 0 : prev + 1
    );
  };

  const handleClick = () => {
    onNavigateToMessage(currentMessage.id);
  };

  const handleUnpin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnpin?.(currentMessage.id);
    // Adjust index if we unpinned the last item
    if (currentIndex >= pinnedMessages.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Truncate content for preview
  const previewContent = currentMessage.content
    ? currentMessage.content.length > 100
      ? currentMessage.content.substring(0, 100) + '...'
      : currentMessage.content
    : 'Вкладення';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 bg-bronze/10 border-b border-line/20',
        'cursor-pointer hover:bg-bronze/20 transition-colors'
      )}
    >
      {/* Pin icon with indicator */}
      <div className="flex-shrink-0 relative">
        <Pin className="w-4 h-4 text-bronze" />
        {hasMultiple && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-bronze text-canvas text-[8px] font-bold rounded-full flex items-center justify-center">
            {pinnedMessages.length}
          </span>
        )}
      </div>

      {/* Navigation arrows (only if multiple pinned) */}
      {hasMultiple && (
        <div className="flex-shrink-0 flex items-center gap-0.5">
          <button
            onClick={goToPrevious}
            className="p-0.5 hover:bg-timber-light rounded transition-colors"
            title="Попереднє закріплене"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-muted-500 min-w-[24px] text-center">
            {currentIndex + 1}/{pinnedMessages.length}
          </span>
          <button
            onClick={goToNext}
            className="p-0.5 hover:bg-timber-light rounded transition-colors"
            title="Наступне закріплене"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Message preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-bronze truncate">
            Закріплено
          </span>
          {currentMessage.senderName && (
            <span className="text-xs text-muted-500 truncate">
              - {currentMessage.senderName}
            </span>
          )}
        </div>
        <p className="text-xs text-timber-dark truncate">{previewContent}</p>
      </div>

      {/* Unpin button (admin only) */}
      {canUnpin && onUnpin && (
        <button
          onClick={handleUnpin}
          className="flex-shrink-0 p-1 hover:bg-timber-light rounded transition-colors"
          title="Відкріпити"
        >
          <X className="w-4 h-4 text-muted-500 hover:text-red-600" />
        </button>
      )}
    </div>
  );
}
