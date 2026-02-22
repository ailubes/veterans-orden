'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { HeavyCta } from '@/components/ui/heavy-cta';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Невірна електронна пошта або пароль');
        } else if (signInError.message === 'Email not confirmed') {
          setError('Електронна пошта не підтверджена. Перевірте свою поштову скриньку та перейдіть за посиланням у листі.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <div className="text-right">
        <Link
          href="/reset-password"
          className="text-xs text-bronze hover:text-bronze/80 transition-colors"
        >
          Забули пароль?
        </Link>
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
        {loading ? 'ВХІД...' : 'УВІЙТИ'}
      </HeavyCta>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="bg-panel-900 border border-line rounded-lg p-8">
      <h1 className="font-inter font-black text-2xl mb-2 text-center text-text-100">
        ВХІД
      </h1>
      <p className="text-center text-sm text-muted-500 mb-6">
        Увійдіть до свого акаунту
      </p>

      <Suspense fallback={<div className="text-center py-4 text-muted-500">Завантаження...</div>}>
        <SignInForm />
      </Suspense>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-500">
          Ще не маєте акаунту?{' '}
          <Link href="/sign-up" className="text-bronze hover:text-bronze/80 font-bold transition-colors">
            ПРИЄДНАТИСЯ
          </Link>
        </p>
      </div>
    </div>
  );
}
