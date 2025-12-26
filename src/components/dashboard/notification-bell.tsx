'use client';

import { useState } from 'react';
import { Bell, BellOff, AlertCircle, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';
import type { Notification, NotificationType } from '@/types/notifications';

interface NotificationBellProps {
  variant?: 'light' | 'dark';
  className?: string;
}

const typeConfig: Record<NotificationType, { icon: typeof Bell; colorClass: string; label: string }> = {
  info: { icon: Bell, colorClass: 'text-blue-500 bg-blue-500/10', label: 'Інформація' },
  success: { icon: CheckSquare, colorClass: 'text-green-500 bg-green-500/10', label: 'Успіх' },
  warning: { icon: AlertCircle, colorClass: 'text-yellow-500 bg-yellow-500/10', label: 'Попередження' },
  alert: { icon: AlertCircle, colorClass: 'text-red-500 bg-red-500/10', label: 'Увага' },
};

export function NotificationBell({ variant = 'dark', className = '' }: NotificationBellProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const config = selectedNotification
    ? typeConfig[selectedNotification.type] || typeConfig.info
    : typeConfig.info;
  const Icon = config.icon;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`relative p-2 rounded-lg transition-colors ${hoverBg} ${textColor} ${className}`}
            aria-label={`Сповіщення${unreadCount > 0 ? ` (${unreadCount} непрочитаних)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full px-1">
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
                    onClick={() => handleNotificationClick(notification)}
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

      {/* Full Notification Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-canvas border-2 border-timber-dark max-w-md">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.colorClass}`}>
                      {config.label.toUpperCase()}
                    </span>
                  </div>
                </div>
                <DialogTitle className="font-syne text-lg">
                  {selectedNotification.title}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-2">
                <p className="text-sm text-timber-dark whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>

                <div className="mt-4 pt-4 border-t border-timber-dark/10 text-xs text-timber-beam">
                  <div className="flex justify-between">
                    <span>
                      {new Date(selectedNotification.deliveredAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {selectedNotification.sender && (
                      <span>
                        Від: {selectedNotification.sender.firstName} {selectedNotification.sender.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
