'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function EmailTester() {
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [emailType, setEmailType] = useState<'welcome' | 'event_reminder' | 'vote_reminder'>('welcome');

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: 'Помилка',
        description: 'Введіть email адресу',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      let payload;

      switch (emailType) {
        case 'welcome':
          payload = {
            type: 'welcome',
            to: testEmail,
            firstName: 'Тестовий',
            lastName: 'Користувач',
          };
          break;

        case 'event_reminder':
          payload = {
            type: 'event_reminder',
            to: testEmail,
            firstName: 'Тестовий',
            eventTitle: 'Регіональна зустріч у Києві',
            eventDate: new Date(Date.now() + 86400000).toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            eventUrl: 'https://freepeople.org.ua/events/test',
          };
          break;

        case 'vote_reminder':
          payload = {
            type: 'vote_reminder',
            to: testEmail,
            firstName: 'Тестовий',
            voteTitle: 'Голосування за регіональні ініціативи',
            voteDeadline: new Date(Date.now() + 172800000).toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            voteUrl: 'https://freepeople.org.ua/votes/test',
          };
          break;
      }

      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send email');
      }

      toast({
        title: 'Email відправлено',
        description: `Тестовий email успішно відправлено на ${testEmail}`,
      });

      setTestEmail('');
    } catch (error) {
      console.error('Send email error:', error);
      toast({
        title: 'Помилка відправки',
        description: error instanceof Error ? error.message : 'Не вдалося відправити email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-3px', left: '-3px' }} />
      <div className="joint" style={{ top: '-3px', right: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-accent" />
        <h3 className="font-bold text-xl">Тестування Email</h3>
      </div>

      <div className="space-y-4">
        {/* Email Type */}
        <div>
          <label className="block text-sm font-medium mb-2">ТИП EMAIL</label>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value as 'welcome' | 'event_reminder' | 'vote_reminder')}
            className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          >
            <option value="welcome">Вітальний email</option>
            <option value="event_reminder">Нагадування про подію</option>
            <option value="vote_reminder">Нагадування про голосування</option>
          </select>
        </div>

        {/* Test Email Input */}
        <div>
          <label className="block text-sm font-medium mb-2">ТЕСТОВА АДРЕСА</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendTest}
          disabled={sending || !testEmail}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Відправка...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Відправити тестовий email
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">Підказка</p>
            <p>
              Використовуйте цей інструмент для тестування email шаблонів перед відправкою членам мережі.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
