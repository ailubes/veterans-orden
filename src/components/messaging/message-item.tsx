'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types/messaging';
import { createClient } from '@/lib/supabase/client';
import { useMessaging } from '@/hooks/use-messaging';
import {
  formatFullMessageTime,
  getInitials,
  AVAILABLE_REACTIONS,
} from '@/lib/messaging/utils';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Reply,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageItemProps {
  message: Message;
  isGrouped: boolean;
  currentUserId?: string;
}

export function MessageItem({ message, isGrouped, currentUserId }: MessageItemProps) {
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
          .eq('clerk_id', user.id)
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

  // Render system message
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-timber-beam bg-timber-light/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // Render deleted message
  if (message.isDeleted) {
    return (
      <div className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
        <div className="max-w-[75%] px-3 py-2 bg-timber-light/30 rounded-lg">
          <p className="text-sm text-timber-beam italic">
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
        !isGrouped && 'mt-3'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isGrouped && !isOwnMessage && (
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
            <div className="w-8 h-8 rounded-full bg-timber-light flex items-center justify-center text-xs font-bold">
              {message.sender
                ? getInitials(message.sender.firstName, message.sender.lastName)
                : '?'}
            </div>
          )}
        </div>
      )}
      {isGrouped && !isOwnMessage && <div className="w-8" />}

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[75%] group relative',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name for group chats */}
        {!isGrouped && !isOwnMessage && message.sender && (
          <p className="text-xs font-medium text-timber-dark mb-1 ml-1">
            {message.sender.firstName} {message.sender.lastName}
          </p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="text-xs text-timber-beam bg-timber-light/50 px-2 py-1 rounded mb-1 border-l-2 border-accent">
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
              ? 'bg-timber-dark text-canvas rounded-br-none'
              : 'bg-timber-light rounded-bl-none'
          )}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[60px] bg-canvas text-timber-dark p-2 rounded text-sm"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-timber-beam hover:text-timber-dark"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleEdit}
                  className="text-xs text-accent font-medium"
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
                    ? 'bg-accent/20 text-accent'
                    : 'bg-timber-light/50 text-timber-beam hover:bg-timber-light'
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
          <span className="text-[10px] text-timber-beam">
            {formatFullMessageTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-[10px] text-timber-beam">(ред.)</span>
          )}
          {isOwnMessage && (
            <span className="text-timber-beam">
              {message.status === 'read' ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>

        {/* Actions menu */}
        {showActions && !isEditing && (
          <div
            className={cn(
              'absolute top-0 flex items-center gap-1 bg-canvas border border-timber-dark/20 rounded shadow-sm px-1 py-0.5',
              isOwnMessage ? '-left-20' : '-right-20'
            )}
          >
            {/* Quick reactions */}
            {AVAILABLE_REACTIONS.slice(0, 3).map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReaction(r.emoji)}
                className="p-1 hover:bg-timber-light rounded text-sm"
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-timber-light rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                {isOwnMessage && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Редагувати
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Видалити
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
