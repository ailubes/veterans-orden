'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<{
    email: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({
          email: user.email || '',
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
        });
        setFirstName(user.user_metadata?.first_name || '');
        setLastName(user.user_metadata?.last_name || '');
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
          <p className="text-sm text-timber-beam mb-4">
            Оновіть до платного плану для отримання:
          </p>
          <ul className="text-sm space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Право голосу у прийнятті рішень
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Доступ до ексклюзивних подій
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              Більше впливу в Мережі
            </li>
          </ul>
          <button className="btn btn-outline" disabled>
            НЕЗАБАРОМ
          </button>
        </div>
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
