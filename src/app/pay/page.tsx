'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const getHostedCheckoutUrl = (token: string) =>
  `https://pay.hutko.org/checkout?token=${encodeURIComponent(token)}`;

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const checkoutUrl = searchParams.get('checkoutUrl') ?? '';
  const amount = searchParams.get('amount');
  const isAnnual = searchParams.get('annual') === '1';
  const isDonation = searchParams.get('type') === 'donation';

  useEffect(() => {
    if (!token && !checkoutUrl) {
      router.replace(isDonation ? '/support' : '/dashboard');
      return;
    }

    const hostedUrl = checkoutUrl || getHostedCheckoutUrl(token);
    window.location.replace(hostedUrl);
  }, [checkoutUrl, isDonation, router, token]);

  if (!token && !checkoutUrl) {
    return null;
  }

  const hostedUrl = checkoutUrl || getHostedCheckoutUrl(token);

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <div className="bg-panel-900 border border-line rounded-lg p-8 w-full max-w-xl">
        <div className="flex items-center justify-center mb-6">
          <Logo size={48} />
        </div>

        <h1 className="font-inter font-black text-2xl text-text-100 text-center mb-1 mt-0">
          {isDonation ? 'Переходимо до оплати' : 'Переходимо до оплати членства'}
        </h1>
        <p className="text-sm text-muted-500 text-center mb-6">Безпечна платіжна сторінка HUTKO</p>

        {amount ? (
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 bg-panel-850 border border-line rounded-lg px-4 py-2 text-sm text-text-100">
              <span className="font-bold">{amount}₴</span>
              {!isDonation ? (
                <>
                  <span className="text-muted-500">·</span>
                  <span className="text-muted-500">
                    {isAnnual ? 'річна оплата (2 місяці безкоштовно)' : 'за перший місяць'}
                  </span>
                </>
              ) : null}
            </span>
          </div>
        ) : null}

        <div className="rounded-lg border border-line bg-panel-850/50 p-6 mb-4">
          <div className="flex items-center justify-center gap-3 text-muted-500">
            <Loader2 size={18} className="animate-spin" />
            <span>Відкриваємо захищену сторінку оплати HUTKO...</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-panel-850 border border-line rounded-lg p-3 text-sm text-muted-500 mb-6">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            Якщо переадресація не спрацювала автоматично, відкрийте платіжну сторінку вручну.
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <a
            href={hostedUrl}
            className="inline-flex items-center gap-2 rounded-lg bg-bronze px-5 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            <span>Відкрити платіжну сторінку</span>
            <ExternalLink size={16} />
          </a>

          <button
            type="button"
            onClick={() => router.push(isDonation ? '/support' : '/dashboard')}
            className="text-xs text-muted-500 hover:text-text-100 transition-colors underline underline-offset-2"
          >
            {isDonation ? 'Повернутись' : 'Оплатити пізніше'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-500">
          <Loader2 size={18} className="animate-spin" />
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  );
}
