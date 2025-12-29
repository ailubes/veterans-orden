'use client';

import { useMessenger } from './messenger-provider';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessengerButtonProps {
  className?: string;
}

export function MessengerButton({ className }: MessengerButtonProps) {
  const { totalUnread, toggleMessenger } = useMessenger();

  return (
    <button
      onClick={toggleMessenger}
      className={cn(
        'relative p-2 rounded-full hover:bg-timber-light transition-colors',
        className
      )}
      aria-label={`Повідомлення${totalUnread > 0 ? ` (${totalUnread} непрочитаних)` : ''}`}
    >
      <MessageCircle className="w-6 h-6" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-canvas text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  );
}
