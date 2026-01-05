'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { HeavyCta } from '@/components/ui/heavy-cta';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <div className="bg-bronze/10 border border-bronze/30 rounded-lg p-3 mb-6 text-center">
          <p className="text-xs text-bronze font-bold">
            ЗАПРОШЕННЯ ВІД ЧЛЕНА ОРДЕНУ
          </p>
        </div>
      )}

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

        <div>
          <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
            Пароль
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
          {loading ? 'РЕЄСТРАЦІЯ...' : 'ЗАРЕЄСТРУВАТИСЯ'}
        </HeavyCta>
      </form>

      <p className="mt-6 text-xs text-muted-500 text-center">
        Реєструючись, ви погоджуєтесь з{' '}
        <Link href="/terms" className="text-bronze hover:text-bronze/80 transition-colors">
          Умовами використання
        </Link>{' '}
        та{' '}
        <Link href="/privacy" className="text-bronze hover:text-bronze/80 transition-colors">
          Політикою конфіденційності
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <div className="bg-panel-900 border border-line rounded-lg p-8">
      <h1 className="font-inter font-black text-2xl mb-2 text-center text-text-100">
        ПРИЄДНАТИСЯ
      </h1>
      <p className="text-center text-sm text-muted-500 mb-6">
        Стань частиною Ордену Ветеранів
      </p>

      <Suspense fallback={<div className="text-center py-4 text-muted-500">Завантаження...</div>}>
        <SignUpForm />
      </Suspense>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-500">
          Вже маєте акаунт?{' '}
          <Link href="/sign-in" className="text-bronze hover:text-bronze/80 font-bold transition-colors">
            УВІЙТИ
          </Link>
        </p>
      </div>
    </div>
  );
}
