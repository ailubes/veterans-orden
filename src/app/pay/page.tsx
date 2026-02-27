'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Logo } from '@/components/ui/logo';
import { HeavyCta } from '@/components/ui/heavy-cta';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';

// ─── SDK type declarations ──────────────────────────────────────────────────

interface HutkoModel {
  sendResponse: () => void;
  error_message?: string;
}

interface HutkoDeferred {
  done: (cb: (this: HutkoApiInstance, model: HutkoModel) => void) => HutkoDeferred;
  fail: (cb: (this: HutkoApiInstance, model: HutkoModel) => void) => HutkoDeferred;
  progress: (cb: (this: HutkoApiInstance, model: HutkoModel) => void) => HutkoDeferred;
}

interface HutkoApiInstance {
  request: (action: string, method: string, params: Record<string, string>) => HutkoDeferred;
  scope: (fn: (this: HutkoApiInstance) => void) => void;
}

interface HutkoPaymentRequestApi {
  setApi: (api: HutkoApiInstance) => HutkoPaymentRequestApi;
  update: (params: Record<string, string>) => { done: (cb: () => void) => void };
  pay: (method: string) => void;
  on: (event: string, cb: (...args: unknown[]) => void) => HutkoPaymentRequestApi;
  isMethodSupported: (method: string) => boolean;
  isFallbackMethod: (method: string) => boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var $checkout: {
    (api: string): HutkoApiInstance;
    get: (api: string, opts?: Record<string, unknown>) => HutkoPaymentRequestApi;
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const isAnnual = searchParams.get('annual') === '1';
  const amount = searchParams.get('amount');
  const isDonation = searchParams.get('type') === 'donation';

  const [sdkReady, setSdkReady] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Native payment state
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [nativePayLoading, setNativePayLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const expiryMonthRef = useRef<HTMLInputElement>(null);
  const expiryYearRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const prApiRef = useRef<HutkoPaymentRequestApi | null>(null);
  const apiRef = useRef<HutkoApiInstance | null>(null);

  useEffect(() => {
    if (!token) router.replace(isDonation ? '/support' : '/dashboard');
  }, [token, router, isDonation]);

  // After SDK loads — initialise PaymentRequestApi and check available methods
  useEffect(() => {
    if (!sdkReady || !token) return;

    const api = window.$checkout('Api');
    apiRef.current = api;

    const prApi = window.$checkout.get('PaymentRequestApi', {});
    prApi.setApi(api);
    prApiRef.current = prApi;

    // After native payment UI is approved, finalise via api.checkout.form
    prApi.on('details', (...args: unknown[]) => {
      const details = (args.length > 1 ? args[1] : args[0]) as {
        payment_system: string;
        data: Record<string, string>;
      };
      finaliseNativePayment(api, details);
    });

    prApi.on('error', (...args: unknown[]) => {
      const err = (args.length > 1 ? args[1] : args[0]) as { message?: string };
      setNativePayLoading(false);
      setError(err?.message || 'Помилка платежу. Спробуйте ще раз.');
    });

    // Ask HUTKO which native methods are available for this merchant/device
    prApi.update({ token }).done(() => {
      setGooglePayAvailable(
        prApi.isMethodSupported('google') || prApi.isFallbackMethod('google')
      );
      setApplePayAvailable(prApi.isMethodSupported('apple'));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, token]);

  const finaliseNativePayment = (
    api: HutkoApiInstance,
    { payment_system, data }: { payment_system: string; data: Record<string, string> }
  ) => {
    const _token = token;
    api.scope(function (this: HutkoApiInstance) {
      this.request('api.checkout.form', 'request', {
        token: _token,
        payment_system,
        ...data,
      })
        .done((model) => {
          model.sendResponse();
          setSuccess(true);
          setTimeout(() => router.push(isDonation ? '/?donate=success' : '/dashboard?payment=success'), 1500);
        })
        .fail((model) => {
          setError(model.error_message || 'Помилка оплати. Спробуйте картку ще раз.');
          setNativePayLoading(false);
        })
        .progress((model) => {
          model.sendResponse(); // 3DS ack
        });
    });
  };

  // ── Card form submit ───────────────────────────────────────────────────────

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdkReady || !token) return;

    setError('');
    setSubmitting(true);

    const expiryDate = `${expiryMonth.padStart(2, '0')}/${expiryYear.slice(-2)}`;
    const rawCard = cardNumber.replace(/\s/g, '');
    const api = apiRef.current ?? window.$checkout('Api');

    api.scope(function (this: HutkoApiInstance) {
      this.request('api.checkout.form', 'request', {
        token,
        payment_system: 'card',
        card_number: rawCard,
        expiry_date: expiryDate,
        cvv2: cvv,
      })
        .done((model) => {
          model.sendResponse();
          setSuccess(true);
          setTimeout(() => router.push(isDonation ? '/?donate=success' : '/dashboard?payment=success'), 1500);
        })
        .fail((model) => {
          setError(model.error_message || 'Помилка оплати. Перевірте дані картки.');
          setSubmitting(false);
        })
        .progress((model) => {
          model.sendResponse();
        });
    });
  };

  // ── Native pay triggers ────────────────────────────────────────────────────

  const handleGooglePay = () => {
    if (!prApiRef.current) return;
    setError('');
    setNativePayLoading(true);
    prApiRef.current.pay('google');
  };

  const handleApplePay = () => {
    if (!prApiRef.current) return;
    setError('');
    setNativePayLoading(true);
    prApiRef.current.pay('apple');
  };

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  if (!token) return null;

  const hasNativeMethods = googlePayAvailable || applePayAvailable;

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center">
      <Script
        src="https://unpkg.com/@hutko/js-sdk"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setError('Не вдалося завантажити платіжний модуль. Оновіть сторінку.')}
      />

      <div className="bg-panel-900 border border-line rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Logo size={48} />
        </div>

        <h1 className="font-inter font-black text-2xl text-text-100 text-center mb-1 mt-0">
          {isDonation ? 'Підтримка Ордену' : 'Оплата членства'}
        </h1>
        <p className="text-sm text-muted-500 text-center mb-2">Орден Ветеранів</p>
        {amount && (
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 bg-panel-850 border border-line rounded-lg px-4 py-2 text-sm text-text-100">
              <span className="font-bold">{amount}₴</span>
              {!isDonation && (
                <>
                  <span className="text-muted-500">·</span>
                  <span className="text-muted-500">{isAnnual ? 'річна оплата (2 місяці безкоштовно)' : 'за перший місяць'}</span>
                </>
              )}
            </span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-bronze text-bg-950 flex items-center justify-center mx-auto mb-4 rounded-full text-2xl font-bold">
              ✓
            </div>
            <p className="text-text-100 font-bold text-lg">Оплату прийнято!</p>
            <p className="text-muted-500 text-sm mt-2">Перенаправлення...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Google Pay & Apple Pay ─────────────────────────────── */}
            {hasNativeMethods && (
              <>
                <div className="space-y-3">
                  {googlePayAvailable && (
                    <button
                      onClick={handleGooglePay}
                      disabled={nativePayLoading || submitting}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-white text-gray-900 font-medium text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {nativePayLoading ? (
                        <span className="text-gray-600 text-sm">Обробка...</span>
                      ) : (
                        <>
                          {/* Google Pay wordmark SVG */}
                          <svg height="20" viewBox="0 0 58 24" aria-label="Google Pay">
                            <path d="M27.426 11.4v7.08h-2.244V1.68h5.96c1.428 0 2.64.476 3.636 1.428.996.952 1.496 2.1 1.496 3.444 0 1.38-.5 2.54-1.496 3.48-.98.94-2.192 1.404-3.636 1.404h-3.716v-.036zm0-7.62v5.52h3.752c.84 0 1.54-.28 2.1-.852.56-.56.84-1.248.84-2.04 0-.78-.28-1.456-.84-2.004-.56-.548-1.26-.832-2.1-.832h-3.752v.208zM40.53 6.48c1.568 0 2.804.42 3.708 1.26.904.84 1.356 1.992 1.356 3.456v6.984h-2.14v-1.572h-.084c-.868 1.3-2.028 1.944-3.48 1.944-1.232 0-2.268-.364-3.108-1.092-.84-.728-1.26-1.652-1.26-2.772 0-1.176.44-2.112 1.32-2.796.88-.696 2.064-1.044 3.552-1.044 1.26 0 2.3.232 3.12.696v-.492c0-.756-.296-1.4-.888-1.932-.592-.532-1.284-.796-2.08-.796-1.204 0-2.156.508-2.856 1.524l-1.968-1.236c1.076-1.568 2.68-2.352 4.808-2.352v.02zm-2.892 8.64c0 .548.244 1.004.728 1.38.484.376 1.048.564 1.692.564.916 0 1.724-.34 2.42-1.02.696-.68 1.044-1.48 1.044-2.4-.656-.524-1.568-.784-2.74-.784-.852 0-1.564.208-2.136.624-.572.416-.96.944-1.008 1.636zM58 6.84l-7.476 17.16H48.25l2.772-5.988-4.916-11.172h2.4l3.54 8.568h.048l3.456-8.568H58z" fill="#3C4043"/>
                            <path d="M9.84 10.08v-2.4h8.064c.08.42.12.916.12 1.452 0 1.788-.488 4.008-2.064 5.58-1.536 1.596-3.504 2.448-6.12 2.448C4.404 17.16 0 12.888 0 7.08S4.404-3 9.84-3c2.688 0 4.608.996 6.048 2.376l-1.68 1.68C13.104.036 11.664-.6 9.84-.6 5.676-.6 2.4 2.784 2.4 7.08c0 4.296 3.276 7.68 7.44 7.68 2.712 0 4.248-1.08 5.244-2.076.804-.804 1.332-1.956 1.54-3.528L9.84 9.156v.924z" fill="#4285F4"/>
                          </svg>
                          <span className="font-medium text-[#3C4043]">Pay</span>
                        </>
                      )}
                    </button>
                  )}

                  {applePayAvailable && (
                    <button
                      onClick={handleApplePay}
                      disabled={nativePayLoading || submitting}
                      className="w-full h-12 flex items-center justify-center bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ WebkitAppearance: 'none' } as React.CSSProperties}
                    >
                      {nativePayLoading ? (
                        <span className="text-white text-sm">Обробка...</span>
                      ) : (
                        <svg height="20" viewBox="0 0 50 20" aria-label="Apple Pay">
                          <path d="M9.283 6.257c.34-.44.57-1.033.51-1.637-.493.025-1.1.34-1.452.77-.317.372-.595.978-.52 1.554.55.042 1.114-.274 1.462-.687zM9.788 7.077c-.806-.048-1.493.458-1.878.458-.386 0-.978-.433-1.614-.422-.83.012-1.6.482-2.025 1.23-.868 1.498-.228 3.717.614 4.934.41.6.903 1.265 1.55 1.24.614-.024.853-.397 1.6-.397.748 0 .963.397 1.615.385.672-.012 1.092-.6 1.503-1.2.47-.685.663-1.35.675-1.386-.012-.012-1.297-.5-1.31-1.983-.012-1.24 1.01-1.832 1.058-1.868-.578-.856-1.48-.95-1.79-.962v.01zm5.082-1.838V14h1.418v-2.967h1.963c1.793 0 3.052-1.23 3.052-3.004 0-1.773-1.235-2.99-3.003-2.99h-3.43zm1.418 1.2h1.635c1.23 0 1.935.656 1.935 1.802 0 1.146-.704 1.808-1.94 1.808h-1.63V6.44zm7.897 7.638c.89 0 1.714-.45 2.09-1.163h.03v1.092h1.31V9.68c0-1.322-1.056-2.174-2.68-2.174-1.505 0-2.618.864-2.66 2.05h1.274c.11-.564.625-.935 1.345-.935.87 0 1.355.405 1.355 1.15v.505l-1.77.107c-1.643.097-2.532.77-2.532 1.938 0 1.18.913 1.96 2.238 1.96v-.003zm.385-1.075c-.757 0-1.24-.363-1.24-.92 0-.573.464-.904 1.354-.958l1.576-.096v.515c0 .854-.724 1.46-1.69 1.46zm5.718 3.452c1.384 0 2.036-.53 2.604-2.135l2.492-6.99H34.01l-1.67 5.42h-.03l-1.67-5.42h-1.41l2.41 6.673-.13.408c-.216.678-.566.94-1.195.94-.11 0-.326-.012-.41-.024v1.1c.08.024.42.036.517.036l-.01-.008z" fill="white"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-line" />
                  <span className="text-xs text-muted-500 font-mono">або картою</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
              </>
            )}

            {/* ── Card form ─────────────────────────────────────────── */}
            <form onSubmit={handleCardSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
                  НОМЕР КАРТКИ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setCardNumber(formatted);
                      if (formatted.replace(/\s/g, '').length === 16) {
                        expiryMonthRef.current?.focus();
                      }
                    }}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    required
                    className="w-full px-4 py-3 pl-11 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
                  />
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
                    МІСЯЦЬ
                  </label>
                  <input
                    ref={expiryMonthRef}
                    type="text"
                    inputMode="numeric"
                    value={expiryMonth}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setExpiryMonth(val);
                      if (val.length === 2) expiryYearRef.current?.focus();
                    }}
                    placeholder="ММ"
                    maxLength={2}
                    required
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
                    РІК
                  </label>
                  <input
                    ref={expiryYearRef}
                    type="text"
                    inputMode="numeric"
                    value={expiryYear}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setExpiryYear(val);
                      if (val.length === 4) cvvRef.current?.focus();
                    }}
                    placeholder="РРРР"
                    maxLength={4}
                    required
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
                    CVV
                  </label>
                  <input
                    ref={cvvRef}
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="•••"
                    maxLength={3}
                    required
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                </div>
              </div>

              {!sdkReady && !error && (
                <p className="text-xs text-muted-500 text-center">
                  Завантаження платіжного модуля...
                </p>
              )}

              <HeavyCta
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!sdkReady || submitting || nativePayLoading}
              >
                {submitting ? 'ОБРОБКА...' : 'СПЛАТИТИ КАРТКОЮ'}
              </HeavyCta>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-500">
                <Lock size={12} />
                <span>Захищено HUTKO · SSL шифрування</span>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push(isDonation ? '/support' : '/dashboard')}
                  className="text-xs text-muted-500 hover:text-text-100 transition-colors underline underline-offset-2"
                >
                  {isDonation ? 'Повернутись' : 'Оплатити пізніше'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-500 font-mono text-sm">Завантаження...</p>
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  );
}
