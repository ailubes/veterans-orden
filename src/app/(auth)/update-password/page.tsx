'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Check } from 'lucide-react';
import { HeavyCta } from '@/components/ui/heavy-cta';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (password.length < 8) {
      setError('Пароль має бути не менше 8 символів');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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
            Пароль оновлено!
          </h1>

          <p className="text-muted-500">
            Перенаправляємо до кабінету...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel-900 border border-line rounded-lg p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-panel-850 border border-line text-bronze flex items-center justify-center mx-auto mb-4 rounded-lg">
          <Lock size={24} />
        </div>

        <h1 className="font-inter font-black text-2xl mb-2 text-text-100">
          Новий пароль
        </h1>
        <p className="text-sm text-muted-500">
          Введіть новий пароль для вашого акаунту
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
            Новий пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
            placeholder="Мінімум 8 символів"
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
            Підтвердіть пароль
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
            placeholder="Повторіть пароль"
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
          {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ НОВИЙ ПАРОЛЬ'}
        </HeavyCta>
      </form>
    </div>
  );
}
