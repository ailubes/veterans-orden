'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UKRAINIAN_OBLASTS } from '@/lib/constants';
import { Check, ChevronRight } from 'lucide-react';

type Step = 'welcome' | 'region' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedOblast, setSelectedOblast] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [user, setUser] = useState<{ firstName: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          firstName: user.user_metadata?.first_name || 'Друже',
          email: user.email || '',
        });
      }
    };

    getUser();
  }, []);

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Сесія закінчилась. Увійдіть знову.');
        return;
      }

      // Generate referral code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let referralCode = '';
      for (let i = 0; i < 8; i++) {
        referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Find oblast UUID
      const { data: oblastData } = await supabase
        .from('oblasts')
        .select('id')
        .eq('code', selectedOblast)
        .single();

      // Check if user was referred by someone
      const referrerCode = user.user_metadata?.referral_code;
      let referrerId: string | null = null;

      if (referrerCode) {
        // Find the referrer by their referral code
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
        clerk_id: user.id, // Using Supabase auth id
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        oblast_id: oblastData?.id || null,
        city: city || null,
        referral_code: referralCode,
        referred_by_id: referrerId,
        role: 'prospect',
        status: 'active',
        member_since: new Date().toISOString(),
      });

      if (insertError) {
        if (insertError.code === '23505') {
          // Duplicate key - user already exists, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        throw insertError;
      }

      // If user was referred, increment the referrer's count and add points
      if (referrerId) {
        // Get current referral count
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
              points: (referrer.points || 0) + 10, // 10 points per referral
              updated_at: new Date().toISOString(),
            })
            .eq('id', referrerId);
        }
      }

      setStep('complete');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas border-2 border-timber-dark p-8 relative max-w-lg mx-auto">
      {/* Corner joints */}
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
      <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div
          className={`w-3 h-3 rounded-full ${
            step === 'welcome' ? 'bg-accent' : 'bg-timber-dark'
          }`}
        />
        <div className="w-8 h-0.5 bg-timber-dark/30" />
        <div
          className={`w-3 h-3 rounded-full ${
            step === 'region' ? 'bg-accent' : step === 'complete' ? 'bg-timber-dark' : 'bg-timber-dark/30'
          }`}
        />
        <div className="w-8 h-0.5 bg-timber-dark/30" />
        <div
          className={`w-3 h-3 rounded-full ${
            step === 'complete' ? 'bg-accent' : 'bg-timber-dark/30'
          }`}
        />
      </div>

      {/* Step: Welcome */}
      {step === 'welcome' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-accent text-canvas flex items-center justify-center mx-auto mb-6">
            <span className="font-syne text-3xl font-bold">М</span>
          </div>

          <h1 className="font-syne text-2xl font-bold mb-4">
            Вітаємо, {user?.firstName || 'Друже'}!
          </h1>

          <p className="text-timber-beam mb-8">
            Ви успішно зареєструвались у Мережі Вільних Людей. Давайте
            налаштуємо ваш профіль.
          </p>

          <button
            onClick={() => setStep('region')}
            className="btn w-full justify-center"
          >
            ПОЧАТИ <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step: Region Selection */}
      {step === 'region' && (
        <div>
          <h1 className="font-syne text-2xl font-bold mb-2 text-center">
            Ваш регіон
          </h1>
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
              <label className="label block mb-2">МІСТО (НЕОБОВ&apos;ЯЗКОВО)</label>
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

            <button
              onClick={handleCompleteOnboarding}
              disabled={loading || !selectedOblast}
              className="btn w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗАВЕРШИТИ →'}
            </button>

            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="text-center w-full text-sm text-timber-beam hover:text-accent"
            >
              Пропустити цей крок
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
