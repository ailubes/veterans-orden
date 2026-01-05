'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UKRAINIAN_OBLASTS } from '@/lib/constants';
import { Check, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { KatottgSelector, KatottgDetails } from '@/components/ui/katottg-selector';
import { HeavyCta } from '@/components/ui/heavy-cta';

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

  // Location (two-step: oblast first, then settlement)
  const [selectedOblastCode, setSelectedOblastCode] = useState('');
  const [katottgCode, setKatottgCode] = useState<string | null>(null);
  const [katottgDetails, setKatottgDetails] = useState<KatottgDetails | null>(null);

  // Membership tier
  const [selectedTier, setSelectedTier] = useState<'free' | 'basic_49' | 'supporter_100' | 'supporter_200' | 'patron_500'>('free');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<{ email: string; id: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser({
          email: user.email || '',
          id: user.id,
        });
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

      // Find oblast UUID from KATOTTG data or selected oblast code
      let oblastId = null;
      const oblastCodeToUse = katottgDetails?.oblastCode || selectedOblastCode;

      if (oblastCodeToUse) {
        const { data: oblastData } = await supabase
          .from('oblasts')
          .select('id')
          .eq('code', oblastCodeToUse)
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
      const { error: insertError, data: newUser } = await supabase.from('users').insert({
        auth_id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        patronymic: patronymic.trim() || null,
        phone: phone.trim() || null,
        date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        oblast_id: oblastId,
        katottg_code: katottgCode,
        city: katottgDetails?.name || null, // Store settlement name for backward compatibility
        referral_code: referralCode,
        referred_by_id: referrerId,
        membership_tier: selectedTier,
        role: selectedTier === 'free' ? 'prospect' : 'full_member',
        status: 'active',
        member_since: new Date().toISOString(),
      }).select('id').single();

      if (insertError) {
        if (insertError.code === '23505') {
          router.push('/dashboard');
          return;
        }
        throw insertError;
      }

      // Generate progression tasks for new user
      if (newUser?.id) {
        const { error: tasksError } = await supabase.rpc('generate_progression_tasks', {
          p_user_id: newUser.id
        });

        if (tasksError) {
          console.error('Failed to generate progression tasks:', tasksError);
          // Don't block registration, just log the error
        }
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

      // If paid tier selected, redirect to payment
      if (selectedTier !== 'free') {
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
    <div className="min-h-screen py-12 px-4">
      <div className="bg-panel-900 border border-line rounded-lg p-8 max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((num, idx) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  getStepNumber() >= num ? 'bg-bronze' : 'bg-panel-850'
                }`}
              />
              {idx < 4 && <div className="w-8 h-0.5 bg-panel-850 ml-2" />}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Logo size={64} className="text-bronze" />
            </div>

            <h1 className="font-inter font-black text-2xl text-text-100 mb-4">
              Вітаємо!
            </h1>

            <p className="text-muted-500 mb-8">
              Ви успішно зареєструвались у Мережі Вільних Людей. Давайте
              налаштуємо ваш профіль.
            </p>

            <HeavyCta
              onClick={() => setStep('personal')}
              variant="primary"
              size="lg"
              fullWidth
            >
              ПОЧАТИ <ChevronRight size={18} />
            </HeavyCta>
          </div>
        )}

        {/* Step: Personal Info */}
        {step === 'personal' && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <User size={24} className="text-bronze" />
              <h1 className="font-inter font-black text-2xl text-text-100">
                Особисті дані
              </h1>
            </div>
            <p className="text-center text-sm text-muted-500 mb-6">
              Заповніть інформацію про себе
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">ІМ&apos;Я *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 focus:border-bronze focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">ПРІЗВИЩЕ *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 focus:border-bronze focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">ПО БАТЬКОВІ</label>
                <input
                  type="text"
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  placeholder="Наприклад: Іванович"
                  className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">ДАТА НАРОДЖЕННЯ *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 focus:border-bronze focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">НОМЕР ТЕЛЕФОНУ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+380 XX XXX XX XX"
                  className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <HeavyCta
                  onClick={() => setStep('welcome')}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <ChevronLeft size={18} /> НАЗАД
                </HeavyCta>
                <HeavyCta
                  onClick={() => {
                    if (validatePersonalInfo()) {
                      setStep('region');
                    }
                  }}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  ДАЛІ <ChevronRight size={18} />
                </HeavyCta>
              </div>
            </div>
          </div>
        )}

        {/* Step: Region Selection */}
        {step === 'region' && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={24} className="text-bronze" />
              <h1 className="font-inter font-black text-2xl text-text-100">
                Ваш регіон
              </h1>
            </div>
            <p className="text-center text-sm text-muted-500 mb-6">
              Оберіть область, потім знайдіть ваш населений пункт
            </p>

            <div className="space-y-4">
              {/* Step 1: Select Oblast */}
              <div>
                <label className="block mb-2 font-mono text-xs uppercase tracking-wider text-muted-500">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  ОБЛАСТЬ *
                </label>
                <select
                  value={selectedOblastCode}
                  onChange={(e) => {
                    setSelectedOblastCode(e.target.value);
                    // Reset settlement when oblast changes
                    setKatottgCode(null);
                    setKatottgDetails(null);
                  }}
                  className="w-full px-4 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 focus:border-bronze focus:outline-none transition-colors"
                >
                  <option value="">Оберіть область...</option>
                  {UKRAINIAN_OBLASTS.map((oblast) => (
                    <option key={oblast.code} value={oblast.code}>
                      {oblast.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Settlement (only show after oblast selected) */}
              {selectedOblastCode && (
                <div>
                  <KatottgSelector
                    value={katottgCode}
                    onChange={(code, details) => {
                      setKatottgCode(code);
                      setKatottgDetails(details);
                    }}
                    oblastFilter={selectedOblastCode}
                    label="НАСЕЛЕНИЙ ПУНКТ"
                    required={false}
                  />
                  <p className="text-xs text-muted-500 mt-2">
                    Почніть вводити назву вашого міста, селища або села
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <HeavyCta
                  onClick={() => setStep('personal')}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <ChevronLeft size={18} /> НАЗАД
                </HeavyCta>
                <HeavyCta
                  onClick={() => setStep('tier')}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  ДАЛІ <ChevronRight size={18} />
                </HeavyCta>
              </div>
            </div>
          </div>
        )}

        {/* Step: Tier Selection */}
        {step === 'tier' && (
          <div>
            <h1 className="font-inter font-black text-2xl text-text-100 mb-4 text-center">
              Оберіть план членства
            </h1>
            <p className="text-center text-sm text-muted-500 mb-6">
              Підтримайте громаду та отримайте додаткові можливості
            </p>

            <div className="space-y-3 mb-6">
              {/* Free Tier */}
              <div
                onClick={() => setSelectedTier('free')}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === 'free'
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line hover:border-muted-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">Безкоштовний</h3>
                    <p className="text-sm text-muted-500">Базова участь у мережі</p>
                    <ul className="text-xs text-muted-500 mt-2 space-y-1">
                      <li>• Доступ до голосувань</li>
                      <li>• Перегляд подій</li>
                      <li>• Участь у обговореннях</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-text-100">0₴</div>
                    <div className="text-xs text-muted-500">на місяць</div>
                  </div>
                </div>
              </div>

              {/* Basic 49 */}
              <div
                onClick={() => setSelectedTier('basic_49')}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === 'basic_49'
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line hover:border-muted-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">Базовий</h3>
                    <p className="text-sm text-muted-500">Повноцінне членство</p>
                    <ul className="text-xs text-muted-500 mt-2 space-y-1">
                      <li>• Все з безкоштовного</li>
                      <li>• Створення голосувань</li>
                      <li>• Організація подій</li>
                      <li>• Пріоритетна підтримка</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-text-100">49₴</div>
                    <div className="text-xs text-muted-500">на місяць</div>
                  </div>
                </div>
              </div>

              {/* Supporter 100 */}
              <div
                onClick={() => setSelectedTier('supporter_100')}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === 'supporter_100'
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line hover:border-muted-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">Прихильник</h3>
                    <p className="text-sm text-muted-500">Підтримка розвитку</p>
                    <ul className="text-xs text-muted-500 mt-2 space-y-1">
                      <li>• Все з базового</li>
                      <li>• Ваше ім&apos;я на сайті підтримки</li>
                      <li>• Ексклюзивні новини</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-text-100">100₴</div>
                    <div className="text-xs text-muted-500">на місяць</div>
                  </div>
                </div>
              </div>

              {/* Supporter 200 */}
              <div
                onClick={() => setSelectedTier('supporter_200')}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === 'supporter_200'
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line hover:border-muted-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">Прихильник+</h3>
                    <p className="text-sm text-muted-500">Активна підтримка</p>
                    <ul className="text-xs text-muted-500 mt-2 space-y-1">
                      <li>• Все з прихильника</li>
                      <li>• Згадка у звітах</li>
                      <li>• Доступ до закритих подій</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-text-100">200₴</div>
                    <div className="text-xs text-muted-500">на місяць</div>
                  </div>
                </div>
              </div>

              {/* Patron 500 */}
              <div
                onClick={() => setSelectedTier('patron_500')}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === 'patron_500'
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line hover:border-muted-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-text-100">Патрон</h3>
                    <p className="text-sm text-muted-500">Максимальна підтримка</p>
                    <ul className="text-xs text-muted-500 mt-2 space-y-1">
                      <li>• Все з прихильника+</li>
                      <li>• Особиста подяка від команди</li>
                      <li>• Участь у стратегічних зустрічах</li>
                      <li>• VIP-статус у спільноті</li>
                    </ul>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-text-100">500₴</div>
                    <div className="text-xs text-muted-500">на місяць</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <HeavyCta
                onClick={() => setStep('region')}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ChevronLeft size={18} /> НАЗАД
              </HeavyCta>
              <HeavyCta
                onClick={handleCompleteOnboarding}
                disabled={loading}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {loading ? 'ЗБЕРЕЖЕННЯ...' : (selectedTier === 'free' ? 'ЗАВЕРШИТИ' : 'ДО ОПЛАТИ')}
              </HeavyCta>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-bronze text-bg-950 flex items-center justify-center mx-auto mb-6 rounded-full">
              <Check size={32} />
            </div>

            <h1 className="font-inter font-black text-2xl text-text-100 mb-4">
              Ласкаво просимо!
            </h1>

            <p className="text-muted-500 mb-8">
              Ваш профіль налаштовано. Тепер ви можете користуватися всіма
              можливостями Мережі.
            </p>

            <div className="space-y-3">
              <HeavyCta
                onClick={() => router.push('/dashboard')}
                variant="primary"
                size="lg"
                fullWidth
              >
                ДО КАБІНЕТУ
              </HeavyCta>

              <HeavyCta
                onClick={() => router.push('/dashboard/referrals')}
                variant="outline"
                size="lg"
                fullWidth
              >
                ЗАПРОСИТИ ДРУЗІВ
              </HeavyCta>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
