'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UKRAINIAN_OBLASTS } from '@/lib/constants';
import { Check, ChevronRight, ChevronLeft, User, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { KatottgSelector, KatottgDetails } from '@/components/ui/katottg-selector';
import { HeavyCta } from '@/components/ui/heavy-cta';

type Step = 'welcome' | 'personal' | 'region' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const handleDobChange = (day: string, month: string, year: string) => {
    const d = day.padStart(2, '0');
    const m = month.padStart(2, '0');
    if (day && month && year.length === 4) {
      setDateOfBirth(`${year}-${m}-${d}`);
    } else {
      setDateOfBirth('');
    }
  };

  // Location (two-step: oblast first, then settlement)
  const [selectedOblastCode, setSelectedOblastCode] = useState('');
  const [katottgCode, setKatottgCode] = useState<string | null>(null);
  const [katottgDetails, setKatottgDetails] = useState<KatottgDetails | null>(null);

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

      // oblasts table not yet seeded — skip lookup
      const oblastId = null;

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

      // Check if a user record already exists (created by DB trigger on signup)
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id, referral_code, member_since')
        .eq('auth_id', user.id)
        .single();

      // Keep existing referral_code / member_since if already set by the trigger
      const finalReferralCode = existingProfile?.referral_code || referralCode;
      const finalMemberSince = existingProfile?.member_since || new Date().toISOString();

      // Upsert: INSERT on first run, UPDATE if trigger already created the row
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          auth_id: user.id,
          email: user.email,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          patronymic: patronymic.trim() || null,
          phone: phone.trim() || null,
          date_of_birth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
          oblast_id: oblastId,
          katottg_code: katottgCode,
          city: katottgDetails?.name || null,
          settlement_name: katottgDetails?.name || null,
          hromada_name: katottgDetails?.hromadaName || null,
          raion_name: katottgDetails?.raionName || null,
          oblast_name_katottg: katottgDetails?.oblastName || null,
          referral_code: finalReferralCode,
          referred_by_id: referrerId,
          membership_tier: 'free',
          role: 'full_member',
          status: 'active',
          member_since: finalMemberSince,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'auth_id' });

      if (upsertError) {
        throw upsertError;
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

      // Payments are no longer required for membership. Role advancement is driven
      // by referral activity (see supabase migrations 20260613000001/2).
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
      case 'complete': return 4;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="bg-panel-900 border border-line rounded-lg p-8 max-w-lg mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((num, idx) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  getStepNumber() >= num ? 'bg-bronze' : 'bg-panel-850'
                }`}
              />
              {idx < 3 && <div className="w-8 h-0.5 bg-panel-850 ml-2" />}
            </div>
          ))}
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Logo size={64} />
            </div>

            <h1 className="font-inter font-black text-2xl text-text-100 mb-4 mt-0">
              Вітаємо!
            </h1>

            <p className="text-muted-500 mb-8">
              Ви успішно зареєструвались в Ордені Ветеранів. Давайте
              налаштуємо ваш профіль.
            </p>

            <div className="flex justify-center">
              <HeavyCta
                onClick={() => setStep('personal')}
                variant="primary"
                size="md"
              >
                ПОЧАТИ <ChevronRight size={16} />
              </HeavyCta>
            </div>
          </div>
        )}

        {/* Step: Personal Info */}
        {step === 'personal' && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <User size={22} className="text-bronze flex-shrink-0" />
              <h1 className="font-inter font-black text-2xl text-text-100 leading-none mt-0">
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
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min={1} max={31}
                    value={dobDay}
                    onChange={(e) => { setDobDay(e.target.value); handleDobChange(e.target.value, dobMonth, dobYear); }}
                    placeholder="ДД"
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="number"
                    min={1} max={12}
                    value={dobMonth}
                    onChange={(e) => { setDobMonth(e.target.value); handleDobChange(dobDay, e.target.value, dobYear); }}
                    placeholder="ММ"
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="number"
                    min={1900} max={new Date().getFullYear()}
                    value={dobYear}
                    onChange={(e) => { setDobYear(e.target.value); handleDobChange(dobDay, dobMonth, e.target.value); }}
                    placeholder="РРРР"
                    className="w-full px-3 py-3 bg-panel-850 border border-line rounded-lg font-mono text-sm text-text-100 placeholder:text-muted-500 focus:border-bronze focus:outline-none transition-colors text-center"
                  />
                </div>
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
              <MapPin size={22} className="text-bronze flex-shrink-0" />
              <h1 className="font-inter font-black text-2xl text-text-100 leading-none mt-0">
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
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗАВЕРШИТИ'} <ChevronRight size={18} />
                </HeavyCta>
              </div>
            </div>
          </div>
        )}

        {/* Step: Complete */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-bronze text-bg-950 flex items-center justify-center mx-auto mb-6 rounded-full">
              <Check size={32} />
            </div>

            <h1 className="font-inter font-black text-2xl text-text-100 mb-4 mt-0">
              Ласкаво просимо!
            </h1>

            <p className="text-muted-500 mb-8">
              Ваш профіль налаштовано. Тепер ви можете користуватися всіма
              можливостями Ордену.
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
