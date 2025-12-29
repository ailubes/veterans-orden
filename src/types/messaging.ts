// =============================================
// MESSAGING SYSTEM TYPES
// =============================================

export type ConversationType = 'direct' | 'group';
export type ParticipantRole = 'owner' | 'admin' | 'member';
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// =============================================
// ATTACHMENT
// =============================================

export interface MessageAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  s3Key?: string;
}

// =============================================
// REACTION
// =============================================

export interface MessageReaction {
  emoji: string;
  count: number;
  users: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  hasReacted: boolean;
}

// =============================================
// USER (simplified for messaging)
// =============================================

export interface MessagingUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  membershipRole: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

// =============================================
// MESSAGE
// =============================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  sender: MessagingUser | null;
  type: MessageType;
  content: string | null;
  attachments: MessageAttachment[];
  replyToId: string | null;
  replyTo?: Message | null;
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  // Pin fields
  pinnedAt: string | null;
  pinnedBy: string | null;
  // Forward fields
  forwardedFromMessageId: string | null;
  forwardedFromConversationId: string | null;
  forwardedFromSenderName: string | null;
  // Client-side enriched
  isStarred?: boolean;
}

// =============================================
// PARTICIPANT
// =============================================

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: MessagingUser;
  role: ParticipantRole;
  isMuted: boolean;
  mutedUntil: string | null;
  lastReadAt: string | null;
  lastReadMessageId: string | null;
  unreadCount: number;
  isActive: boolean;
  joinedAt: string;
}

// =============================================
// CONVERSATION
// =============================================

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  avatarUrl: string | null;
  createdById: string;
  isActive: boolean;
  allowReplies: boolean;
  participantCount: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  lastMessageSender?: MessagingUser | null;
  createdAt: string;
  updatedAt: string;
  // Pinned messages
  pinnedMessageIds: string[];
  pinnedMessages?: PinnedMessage[];
  // Client-side enriched fields
  participants?: ConversationParticipant[];
  otherParticipant?: MessagingUser | null; // For DMs
  unreadCount?: number;
  isMuted?: boolean;
}

// =============================================
// PINNED MESSAGE (simplified for display)
// =============================================

export interface PinnedMessage {
  id: string;
  content: string | null;
  senderName: string;
  pinnedAt: string;
}

// =============================================
// PRESENCE
// =============================================

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt: string;
  currentConversationId: string | null;
}

// =============================================
// API REQUEST/RESPONSE TYPES
// =============================================

export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  description?: string;
}

export interface SendMessageRequest {
  content?: string;
  type?: MessageType;
  attachments?: MessageAttachment[];
  replyToId?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface AddParticipantsRequest {
  userIds: string[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageActionResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface UnreadCountResponse {
  totalUnread: number;
  byConversation: Record<string, number>;
}

// =============================================
// MESSAGING SETTINGS
// =============================================

export interface MessagingSettings {
  messaging_enabled: boolean;
  messaging_dm_enabled: boolean;
  messaging_group_chat_enabled: boolean;
  messaging_dm_initiator_roles: string[];
  messaging_group_creator_roles: string[];
  messaging_same_group_enabled: boolean;
  messaging_cross_group_enabled: boolean;
  messaging_attachments_enabled: boolean;
  messaging_max_attachment_size_mb: number;
  messaging_allowed_attachment_types: string[];
  messaging_rate_limit_messages_per_minute: number;
  messaging_max_group_participants: number;
  messaging_edit_window_minutes: number;
}

// =============================================
// TYPING INDICATOR
// =============================================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  user: MessagingUser;
  isTyping: boolean;
  timestamp: number;
}

// =============================================
// REALTIME EVENTS
// =============================================

export interface RealtimeMessageEvent {
  type: 'new_message' | 'update_message' | 'delete_message';
  message: Message;
}

export interface RealtimeTypingEvent {
  type: 'typing';
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface RealtimePresenceEvent {
  type: 'presence';
  userId: string;
  isOnline: boolean;
  lastSeenAt: string;
}

export interface RealtimeReadEvent {
  type: 'read';
  conversationId: string;
  userId: string;
  messageId: string;
  readAt: string;
}

// =============================================
// FORWARD MESSAGE
// =============================================

export interface ForwardMessageRequest {
  conversationIds: string[];
  comment?: string;
}

export interface ForwardMessageResponse {
  success: boolean;
  forwardedMessages: Message[];
  error?: string;
}

// =============================================
// PIN MESSAGE
// =============================================

export interface PinMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

// =============================================
// STAR MESSAGE
// =============================================

export interface StarMessageResponse {
  success: boolean;
  isStarred: boolean;
  error?: string;
}

// =============================================
// BULK ACTIONS
// =============================================

export interface BulkDeleteRequest {
  messageIds: string[];
}

export interface BulkDeleteResponse {
  success: boolean;
  deletedCount: number;
  error?: string;
}
