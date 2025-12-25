'use client';

import { Bell, Vote, Calendar, CheckSquare, Trophy, Newspaper, Users, AlertCircle } from 'lucide-react';
import type { Notification, NotificationType } from '@/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  variant?: 'compact' | 'full';
  onMarkRead?: (id: string) => void;
  onClick?: () => void;
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; colorClass: string }> = {
  info: { icon: Bell, colorClass: 'text-blue-500 bg-blue-500/10' },
  success: { icon: CheckSquare, colorClass: 'text-green-500 bg-green-500/10' },
  warning: { icon: AlertCircle, colorClass: 'text-yellow-500 bg-yellow-500/10' },
  alert: { icon: AlertCircle, colorClass: 'text-red-500 bg-red-500/10' },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Щойно';
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays === 1) return 'Вчора';
  if (diffDays < 7) return `${diffDays} дн тому`;

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });
}

export function NotificationItem({
  notification,
  variant = 'compact',
  onMarkRead,
  onClick,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
    onClick?.();
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`
          w-full text-left p-3 transition-colors
          hover:bg-timber-dark/5
          ${!notification.isRead ? 'bg-accent/5' : ''}
        `}
      >
        <div className="flex gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.colorClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            <p className="text-xs text-timber-beam mt-0.5">
              {formatTimeAgo(notification.deliveredAt)}
            </p>
          </div>
          {!notification.isRead && (
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />
          )}
        </div>
      </button>
    );
  }

  // Full variant for notifications page
  return (
    <div
      onClick={handleClick}
      className={`
        p-4 border-2 border-timber-dark/10 rounded-lg cursor-pointer
        transition-all hover:border-timber-dark/20
        ${!notification.isRead ? 'bg-accent/5 border-accent/20' : 'bg-white'}
      `}
    >
      <div className="flex gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
              {notification.title}
            </h3>
            {!notification.isRead && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-accent text-white rounded">
                Нове
              </span>
            )}
          </div>
          <p className="text-sm text-timber-beam mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-timber-beam/70">
            <span>{formatTimeAgo(notification.deliveredAt)}</span>
            {notification.sender && (
              <>
                <span>•</span>
                <span>
                  {notification.sender.firstName} {notification.sender.lastName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
