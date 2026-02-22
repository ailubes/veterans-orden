'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HeavyCta } from '@/components/ui/heavy-cta';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

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
        setRegistered(true);
      }
    } catch {
      setError('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-bronze/10 border border-bronze/30 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-bronze" />
          </div>
        </div>
        <h2 className="font-syne text-xl font-bold text-text-100 mb-3">
          Підтвердіть електронну пошту
        </h2>
        <p className="font-mono text-sm text-muted-500 mb-2">
          Ми надіслали листа на адресу
        </p>
        <p className="font-mono text-sm font-bold text-bronze mb-4 break-all">
          {email}
        </p>
        <p className="font-mono text-sm text-muted-500 mb-6">
          Перейдіть за посиланням у листі, щоб підтвердити реєстрацію та увійти до акаунту.
        </p>
        <p className="font-mono text-xs text-muted-500/70">
          Не отримали листа? Перевірте папку «Спам».
        </p>
      </div>
    );
  }

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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
              placeholder="Мінімум 8 символів"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-500 hover:text-text-100 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
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
