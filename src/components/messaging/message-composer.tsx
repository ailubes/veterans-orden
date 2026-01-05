'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useMessenger } from './messenger-provider';
import { Send, Paperclip, Smile, X, Loader2, Reply } from 'lucide-react';
import { AVAILABLE_REACTIONS } from '@/lib/messaging/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messaging';

interface MessageComposerProps {
  onTyping?: () => void;
  onStopTyping?: () => void;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
}

export function MessageComposer({
  onTyping,
  onStopTyping,
  replyToMessage,
  onCancelReply,
}: MessageComposerProps) {
  const { sendMessage, currentConversation } = useMessenger();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disabled = !currentConversation || (!currentConversation.allowReplies && currentConversation.type === 'group');

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Handle typing indicator
  const handleTyping = () => {
    if (onTyping) onTyping();

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 1000);
  };

  // Handle send
  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;

    setSending(true);
    try {
      await sendMessage(content.trim(), undefined, replyToMessage?.id);
      setContent('');
      if (onStopTyping) onStopTyping();
      if (onCancelReply) onCancelReply();
    } finally {
      setSending(false);
    }
  };

  // Focus textarea when replying
  useEffect(() => {
    if (replyToMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  if (disabled) {
    return (
      <div className="text-center text-sm text-muted-500 py-2">
        Відповіді в цій групі обмежено
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Reply preview */}
      {replyToMessage && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-panel-850/50 rounded border-l-2 border-bronze">
          <Reply className="w-4 h-4 text-bronze flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-bronze">
              {replyToMessage.sender?.firstName || 'Хтось'}
            </span>
            <p className="text-xs text-muted-500 truncate">
              {replyToMessage.content?.substring(0, 100) || 'Вкладення'}
              {(replyToMessage.content?.length || 0) > 100 && '...'}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-panel-850 rounded transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-500" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Emoji picker */}
        <Popover open={showEmoji} onOpenChange={setShowEmoji}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="p-2 hover:bg-panel-850 rounded transition-colors"
            aria-label="Емодзі"
          >
            <Smile className="w-5 h-5 text-muted-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-6 gap-1">
            {AVAILABLE_REACTIONS.map((r) => (
              <button
                key={r.emoji}
                onClick={() => insertEmoji(r.emoji)}
                className="p-2 text-xl hover:bg-panel-850 rounded"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Напишіть повідомлення..."
            className={cn(
              'w-full resize-none rounded-lg border border-line rounded-lg/30 px-3 py-2',
              'text-sm placeholder:text-muted-500/50',
              'focus:border-line focus:outline-none',
              'min-h-[40px] max-h-[120px]'
            )}
            rows={1}
            disabled={sending}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className={cn(
            'p-2 rounded transition-colors',
            content.trim() && !sending
              ? 'bg-panel-850 text-canvas hover:bg-panel-850/90'
              : 'bg-panel-850 text-muted-500 cursor-not-allowed'
          )}
          aria-label="Надіслати"
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
