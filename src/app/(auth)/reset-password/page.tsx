'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { HeavyCta } from '@/components/ui/heavy-cta';

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
      <div className="bg-panel-900 border border-line rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-bronze text-bg-950 flex items-center justify-center mx-auto mb-6 rounded-full">
            <Check size={32} />
          </div>

          <h1 className="font-inter font-black text-2xl mb-4 text-text-100">
            Перевірте пошту
          </h1>

          <p className="text-muted-500 mb-6">
            Ми надіслали інструкції для відновлення пароля на{' '}
            <strong className="text-text-100">{email}</strong>
          </p>

          <Link href="/sign-in" className="text-bronze hover:text-bronze/80 text-sm transition-colors">
            ← Повернутися до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-panel-850 border border-line text-bronze flex items-center justify-center mx-auto mb-4 rounded-lg">
          <Mail size={24} />
        </div>

        <h1 className="font-inter font-black text-2xl mb-2 text-text-100">
          Відновлення пароля
        </h1>
        <p className="text-sm text-muted-500">
          Введіть вашу електронну пошту і ми надішлемо інструкції
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
            Електронна пошта
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <HeavyCta
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
        >
          {loading ? 'НАДСИЛАННЯ...' : 'НАДІСЛАТИ ІНСТРУКЦІЇ'}
        </HeavyCta>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm text-muted-500 hover:text-bronze flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Повернутися до входу
        </Link>
      </div>
    </div>
  );
}
