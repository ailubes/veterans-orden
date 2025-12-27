'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Check } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-canvas border-2 border-timber-dark p-8 relative">
        <div className="joint" style={{ top: '-3px', left: '-3px' }} />
        <div className="joint" style={{ top: '-3px', right: '-3px' }} />
        <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
        <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center mx-auto mb-6 rounded-full">
            <Check size={32} />
          </div>

          <h1 className="font-syne font-bold text-2xl mb-4">
            Перевірте пошту
          </h1>

          <p className="text-timber-beam mb-6">
            Ми надіслали інструкції для відновлення пароля на{' '}
            <strong>{email}</strong>
          </p>

          <Link href="/sign-in" className="text-accent hover:underline text-sm">
            ← Повернутися до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative">
      <div className="joint" style={{ top: '-3px', left: '-3px' }} />
      <div className="joint" style={{ top: '-3px', right: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-timber-dark text-canvas flex items-center justify-center mx-auto mb-4">
          <Mail size={24} />
        </div>

        <h1 className="font-syne font-bold text-2xl mb-2">
          Відновлення пароля
        </h1>
        <p className="text-sm text-timber-beam">
          Введіть вашу електронну пошту і ми надішлемо інструкції
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label block mb-2">ЕЛЕКТРОННА ПОШТА</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            placeholder="your@email.com"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'НАДСИЛАННЯ...' : 'НАДІСЛАТИ ІНСТРУКЦІЇ →'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm text-timber-beam hover:text-accent flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Повернутися до входу
        </Link>
      </div>
    </div>
  );
}
