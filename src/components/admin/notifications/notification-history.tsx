'use client';

import { useEffect, useState } from 'react';
import { Bell, Users, Eye } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  scope: string;
  scope_value: string | null;
  recipient_count: number;
  read_count: number;
  sent_at: string;
  sender: {
    first_name: string;
    last_name: string;
  } | null;
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/notifications/history');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatScope = (scope: string, scopeValue: string | null) => {
    const labels: Record<string, string> = {
      all: 'Всі користувачі',
      role: `Роль: ${scopeValue}`,
      oblast: 'За областю',
      tier: `План: ${scopeValue}`,
      user: 'Один користувач',
      referral_tree: 'Реферальне дерево',
    };

    return labels[scope] || scope;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      alert: 'bg-red-100 text-red-700',
    };

    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="text-center py-8 text-timber-beam">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-6 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <div className="text-center py-8 text-timber-beam">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Ще немає надісланих сповіщень</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas border-2 border-timber-dark relative">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <div className="max-h-[600px] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border-b border-timber-dark/20 last:border-b-0 hover:bg-timber-dark/5 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {notification.type.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-sm truncate">
                    {notification.title}
                  </h3>
                </div>
                <p className="text-xs text-timber-beam line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-timber-beam mt-3">
              <div className="flex items-center gap-1" title="Отримувачів">
                <Users className="w-3 h-3" />
                <span>{notification.recipient_count}</span>
              </div>
              <div className="flex items-center gap-1" title="Прочитано">
                <Eye className="w-3 h-3" />
                <span>
                  {notification.read_count}/{notification.recipient_count}
                </span>
              </div>
              <div className="flex-1">
                {formatScope(notification.scope, notification.scope_value)}
              </div>
              <div className="text-right">
                {formatDateTime(notification.sent_at)}
              </div>
            </div>

            {/* Sender */}
            {notification.sender && (
              <p className="text-xs text-timber-beam/60 mt-2">
                Від: {notification.sender.first_name}{' '}
                {notification.sender.last_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
