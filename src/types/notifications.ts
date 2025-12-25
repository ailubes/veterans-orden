export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'alert';

export interface Notification {
  id: string;
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  deliveredAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface MarkReadResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkAllReadResponse {
  success: boolean;
  markedCount: number;
  unreadCount: number;
}
