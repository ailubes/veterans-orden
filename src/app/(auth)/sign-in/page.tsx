'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

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

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Невірна електронна пошта або пароль');
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
          required
        />
      </div>

      <div className="text-right">
        <Link
          href="/reset-password"
          className="text-xs text-accent hover:underline"
        >
          Забули пароль?
        </Link>
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
        {loading ? 'ВХІД...' : 'УВІЙТИ →'}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative">
      {/* Corner joints */}
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      <Link href="/" className="flex justify-center mb-6">
        <Logo size={48} className="text-timber-dark" />
      </Link>

      <h1 className="font-syne font-bold text-2xl mb-2 text-center">
        ВХІД
      </h1>
      <p className="text-center text-sm text-timber-beam mb-6">
        Увійдіть до свого акаунту
      </p>

      <Suspense fallback={<div className="text-center py-4">Завантаження...</div>}>
        <SignInForm />
      </Suspense>

      <div className="mt-6 text-center">
        <p className="text-sm text-timber-beam">
          Ще не маєте акаунту?{' '}
          <Link href="/sign-up" className="text-accent hover:underline font-bold">
            ПРИЄДНАТИСЯ
          </Link>
        </p>
      </div>
    </div>
  );
}
