'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Check } from 'lucide-react';

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
      <div className="bg-canvas border-2 border-timber-dark p-8 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center mx-auto mb-6 rounded-full">
            <Check size={32} />
          </div>

          <h1 className="font-syne font-bold text-2xl mb-4">
            Пароль оновлено!
          </h1>

          <p className="text-timber-beam">
            Перенаправляємо до кабінету...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative">
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-timber-dark text-canvas flex items-center justify-center mx-auto mb-4">
          <Lock size={24} />
        </div>

        <h1 className="font-syne font-bold text-2xl mb-2">
          Новий пароль
        </h1>
        <p className="text-sm text-timber-beam">
          Введіть новий пароль для вашого акаунту
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label block mb-2">НОВИЙ ПАРОЛЬ</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            placeholder="Мінімум 8 символів"
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="label block mb-2">ПІДТВЕРДІТЬ ПАРОЛЬ</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            placeholder="Повторіть пароль"
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
          {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ НОВИЙ ПАРОЛЬ →'}
        </button>
      </form>
    </div>
  );
}
