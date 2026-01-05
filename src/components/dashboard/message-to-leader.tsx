'use client';

import { useState } from 'react';
import { Send, User, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageToLeaderProps {
  referrerId?: string | null;
  referrerName?: string | null;
  regionalLeaderId?: string | null;
  regionalLeaderName?: string | null;
  oblastName?: string | null;
}

export function MessageToLeader({
  referrerId,
  referrerName,
  regionalLeaderId,
  regionalLeaderName,
  oblastName,
}: MessageToLeaderProps) {
  const [targetType, setTargetType] = useState<'referrer' | 'regional_leader'>(
    referrerId ? 'referrer' : 'regional_leader'
  );
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const hasReferrer = Boolean(referrerId && referrerName);
  const hasRegionalLeader = Boolean(regionalLeaderId && regionalLeaderName);

  if (!hasReferrer && !hasRegionalLeader) {
    return (
      <div className="text-center text-muted-500 py-4">
        <p className="text-sm">
          Наразі немає доступних лідерів для надсилання повідомлень.
        </p>
      </div>
    );
  }

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

    setSending(true);

    try {
      const response = await fetch('/api/members/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          title,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не вдалося надіслати повідомлення');
      }

      toast({
        title: 'Повідомлення надіслано',
        description: data.message,
      });

      // Reset form
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description:
          error instanceof Error ? error.message : 'Не вдалося надіслати повідомлення',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Target Selection */}
      {hasReferrer && hasRegionalLeader && (
        <div>
          <label className="block text-sm font-bold mb-2">Кому надіслати</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('referrer')}
              className={`flex items-center gap-3 px-4 py-3 border-2 transition-colors ${
                targetType === 'referrer'
                  ? 'border-bronze bg-bronze/10'
                  : 'border-line/30 hover:border-line'
              }`}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-bold text-sm">Моєму рефереру</div>
                <div className="text-xs text-muted-500">{referrerName}</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('regional_leader')}
              className={`flex items-center gap-3 px-4 py-3 border-2 transition-colors ${
                targetType === 'regional_leader'
                  ? 'border-bronze bg-bronze/10'
                  : 'border-line/30 hover:border-line'
              }`}
            >
              <Users className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-bold text-sm">Регіональному лідеру</div>
                <div className="text-xs text-muted-500">
                  {regionalLeaderName} ({oblastName})
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Single option display */}
      {hasReferrer && !hasRegionalLeader && (
        <div className="flex items-center gap-3 px-4 py-3 bg-panel-850/5 border border-line rounded-lg/20">
          <User className="w-5 h-5 text-bronze" />
          <div>
            <div className="font-bold text-sm">Надіслати моєму рефереру</div>
            <div className="text-xs text-muted-500">{referrerName}</div>
          </div>
        </div>
      )}

      {!hasReferrer && hasRegionalLeader && (
        <div className="flex items-center gap-3 px-4 py-3 bg-panel-850/5 border border-line rounded-lg/20">
          <Users className="w-5 h-5 text-bronze" />
          <div>
            <div className="font-bold text-sm">Надіслати регіональному лідеру</div>
            <div className="text-xs text-muted-500">
              {regionalLeaderName} ({oblastName})
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-bold mb-2">
          Тема <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Коротка тема повідомлення"
          className="w-full px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
          required
        />
        <p className="text-xs text-muted-500 mt-1">{title.length}/200</p>
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
          placeholder="Ваше повідомлення..."
          className="w-full px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none resize-none"
          required
        />
      </div>

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
            Надіслати повідомлення
          </>
        )}
      </button>
    </form>
  );
}
