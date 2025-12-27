'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UKRAINIAN_OBLASTS } from '@/lib/constants';
import { Check, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import {
  trackOnboardingStarted,
  trackOnboardingStepCompleted,
  trackOnboardingCompleted,
  trackPaymentInitiated,
  identifyUser,
} from '@/lib/analytics/events';

type Step = 'welcome' | 'personal' | 'region' | 'tier' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Location
  const [selectedOblast, setSelectedOblast] = useState('');
  const [city, setCity] = useState('');

  // Membership tier
  const [selectedTier, setSelectedTier] = useState<'free' | 'basic_49' | 'supporter_100' | 'supporter_200' | 'patron_500'>('free');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const fName = user.user_metadata?.first_name || '';
        const lName = user.user_metadata?.last_name || '';
        setUser({
          firstName: fName,
          lastName: lName,
          email: user.email || '',
        });
        setFirstName(fName);
        setLastName(lName);

        // Track onboarding started
        trackOnboardingStarted(user.id);
      }
    };

    getUser();
  }, []);

  const validatePersonalInfo = () => {
    if (!firstName.trim()) {
      setError('Введіть ім\'я');
      return false;
    }
    if (!lastName.trim()) {
      setError('Введіть прізвище');
      return false;
    }
    if (!dateOfBirth) {
      setError('Введіть дату народження');
      return false;
    }

    // Validate age (must be at least 14 years old)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 14) {
      setError('Вам має бути не менше 14 років');
      return false;
    }
    if (age > 120) {
      setError('Перевірте дату народження');
      return false;
    }

    setError('');
    return true;
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Сесія закінчилась. Увійдіть знову.');
        setLoading(false);
        return;
      }

      // Generate referral code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let referralCode = '';
      for (let i = 0; i < 8; i++) {
        referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Find oblast UUID
      let oblastId = null;
      if (selectedOblast) {
        const { data: oblastData } = await supabase
          .from('oblasts')
          .select('id')
          .eq('code', selectedOblast)
          .single();
        oblastId = oblastData?.id || null;
      }

      // Check if user was referred by someone
      const referrerCode = user.user_metadata?.referral_code;
      let referrerId: string | null = null;

      if (referrerCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referrerCode)
          .single();

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // Create user profile in database
      const { error: insertError } = await supabase.from('users').insert({
        clerk_id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        patronymic: patronymic.trim() || null,
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        oblast_id: oblastId,
        city: city.trim() || null,
        referral_code: referralCode,
        referred_by_id: referrerId,
        membership_tier: selectedTier,
        role: selectedTier === 'free' ? 'prospect' : 'full_member',
        status: 'active',
        member_since: new Date().toISOString(),
      });

      if (insertError) {
        if (insertError.code === '23505') {
          router.push('/dashboard');
          return;
        }
        throw insertError;
      }

      // If user was referred, increment the referrer's count and add points
      if (referrerId) {
        const { data: referrer } = await supabase
          .from('users')
          .select('referral_count, points')
          .eq('id', referrerId)
          .single();

        if (referrer) {
          await supabase
            .from('users')
            .update({
              referral_count: (referrer.referral_count || 0) + 1,
              points: (referrer.points || 0) + 10,
              updated_at: new Date().toISOString(),
            })
            .eq('id', referrerId);
        }
      }

      // Identify user in PostHog
      identifyUser(user.id, user.email || '', {
        first_name: firstName,
        last_name: lastName,
        oblast: selectedOblast,
        city: city,
        tier: selectedTier,
      });

      // If paid tier selected, redirect to payment
      if (selectedTier !== 'free') {
        // Track tier selection
        trackOnboardingStepCompleted(user.id, 'tier');

        // Track payment initiation
        const tierPrices: Record<string, number> = {
          basic_49: 49,
          supporter_100: 100,
          supporter_200: 200,
          patron_500: 500,
        };
        trackPaymentInitiated(user.id, selectedTier, tierPrices[selectedTier] || 0);

        // Create payment order
        const paymentResponse = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tierId: selectedTier }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Помилка створення платежу');
        }

        const { data, signature } = await paymentResponse.json();

        // Redirect to LiqPay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.style.display = 'none';

        const dataInput = document.createElement('input');
        dataInput.name = 'data';
        dataInput.value = data;
        form.appendChild(dataInput);

        const signatureInput = document.createElement('input');
        signatureInput.name = 'signature';
        signatureInput.value = signature;
        form.appendChild(signatureInput);

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Free tier - complete immediately
      trackOnboardingStepCompleted(user.id, 'tier');
      trackOnboardingCompleted(user.id, selectedTier, false);
      setStep('complete');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'welcome': return 1;
      case 'personal': return 2;
      case 'region': return 3;
      case 'tier': return 4;
      case 'complete': return 5;
    }
  };

  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative max-w-lg mx-auto">
      {/* Corner joints */}
      <div className="joint" style={{ top: '-3px', left: '-3px' }} />
      <div className="joint" style={{ top: '-3px', right: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', left: '-3px' }} />
      <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((num, idx) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                getStepNumber() >= num ? 'bg-accent' : 'bg-timber-dark/30'
              }`}
            />
            {idx < 4 && <div className="w-8 h-0.5 bg-timber-dark/30 ml-2" />}
          </div>
        ))}
      </div>

      {/* Step: Welcome */}
      {step === 'welcome' && (
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-6">
            <Logo size={64} className="text-accent" />
          </div>

          <h1 className="font-syne text-2xl font-bold mb-4">
            Вітаємо{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>

          <p className="text-timber-beam mb-8">
            Ви успішно зареєструвались у Мережі Вільних Людей. Давайте
            налаштуємо ваш профіль.
          </p>

          <button
            onClick={() => {
              setStep('personal');
              if (user?.email) {
                trackOnboardingStepCompleted(user.email, 'welcome');
              }
            }}
            className="btn w-full justify-center"
          >
            ПОЧАТИ <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step: Personal Info */}
      {step === 'personal' && (
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <User size={24} className="text-accent" />
            <h1 className="font-syne text-2xl font-bold">
              Особисті дані
            </h1>
          </div>
          <p className="text-center text-sm text-timber-beam mb-6">
            Заповніть інформацію про себе
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">ІМ&apos;Я *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="label block mb-2">ПРІЗВИЩЕ *</label>
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
              <label className="label block mb-2">ПО БАТЬКОВІ</label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                placeholder="Наприклад: Іванович"
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="label block mb-2">ДАТА НАРОДЖЕННЯ *</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">НОМЕР ТЕЛЕФОНУ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+380 XX XXX XX XX"
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('welcome')}
                className="btn btn-outline flex-1 justify-center"
              >
                <ChevronLeft size={18} /> НАЗАД
              </button>
              <button
                onClick={() => {
                  if (validatePersonalInfo()) {
                    setStep('region');
                    if (user?.email) {
                      trackOnboardingStepCompleted(user.email, 'personal');
                    }
                  }
                }}
                className="btn flex-1 justify-center"
              >
                ДАЛІ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Region Selection */}
      {step === 'region' && (
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin size={24} className="text-accent" />
            <h1 className="font-syne text-2xl font-bold">
              Ваш регіон
            </h1>
          </div>
          <p className="text-center text-sm text-timber-beam mb-6">
            Оберіть область для участі в регіональних подіях та голосуваннях
          </p>

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">ОБЛАСТЬ</label>
              <select
                value={selectedOblast}
                onChange={(e) => setSelectedOblast(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="">Оберіть область...</option>
                {UKRAINIAN_OBLASTS.map((oblast) => (
                  <option key={oblast.code} value={oblast.code}>
                    {oblast.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label block mb-2">МІСТО</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Наприклад: Київ"
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('personal')}
                className="btn btn-outline flex-1 justify-center"
              >
                <ChevronLeft size={18} /> НАЗАД
              </button>
              <button
                onClick={() => {
                  setStep('tier');
                  if (user?.email) {
                    trackOnboardingStepCompleted(user.email, 'region');
                  }
                }}
                className="btn flex-1 justify-center"
              >
                ДАЛІ <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Tier Selection */}
      {step === 'tier' && (
        <div>
          <h1 className="font-syne text-2xl font-bold mb-4 text-center">
            Оберіть план членства
          </h1>
          <p className="text-center text-sm text-timber-beam mb-6">
            Підтримайте громаду та отримайте додаткові можливості
          </p>

          <div className="space-y-3 mb-6">
            {/* Free Tier */}
            <div
              onClick={() => setSelectedTier('free')}
              className={`border-2 p-4 cursor-pointer transition-all ${
                selectedTier === 'free'
                  ? 'border-accent bg-accent/5'
                  : 'border-timber-dark/30 hover:border-timber-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Безкоштовний</h3>
                  <p className="text-sm text-timber-beam">Базова участь у мережі</p>
                  <ul className="text-xs text-timber-beam mt-2 space-y-1">
                    <li>• Доступ до голосувань</li>
                    <li>• Перегляд подій</li>
                    <li>• Участь у обговореннях</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">0₴</div>
                  <div className="text-xs text-timber-beam">на місяць</div>
                </div>
              </div>
            </div>

            {/* Basic 49 */}
            <div
              onClick={() => setSelectedTier('basic_49')}
              className={`border-2 p-4 cursor-pointer transition-all ${
                selectedTier === 'basic_49'
                  ? 'border-accent bg-accent/5'
                  : 'border-timber-dark/30 hover:border-timber-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Базовий</h3>
                  <p className="text-sm text-timber-beam">Повноцінне членство</p>
                  <ul className="text-xs text-timber-beam mt-2 space-y-1">
                    <li>• Все з безкоштовного</li>
                    <li>• Створення голосувань</li>
                    <li>• Організація подій</li>
                    <li>• Пріоритетна підтримка</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">49₴</div>
                  <div className="text-xs text-timber-beam">на місяць</div>
                </div>
              </div>
            </div>

            {/* Supporter 100 */}
            <div
              onClick={() => setSelectedTier('supporter_100')}
              className={`border-2 p-4 cursor-pointer transition-all ${
                selectedTier === 'supporter_100'
                  ? 'border-accent bg-accent/5'
                  : 'border-timber-dark/30 hover:border-timber-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Прихильник</h3>
                  <p className="text-sm text-timber-beam">Підтримка розвитку</p>
                  <ul className="text-xs text-timber-beam mt-2 space-y-1">
                    <li>• Все з базового</li>
                    <li>• Ваше ім&apos;я на сайті підтримки</li>
                    <li>• Ексклюзивні новини</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">100₴</div>
                  <div className="text-xs text-timber-beam">на місяць</div>
                </div>
              </div>
            </div>

            {/* Supporter 200 */}
            <div
              onClick={() => setSelectedTier('supporter_200')}
              className={`border-2 p-4 cursor-pointer transition-all ${
                selectedTier === 'supporter_200'
                  ? 'border-accent bg-accent/5'
                  : 'border-timber-dark/30 hover:border-timber-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Прихильник+</h3>
                  <p className="text-sm text-timber-beam">Активна підтримка</p>
                  <ul className="text-xs text-timber-beam mt-2 space-y-1">
                    <li>• Все з прихильника</li>
                    <li>• Згадка у звітах</li>
                    <li>• Доступ до закритих подій</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">200₴</div>
                  <div className="text-xs text-timber-beam">на місяць</div>
                </div>
              </div>
            </div>

            {/* Patron 500 */}
            <div
              onClick={() => setSelectedTier('patron_500')}
              className={`border-2 p-4 cursor-pointer transition-all ${
                selectedTier === 'patron_500'
                  ? 'border-accent bg-accent/5'
                  : 'border-timber-dark/30 hover:border-timber-dark'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">Патрон</h3>
                  <p className="text-sm text-timber-beam">Максимальна підтримка</p>
                  <ul className="text-xs text-timber-beam mt-2 space-y-1">
                    <li>• Все з прихильника+</li>
                    <li>• Особиста подяка від команди</li>
                    <li>• Участь у стратегічних зустрічах</li>
                    <li>• VIP-статус у спільноті</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">500₴</div>
                  <div className="text-xs text-timber-beam">на місяць</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('region')}
              className="btn btn-outline flex-1 justify-center"
            >
              <ChevronLeft size={18} /> НАЗАД
            </button>
            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="btn flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ЗБЕРЕЖЕННЯ...' : (selectedTier === 'free' ? 'ЗАВЕРШИТИ →' : 'ДО ОПЛАТИ →')}
            </button>
          </div>
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 text-white flex items-center justify-center mx-auto mb-6 rounded-full">
            <Check size={32} />
          </div>

          <h1 className="font-syne text-2xl font-bold mb-4">
            Ласкаво просимо!
          </h1>

          <p className="text-timber-beam mb-8">
            Ваш профіль налаштовано. Тепер ви можете користуватися всіма
            можливостями Мережі.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn w-full justify-center"
            >
              ДО КАБІНЕТУ →
            </button>

            <button
              onClick={() => router.push('/dashboard/referrals')}
              className="btn btn-outline w-full justify-center"
            >
              ЗАПРОСИТИ ДРУЗІВ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
