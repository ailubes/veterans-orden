'use client';

import { Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';

interface NotificationBellProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function NotificationBell({ variant = 'dark', className = '' }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ limit: 5, pollInterval: 30000 });

  const recentNotifications = notifications.slice(0, 5);

  const textColor = variant === 'dark' ? 'text-canvas' : 'text-timber-dark';
  const hoverBg = variant === 'dark' ? 'hover:bg-canvas/10' : 'hover:bg-timber-dark/10';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative p-2 rounded-lg transition-colors ${hoverBg} ${textColor} ${className}`}
          aria-label={`Сповіщення${unreadCount > 0 ? ` (${unreadCount} непрочитаних)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-accent rounded-full px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-canvas border-2 border-timber-dark"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-timber-dark/10">
          <h3 className="font-syne font-bold text-sm">СПОВІЩЕННЯ</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-accent hover:underline"
            >
              Прочитати всі
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[320px] overflow-y-auto">
          {isLoading && recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-timber-beam">
              Завантаження...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <BellOff className="w-8 h-8 mx-auto mb-2 text-timber-beam/40" />
              <p className="text-sm text-timber-beam">Немає сповіщень</p>
            </div>
          ) : (
            <div className="divide-y divide-timber-dark/5">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  variant="compact"
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator className="bg-timber-dark/10" />
        <Link
          href="/dashboard/notifications"
          className="block p-3 text-center text-sm font-medium text-accent hover:bg-accent/5 transition-colors"
        >
          Переглянути всі сповіщення →
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
