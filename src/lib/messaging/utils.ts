/**
 * Messaging utility functions
 */

import { Conversation, Message, MessagingUser, MessageReaction } from '@/types/messaging';

/**
 * Format a timestamp for display in conversation list
 */
export function formatMessageTime(dateString: string | null): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Щойно';
  if (diffMins < 60) return `${diffMins} хв`;
  if (diffHours < 24) return `${diffHours} год`;
  if (diffDays < 7) return `${diffDays} дн`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format a full timestamp for message display
 */
export function formatFullMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return time;
  }

  if (isYesterday) {
    return `Вчора, ${time}`;
  }

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get display name for a conversation
 */
export function getConversationDisplayName(
  conversation: Conversation,
  currentUserId: string
): string {
  if (conversation.type === 'group') {
    return conversation.name || 'Групова розмова';
  }

  // For DMs, show the other participant's name
  if (conversation.otherParticipant) {
    const { firstName, lastName } = conversation.otherParticipant;
    return `${firstName} ${lastName}`.trim() || 'Користувач';
  }

  // Fallback
  return 'Приватна розмова';
}

/**
 * Get avatar URL for a conversation
 */
export function getConversationAvatar(
  conversation: Conversation,
  currentUserId: string
): string | null {
  if (conversation.type === 'group') {
    return conversation.avatarUrl;
  }

  // For DMs, show the other participant's avatar
  return conversation.otherParticipant?.avatarUrl || null;
}

/**
 * Get initials for avatar fallback
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

/**
 * Format participant count for display
 */
export function formatParticipantCount(count: number): string {
  if (count === 1) return '1 учасник';
  if (count >= 2 && count <= 4) return `${count} учасники`;
  return `${count} учасників`;
}

/**
 * Format unread count for badge
 */
export function formatUnreadCount(count: number): string {
  if (count > 99) return '99+';
  return count.toString();
}

/**
 * Group messages by date for display
 */
export interface MessageGroup {
  date: string;
  dateLabel: string;
  messages: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  const groups: Map<string, Message[]> = new Map();

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const dateKey = date.toISOString().split('T')[0];

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  return Array.from(groups.entries()).map(([dateKey, msgs]) => {
    let dateLabel: string;

    if (dateKey === today) {
      dateLabel = 'Сьогодні';
    } else if (dateKey === yesterdayKey) {
      dateLabel = 'Вчора';
    } else {
      dateLabel = new Date(dateKey).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    return {
      date: dateKey,
      dateLabel,
      messages: msgs,
    };
  });
}

/**
 * Parse emoji reactions from metadata
 */
export function parseReactions(
  metadata: Record<string, unknown> | null,
  currentUserId: string
): MessageReaction[] {
  if (!metadata?.reactions) return [];

  const reactionsData = metadata.reactions as Record<
    string,
    { userId: string; firstName: string; lastName: string }[]
  >;

  return Object.entries(reactionsData).map(([emoji, users]) => ({
    emoji,
    count: users.length,
    users: users.map((u) => ({ id: u.userId, firstName: u.firstName, lastName: u.lastName })),
    hasReacted: users.some((u) => u.userId === currentUserId),
  }));
}

/**
 * Get message preview text
 */
export function getMessagePreview(message: Message, maxLength: number = 50): string {
  if (message.isDeleted) {
    return 'Повідомлення видалено';
  }

  if (message.type === 'image') {
    return '📷 Фото';
  }

  if (message.type === 'file') {
    const fileName = message.attachments[0]?.name || 'Файл';
    return `📎 ${fileName}`;
  }

  if (message.type === 'system') {
    return message.content || 'Системне повідомлення';
  }

  const content = message.content || '';
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength) + '...';
}

/**
 * Check if messages should be grouped (same sender, within 5 minutes)
 */
export function shouldGroupMessages(
  prevMessage: Message | null,
  currentMessage: Message
): boolean {
  if (!prevMessage) return false;
  if (prevMessage.senderId !== currentMessage.senderId) return false;

  const prevTime = new Date(prevMessage.createdAt);
  const currTime = new Date(currentMessage.createdAt);
  const diffMinutes = (currTime.getTime() - prevTime.getTime()) / 1000 / 60;

  return diffMinutes <= 5;
}

/**
 * Generate a temporary message ID for optimistic updates
 */
export function generateTempMessageId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Check if a message ID is temporary
 */
export function isTempMessageId(id: string): boolean {
  return id.startsWith('temp-');
}

/**
 * Create a system message
 */
export function createSystemMessage(
  conversationId: string,
  content: string
): Partial<Message> {
  return {
    id: generateTempMessageId(),
    conversationId,
    senderId: null,
    sender: null,
    type: 'system',
    content,
    attachments: [],
    replyToId: null,
    reactions: [],
    isEdited: false,
    editedAt: null,
    isDeleted: false,
    deletedAt: null,
    status: 'sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Available emoji reactions
 */
export const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Подобається' },
  { emoji: '❤️', label: 'Любов' },
  { emoji: '😂', label: 'Смішно' },
  { emoji: '😮', label: 'Вау' },
  { emoji: '😢', label: 'Сумно' },
  { emoji: '😡', label: 'Злий' },
];

/**
 * Sort conversations by last message time
 */
export function sortConversationsByLastMessage(
  conversations: Conversation[]
): Conversation[] {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Filter conversations by search query
 */
export function filterConversations(
  conversations: Conversation[],
  query: string
): Conversation[] {
  if (!query.trim()) return conversations;

  const lowerQuery = query.toLowerCase();

  return conversations.filter((conv) => {
    // Check conversation name
    if (conv.name?.toLowerCase().includes(lowerQuery)) return true;

    // Check other participant name (for DMs)
    if (conv.otherParticipant) {
      const fullName =
        `${conv.otherParticipant.firstName} ${conv.otherParticipant.lastName}`.toLowerCase();
      if (fullName.includes(lowerQuery)) return true;
    }

    // Check last message preview
    if (conv.lastMessagePreview?.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });
}
