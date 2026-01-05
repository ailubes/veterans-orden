'use client';

import { useState, useEffect } from 'react';
import { X, UserCog, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImpersonationSession {
  id: string;
  target_user: {
    id: string;
    name: string;
    email: string;
  };
  started_at: string;
}

export default function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    checkSession();
    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkSession() {
    try {
      const response = await fetch('/api/admin/impersonation/status');
      if (response.ok) {
        const data = await response.json();
        setSession(data.session || null);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Error checking impersonation session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  async function endImpersonation() {
    if (!session) return;

    setEnding(true);
    try {
      const response = await fetch(
        `/api/admin/members/${session.target_user.id}/impersonate`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to end impersonation');
      }

      toast({
        title: 'Імперсонацію завершено',
        description: `Ви більше не переглядаєте систему як ${session.target_user.name}`,
      });

      setSession(null);

      // Reload page to return to normal admin view
      window.location.href = '/admin';
    } catch (error) {
      console.error('Error ending impersonation:', error);
      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: 'Не вдалося завершити імперсонацію',
      });
    } finally {
      setEnding(false);
    }
  }

  function getElapsedTime(): string {
    if (!session) return '';

    const startTime = new Date(session.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000 / 60); // minutes

    if (elapsed < 1) return 'менше хвилини';
    if (elapsed === 1) return '1 хвилина';
    if (elapsed < 5) return `${elapsed} хвилини`;
    return `${elapsed} хвилин`;
  }

  if (loading || !session) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-bronze border-b-4 border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-canvas">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <UserCog className="w-5 h-5" />
            </div>

            <div className="text-canvas">
              <p className="font-syne font-bold text-sm sm:text-base">
                🔐 Режим імперсонації активний
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                Ви переглядаєте систему як{' '}
                <span className="font-bold">{session.target_user.name}</span> (
                {session.target_user.email})
              </p>
              <p className="text-xs opacity-75 mt-0.5">
                Тривалість: {getElapsedTime()} • Макс: 1 година
              </p>
            </div>
          </div>

          <button
            onClick={endImpersonation}
            disabled={ending}
            className="btn-outline bg-panel-900 text-bronze border-2 border-canvas hover:bg-panel-900/90 hover:text-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            {ending ? (
              <>
                <div className="w-4 h-4 border-2 border-bronze border-t-transparent rounded-full animate-spin" />
                Завершення...
              </>
            ) : (
              <>
                <X className="w-4 h-4" />
                Завершити імперсонацію
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning stripe */}
      <div className="h-1 bg-gradient-to-r from-canvas via-timber-beam to-canvas animate-pulse" />
    </div>
  );
}
