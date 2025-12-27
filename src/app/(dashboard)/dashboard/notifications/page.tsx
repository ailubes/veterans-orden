'use client';

import { useState } from 'react';
import { Bell, BellOff, CheckCheck, ChevronLeft, ChevronRight, Filter, AlertCircle, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from '@/components/dashboard/notification-item';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Notification, NotificationType } from '@/types/notifications';

const typeLabels: Record<NotificationType, string> = {
  info: 'Системні',
  success: 'Успіхи',
  warning: 'Попередження',
  alert: 'Важливі',
};

const typeConfig: Record<NotificationType, { icon: typeof Bell; colorClass: string; label: string }> = {
  info: { icon: Bell, colorClass: 'text-blue-500 bg-blue-500/10', label: 'Інформація' },
  success: { icon: CheckSquare, colorClass: 'text-green-500 bg-green-500/10', label: 'Успіх' },
  warning: { icon: AlertCircle, colorClass: 'text-yellow-500 bg-yellow-500/10', label: 'Попередження' },
  alert: { icon: AlertCircle, colorClass: 'text-red-500 bg-red-500/10', label: 'Увага' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    currentPage,
    totalPages,
    total,
  } = useNotifications({ limit: 20 });

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    fetchNotifications(1, newFilter);
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page, filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  // Filter by type (client-side for now)
  const filteredNotifications = typeFilter
    ? notifications.filter(n => n.type === typeFilter)
    : notifications;

  const config = selectedNotification
    ? typeConfig[selectedNotification.type] || typeConfig.info
    : typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label text-accent mb-2">СПОВІЩЕННЯ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold">
            Усі сповіщення
          </h1>
          <p className="text-sm text-timber-beam mt-1">
            {total > 0 ? (
              <>
                {total} сповіщень
                {unreadCount > 0 && ` • ${unreadCount} непрочитаних`}
              </>
            ) : (
              'Немає сповіщень'
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Прочитати всі
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Read/Unread Filter */}
        <div className="flex bg-timber-dark/5 rounded-lg p-1">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-timber-dark text-canvas'
                : 'text-timber-beam hover:text-timber-dark'
            }`}
          >
            Всі
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'unread'
                ? 'bg-timber-dark text-canvas'
                : 'text-timber-beam hover:text-timber-dark'
            }`}
          >
            Непрочитані
            {unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-accent text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | '')}
            className="appearance-none pl-3 pr-8 py-2 text-sm border-2 border-timber-dark/20 rounded-lg bg-canvas focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="">Усі типи</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam pointer-events-none" />
        </div>
      </div>

      {/* Notifications List */}
      {isLoading && filteredNotifications.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-timber-dark/5 rounded-lg h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Помилка завантаження сповіщень</p>
          <button
            onClick={() => fetchNotifications(currentPage, filter)}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Спробувати ще раз
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-canvas border-2 border-timber-dark p-12 relative text-center">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <BellOff className="w-12 h-12 mx-auto mb-4 text-timber-beam/40" />
          <h3 className="font-syne text-xl font-bold mb-2">
            {filter === 'unread' ? 'Немає непрочитаних сповіщень' : 'Немає сповіщень'}
          </h3>
          <p className="text-sm text-timber-beam mb-6">
            {filter === 'unread'
              ? 'Усі сповіщення прочитано'
              : 'Нові сповіщення з\'являться тут'}
          </p>
          <Link href="/dashboard" className="text-accent hover:underline text-sm">
            ← Повернутися до огляду
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              variant="full"
              onMarkRead={markAsRead}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-timber-beam hover:text-timber-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Попередня
          </button>

          <span className="text-sm text-timber-beam">
            Стор. {currentPage} з {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-timber-beam hover:text-timber-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Наступна
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
                      {formatDateTime(selectedNotification.deliveredAt)}
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
    </div>
  );
}
