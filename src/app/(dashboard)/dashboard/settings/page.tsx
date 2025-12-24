'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MembershipUpgrade } from '@/components/dashboard/membership-upgrade';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    membershipTier: string;
  } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      setMessage('Оплата успішна! Ваше членство активовано.');
    }
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile to get membership tier
        const { data: profile } = await supabase
          .from('users')
          .select('membership_tier')
          .eq('clerk_id', authUser.id)
          .single();

        setUser({
          email: authUser.email || '',
          firstName: authUser.user_metadata?.first_name || '',
          lastName: authUser.user_metadata?.last_name || '',
          membershipTier: profile?.membership_tier || 'free',
        });
        setFirstName(authUser.user_metadata?.first_name || '');
        setLastName(authUser.user_metadata?.last_name || '');
      }
    };

    getUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error) {
        setMessage(`Помилка: ${error.message}`);
      } else {
        setMessage('Профіль успішно оновлено!');
        router.refresh();
      }
    } catch {
      setMessage('Виникла помилка. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="label mb-2">НАЛАШТУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Мій профіль
        </h1>
      </div>

      {/* Profile Form */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-6">ОСОБИСТІ ДАНІ</p>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ІМ&apos;Я</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="label block mb-2">ПРІЗВИЩЕ</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="label block mb-2">ЕЛЕКТРОННА ПОШТА</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 bg-timber-beam/10 border-2 border-timber-dark font-mono text-sm opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-timber-beam mt-2">
              Електронну пошту змінити неможливо
            </p>
          </div>

          {message && (
            <div
              className={`p-3 text-sm ${
                message.startsWith('Помилка')
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : 'bg-green-50 border border-green-200 text-green-600'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ →'}
          </button>
        </form>
      </div>

      {/* Membership */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-4">ЧЛЕНСТВО</p>

        {user.membershipTier === 'free' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-syne text-xl font-bold">Безкоштовний план</h3>
                <p className="text-sm text-timber-beam">Базові можливості Мережі</p>
              </div>
              <div className="text-right">
                <p className="font-syne text-2xl font-bold">0 ₴</p>
                <p className="text-xs text-timber-beam">/ місяць</p>
              </div>
            </div>

            <div className="border-t border-timber-dark/20 pt-6">
              <p className="font-bold mb-4">Оберіть план членства:</p>
              <MembershipUpgrade currentTier={user.membershipTier} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-syne text-xl font-bold">
                  {user.membershipTier === 'basic_49' && 'Базовий'}
                  {user.membershipTier === 'supporter_100' && 'Підтримка'}
                  {user.membershipTier === 'supporter_200' && 'Підтримка+'}
                  {user.membershipTier === 'patron_500' && 'Меценат'}
                </h3>
                <p className="text-sm text-timber-beam">Активне членство</p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold">
                АКТИВНИЙ
              </div>
            </div>

            <p className="text-sm text-timber-beam mb-4">
              Дякуємо за підтримку Мережі Вільних Людей!
            </p>

            <div className="border-t border-timber-dark/20 pt-6">
              <p className="font-bold mb-4">Оновити план:</p>
              <MembershipUpgrade currentTier={user.membershipTier} />
            </div>
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-canvas border-2 border-red-200 p-6 lg:p-8 relative">
        <p className="label text-red-600 mb-4">НЕБЕЗПЕЧНА ЗОНА</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-syne font-bold">Вийти з акаунту</h3>
            <p className="text-sm text-timber-beam">
              Ви будете перенаправлені на головну сторінку
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 border-2 border-red-600 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
          >
            ВИЙТИ
          </button>
        </div>
      </div>
    </div>
  );
}
