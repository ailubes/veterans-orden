'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            referral_code: referralCode,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        router.push('/onboarding');
      }
    } catch {
      setError('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {referralCode && (
        <div className="bg-accent/10 border border-accent p-3 mb-6 text-center">
          <p className="text-xs text-accent font-bold">
            ЗАПРОШЕННЯ ВІД ЧЛЕНА МЕРЕЖІ
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label block mb-2">ІМ&apos;Я</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="label block mb-2">ПРІЗВИЩЕ</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              required
            />
          </div>
        </div>

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

        <div>
          <label className="label block mb-2">ПАРОЛЬ</label>
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
          {loading ? 'РЕЄСТРАЦІЯ...' : 'ЗАРЕЄСТРУВАТИСЯ →'}
        </button>
      </form>

      <p className="mt-6 text-xs text-timber-beam text-center">
        Реєструючись, ви погоджуєтесь з{' '}
        <Link href="/terms" className="text-accent hover:underline">
          Умовами використання
        </Link>{' '}
        та{' '}
        <Link href="/privacy" className="text-accent hover:underline">
          Політикою конфіденційності
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative">
      {/* Corner joints */}
      <div className="joint joint-tl" />
      <div className="joint joint-tr" />
      <div className="joint joint-bl" />
      <div className="joint joint-br" />

      <h1 className="font-syne font-bold text-2xl mb-2 text-center">
        ПРИЄДНАТИСЯ
      </h1>
      <p className="text-center text-sm text-timber-beam mb-6">
        Стань частиною Мережі Вільних Людей
      </p>

      <Suspense fallback={<div className="text-center py-4">Завантаження...</div>}>
        <SignUpForm />
      </Suspense>

      <div className="mt-6 text-center">
        <p className="text-sm text-timber-beam">
          Вже маєте акаунт?{' '}
          <Link href="/sign-in" className="text-accent hover:underline font-bold">
            УВІЙТИ
          </Link>
        </p>
      </div>
    </div>
  );
}
