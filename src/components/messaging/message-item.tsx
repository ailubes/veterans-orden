'use client';

import { useState, useEffect } from 'react';
import { Message, ParticipantRole } from '@/types/messaging';
import { createClient } from '@/lib/supabase/client';
import { useMessaging } from '@/hooks/use-messaging';
import {
  formatFullMessageTime,
  getInitials,
  AVAILABLE_REACTIONS,
} from '@/lib/messaging/utils';
import {
  Check,
  CheckCheck,
  Star,
  Pin,
  Forward,
} from 'lucide-react';
import { MessageActionsBar } from './message-context-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { DefaultAvatar } from '@/components/ui/default-avatar';

interface MessageItemProps {
  message: Message;
  isGrouped: boolean;
  currentUserId?: string;
  userRole?: ParticipantRole;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (messageId: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onStar?: (messageId: string, isStarred: boolean) => void;
  onPin?: (messageId: string, isPinned: boolean) => void;
}

export function MessageItem({
  message,
  isGrouped,
  currentUserId,
  userRole = 'member',
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onReply,
  onForward,
  onStar,
  onPin,
}: MessageItemProps) {
  const { editMessage, deleteMessage, reactToMessage } = useMessaging();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [userId, setUserId] = useState<string | null>(currentUserId || null);

  useEffect(() => {
    if (currentUserId) return;
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the profile ID from the users table
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        if (profile) {
          setUserId(profile.id);
        }
      }
    };
    fetchUser();
  }, [currentUserId]);

  const isOwnMessage = message.sender?.id === userId;
  const isSystemMessage = message.type === 'system';
  const isPinned = !!message.pinnedAt;
  const isStarred = !!message.isStarred;
  const canPin = userRole === 'owner' || userRole === 'admin';
  const canEdit = isOwnMessage; // Edit window check should be done in the hook
  const canDelete = isOwnMessage || canPin;

  // Handle edit
  const handleEdit = async () => {
    if (!editContent.trim()) return;
    const success = await editMessage(message.id, editContent);
    if (success) {
      setIsEditing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Ви впевнені, що хочете видалити це повідомлення?')) {
      await deleteMessage(message.id);
    }
  };

  // Handle reaction
  const handleReaction = async (emoji: string) => {
    await reactToMessage(message.id, emoji);
  };

  // Handle copy
  const handleCopy = async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
        // Could add toast notification here
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Handle reply
  const handleReply = () => {
    onReply?.(message);
  };

  // Handle forward
  const handleForward = () => {
    onForward?.(message);
  };

  // Handle star
  const handleStar = () => {
    onStar?.(message.id, isStarred);
  };

  // Handle pin
  const handlePin = () => {
    onPin?.(message.id, isPinned);
  };

  // Handle select
  const handleSelect = () => {
    onToggleSelect?.(message.id);
  };

  // Handle click in selection mode
  const handleClick = () => {
    if (isSelectionMode) {
      handleSelect();
    }
  };

  // Render system message
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-500 bg-panel-850/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Render deleted message
  if (message.isDeleted) {
    return (
      <div className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[75%] px-3 py-2 bg-panel-850/30 rounded-lg">
          <p className="text-sm text-muted-500 italic">
            Повідомлення видалено
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row',
        !isGrouped && 'mt-3',
        isSelectionMode && 'cursor-pointer',
        isSelected && 'bg-bronze/10'
      )}
      onMouseEnter={() => !isSelectionMode && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={handleClick}
    >
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="flex-shrink-0 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="w-5 h-5 rounded border-line accent-accent"
          />
        </div>
      )}

      {/* Avatar */}
      {!isGrouped && !isOwnMessage && !isSelectionMode && (
        <div className="flex-shrink-0">
          {message.sender?.avatarUrl ? (
            <Image
              src={message.sender.avatarUrl}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <DefaultAvatar
              sex={message.sender?.sex}
              size="sm"
              fallbackInitials={message.sender
                ? getInitials(message.sender.firstName, message.sender.lastName)
                : '?'}
            />
          )}
        </div>
      )}
      {isGrouped && !isOwnMessage && !isSelectionMode && <div className="w-8" />}

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[75%] group relative',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name for group chats */}
        {!isGrouped && !isOwnMessage && message.sender && (
          <p className="text-xs font-medium text-text-100 mb-1 ml-1">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        {/* Forwarded indicator */}
        {message.forwardedFromMessageId && (
          <div className="text-xs text-muted-500 bg-panel-850/50 px-2 py-1 rounded mb-1 border-l-2 border-blue-500 flex items-center gap-1">
            <Forward size={10} />
            <span className="font-medium">
              Переслано від {message.forwardedFromSenderName || 'Хтось'}
            </span>
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="text-xs text-muted-500 bg-panel-850/50 px-2 py-1 rounded mb-1 border-l-2 border-bronze">
            <span className="font-medium">
              {message.replyTo.sender?.firstName || 'Хтось'}:
            </span>{' '}
            {message.replyTo.content?.substring(0, 50)}
            {(message.replyTo.content?.length || 0) > 50 && '...'}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'px-3 py-2 rounded-lg',
            isOwnMessage
              ? 'bg-panel-850 text-canvas rounded-br-none'
              : 'bg-panel-850 rounded-bl-none'
          )}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[60px] bg-panel-900 text-text-100 p-2 rounded text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-muted-500 hover:text-text-100"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleEdit}
                  className="text-xs text-bronze font-medium"
                >
                  Зберегти
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, i) => (
                    <a
                      key={i}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs underline"
                    >
                      📎 {attachment.name}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReaction(reaction.emoji)}
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs',
                  reaction.hasReacted
                    ? 'bg-bronze/20 text-bronze'
                    : 'bg-panel-850/50 text-muted-500 hover:bg-panel-850'
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-0.5',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
        >
          {/* Star indicator */}
          {isStarred && (
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          )}
          {/* Pin indicator */}
          {isPinned && (
            <Pin className="w-3 h-3 text-bronze" />
          )}
          <span className="text-[10px] text-muted-500">
            {formatFullMessageTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-[10px] text-muted-500">(ред.)</span>
          )}
          {isOwnMessage && (
            <span className="text-muted-500">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>

        {/* Actions menu */}
        {showActions && !isEditing && !isSelectionMode && (
          <MessageActionsBar
            message={message}
            isOwnMessage={isOwnMessage}
            userRole={userRole}
            isStarred={isStarred}
            isPinned={isPinned}
            canEdit={canEdit}
            canDelete={canDelete}
            canPin={canPin}
            quickReactions={AVAILABLE_REACTIONS}
            onReaction={handleReaction}
            onReply={handleReply}
            onForward={handleForward}
            onCopy={handleCopy}
            onPin={handlePin}
            onStar={handleStar}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        )}
      </div>
    </div>
  );
}
