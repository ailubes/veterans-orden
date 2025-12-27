'use client';

import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

interface NotificationFormProps {
  adminRole: string;
  adminId: string;
  isRegionalLeader: boolean;
}

const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Інформація', color: 'bg-blue-100 text-blue-700' },
  { value: 'success', label: 'Успіх', color: 'bg-green-100 text-green-700' },
  { value: 'warning', label: 'Попередження', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'alert', label: 'Увага', color: 'bg-red-100 text-red-700' },
];

export function NotificationForm({
  adminRole,
  isRegionalLeader,
}: NotificationFormProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [scope, setScope] = useState('all');
  const [scopeValue, setScopeValue] = useState('');
  const [sending, setSending] = useState(false);

  // Determine available scopes based on role
  const getAvailableScopes = () => {
    if (adminRole === 'super_admin' || adminRole === 'admin') {
      return [
        { value: 'all', label: 'Всі активні користувачі' },
        { value: 'role', label: 'За роллю' },
        { value: 'oblast', label: 'За областю' },
        { value: 'tier', label: 'За планом членства' },
        { value: 'payment_expired', label: 'Прострочені платежі' },
        { value: 'never_paid', label: 'Ніколи не платили' },
        { value: 'user', label: 'Конкретний користувач' },
      ];
    }

    if (isRegionalLeader) {
      return [
        { value: 'referral_tree', label: 'Моє реферальне дерево' },
        { value: 'user', label: 'Конкретний користувач' },
      ];
    }

    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Заголовок та повідомлення обов\'язкові',
      });
      return;
    }

    const scopesWithoutValue = ['all', 'referral_tree', 'payment_expired', 'never_paid'];
    if (!scopesWithoutValue.includes(scope) && !scopeValue) {
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Будь ласка, вкажіть значення для обраного фільтра',
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          scope,
          scopeValue: scopeValue || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      toast({
        title: 'Сповіщення надіслано',
        description: data.message || `Надіслано ${data.recipientCount} користувачам`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setScope('all');
      setScopeValue('');

      // Reload page to refresh history
      window.location.reload();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description:
          error instanceof Error ? error.message : 'Не вдалося надіслати сповіщення',
      });
    } finally {
      setSending(false);
    }
  };

  const availableScopes = getAvailableScopes();

  return (
    <form onSubmit={handleSubmit} className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-3px', left: '-3px' }} />
      <div className="joint" style={{ top: '-3px', right: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Заголовок <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Короткий заголовок сповіщення"
            className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            required
          />
          <p className="text-xs text-timber-beam mt-1">
            {title.length}/200 символів
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Повідомлення <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Детальний текст повідомлення"
            className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none resize-none"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-bold mb-2">Тип</label>
          <div className="grid grid-cols-2 gap-2">
            {NOTIFICATION_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-2 text-sm font-bold border-2 transition-colors ${
                  type === t.value
                    ? `${t.color} border-timber-dark`
                    : 'bg-timber-dark/5 border-timber-dark/30 hover:border-timber-dark'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Кому надіслати <span className="text-red-500">*</span>
          </label>
          <select
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setScopeValue('');
            }}
            className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            required
          >
            {availableScopes.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Scope Value (conditional) */}
        {scope === 'role' && (
          <div>
            <label className="block text-sm font-bold mb-2">Роль</label>
            <select
              value={scopeValue}
              onChange={(e) => setScopeValue(e.target.value)}
              className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              required
            >
              <option value="">Оберіть роль...</option>
              <option value="full_member">Повноцінний член</option>
              <option value="group_leader">Лідер групи</option>
              <option value="regional_leader">Регіональний лідер</option>
            </select>
          </div>
        )}

        {scope === 'tier' && (
          <div>
            <label className="block text-sm font-bold mb-2">
              План членства
            </label>
            <select
              value={scopeValue}
              onChange={(e) => setScopeValue(e.target.value)}
              className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              required
            >
              <option value="">Оберіть план...</option>
              <option value="free">Безкоштовний</option>
              <option value="basic_49">Базовий (49 грн)</option>
              <option value="supporter_100">Прихильник (100 грн)</option>
              <option value="supporter_200">Прихильник (200 грн)</option>
              <option value="patron_500">Патрон (500 грн)</option>
            </select>
          </div>
        )}

        {scope === 'user' && (
          <div>
            <label className="block text-sm font-bold mb-2">
              ID користувача
            </label>
            <input
              type="text"
              value={scopeValue}
              onChange={(e) => setScopeValue(e.target.value)}
              placeholder="UUID користувача"
              className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              required
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={sending}
          className="btn w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-canvas border-t-transparent rounded-full animate-spin" />
              Надсилання...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Надіслати сповіщення
            </>
          )}
        </button>
      </div>
    </form>
  );
}
