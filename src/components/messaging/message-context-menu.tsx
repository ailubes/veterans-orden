'use client';

import { Message, ParticipantRole } from '@/types/messaging';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Reply,
  Forward,
  Copy,
  Pin,
  PinOff,
  Star,
  Pencil,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageContextMenuProps {
  message: Message;
  isOwnMessage: boolean;
  userRole?: ParticipantRole;
  isStarred?: boolean;
  isPinned?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onPin: () => void;
  onStar: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  align?: 'start' | 'end';
  children?: React.ReactNode;
}

export function MessageContextMenu({
  message,
  isOwnMessage,
  userRole = 'member',
  isStarred = false,
  isPinned = false,
  canEdit = false,
  canDelete = false,
  canPin = false,
  isOpen,
  onOpenChange,
  onReply,
  onForward,
  onCopy,
  onPin,
  onStar,
  onEdit,
  onDelete,
  onSelect,
  align = 'start',
  children,
}: MessageContextMenuProps) {
  const hasContent = message.content && message.content.trim().length > 0;
  const isDeleted = message.isDeleted;

  // Determine permissions
  const showEdit = canEdit && isOwnMessage && !isDeleted;
  const showDelete = (canDelete || isOwnMessage) && !isDeleted;
  const showPin = canPin && !isDeleted;
  const showForward = !isDeleted;
  const showCopy = hasContent && !isDeleted;

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {children || (
          <button className="p-1 hover:bg-panel-850 rounded transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {/* Reply - always available for non-deleted messages */}
        {!isDeleted && (
          <DropdownMenuItem onClick={onReply} className="cursor-pointer">
            <Reply className="w-4 h-4 mr-2" />
            Відповісти
          </DropdownMenuItem>
        )}

        {/* Forward */}
        {showForward && (
          <DropdownMenuItem onClick={onForward} className="cursor-pointer">
            <Forward className="w-4 h-4 mr-2" />
            Переслати
          </DropdownMenuItem>
        )}

        {/* Copy */}
        {showCopy && (
          <DropdownMenuItem onClick={onCopy} className="cursor-pointer">
            <Copy className="w-4 h-4 mr-2" />
            Копіювати
          </DropdownMenuItem>
        )}

        {/* Select (for multi-select mode) */}
        {!isDeleted && (
          <DropdownMenuItem onClick={onSelect} className="cursor-pointer">
            <CheckSquare className="w-4 h-4 mr-2" />
            Вибрати
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Star/Unstar */}
        {!isDeleted && (
          <DropdownMenuItem onClick={onStar} className="cursor-pointer">
            <Star
              className={cn(
                'w-4 h-4 mr-2',
                isStarred && 'fill-yellow-400 text-yellow-400'
              )}
            />
            {isStarred ? 'Прибрати зірку' : 'Додати зірку'}
          </DropdownMenuItem>
        )}

        {/* Pin/Unpin - only for admins/owners */}
        {showPin && (
          <DropdownMenuItem onClick={onPin} className="cursor-pointer">
            {isPinned ? (
              <>
                <PinOff className="w-4 h-4 mr-2" />
                Відкріпити
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 mr-2" />
                Закріпити
              </>
            )}
          </DropdownMenuItem>
        )}

        {/* Edit - only for own messages within edit window */}
        {showEdit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Pencil className="w-4 h-4 mr-2" />
              Редагувати
            </DropdownMenuItem>
          </>
        )}

        {/* Delete */}
        {showDelete && (
          <>
            {!showEdit && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={onDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Видалити
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Standalone context menu trigger button with quick reactions
interface MessageActionsBarProps {
  message: Message;
  isOwnMessage: boolean;
  userRole?: ParticipantRole;
  isStarred?: boolean;
  isPinned?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  quickReactions?: { emoji: string; label: string }[];
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onPin: () => void;
  onStar: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

export function MessageActionsBar({
  message,
  isOwnMessage,
  userRole,
  isStarred,
  isPinned,
  canEdit,
  canDelete,
  canPin,
  quickReactions = [],
  onReaction,
  onReply,
  onForward,
  onCopy,
  onPin,
  onStar,
  onEdit,
  onDelete,
  onSelect,
}: MessageActionsBarProps) {
  return (
    <div
      className={cn(
        'absolute top-0 flex items-center gap-1 bg-panel-900 border border-line/20 rounded shadow-sm px-1 py-0.5 z-10',
        isOwnMessage ? '-left-24' : '-right-24'
      )}
    >
      {/* Quick reactions */}
      {quickReactions.slice(0, 3).map((r) => (
        <button
          key={r.emoji}
          onClick={() => onReaction(r.emoji)}
          className="p-1 hover:bg-panel-850 rounded text-sm transition-colors"
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}

      {/* Quick reply button */}
      <button
        onClick={onReply}
        className="p-1 hover:bg-panel-850 rounded transition-colors"
        title="Відповісти"
      >
        <Reply className="w-4 h-4" />
      </button>

      {/* Context menu */}
      <MessageContextMenu
        message={message}
        isOwnMessage={isOwnMessage}
        userRole={userRole}
        isStarred={isStarred}
        isPinned={isPinned}
        canEdit={canEdit}
        canDelete={canDelete}
        canPin={canPin}
        onReply={onReply}
        onForward={onForward}
        onCopy={onCopy}
        onPin={onPin}
        onStar={onStar}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelect={onSelect}
        align={isOwnMessage ? 'end' : 'start'}
      />
    </div>
  );
}
