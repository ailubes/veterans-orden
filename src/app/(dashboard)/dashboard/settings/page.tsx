'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MembershipUpgrade } from '@/components/dashboard/membership-upgrade';
import { ProfilePhotoUpload } from '@/components/dashboard/profile-photo-upload';
import {
  Copy,
  Check,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Star,
  Award,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  membershipTier: string;
  avatarUrl: string | null;
  referralCode: string;
  referralCount: number;
  referredByName: string | null;
  oblastName: string | null;
  city: string | null;
  points: number;
  level: number;
  role: string;
  status: string;
  memberSince: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');

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
        // Fetch full profile with oblast and referrer info
        const { data: profile } = await supabase
          .from('users')
          .select(`
            id,
            first_name,
            last_name,
            patronymic,
            email,
            phone,
            date_of_birth,
            membership_tier,
            avatar_url,
            referral_code,
            referral_count,
            referred_by_id,
            oblast_id,
            city,
            points,
            level,
            role,
            status,
            member_since,
            is_email_verified,
            is_phone_verified,
            is_identity_verified,
            oblast:oblasts(name)
          `)
          .eq('clerk_id', authUser.id)
          .single();

        if (profile) {
          // Get referrer name if exists
          let referredByName = null;
          if (profile.referred_by_id) {
            const { data: referrer } = await supabase
              .from('users')
              .select('first_name, last_name')
              .eq('id', profile.referred_by_id)
              .single();
            if (referrer) {
              referredByName = `${referrer.first_name} ${referrer.last_name}`;
            }
          }

          setUser({
            id: profile.id,
            email: profile.email || authUser.email || '',
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            patronymic: profile.patronymic,
            phone: profile.phone,
            dateOfBirth: profile.date_of_birth,
            membershipTier: profile.membership_tier || 'free',
            avatarUrl: profile.avatar_url,
            referralCode: profile.referral_code,
            referralCount: profile.referral_count || 0,
            referredByName,
            oblastName: Array.isArray(profile.oblast)
              ? profile.oblast[0]?.name || null
              : (profile.oblast as { name: string } | null)?.name || null,
            city: profile.city,
            points: profile.points || 0,
            level: profile.level || 1,
            role: profile.role,
            status: profile.status,
            memberSince: profile.member_since,
            isEmailVerified: profile.is_email_verified || false,
            isPhoneVerified: profile.is_phone_verified || false,
            isIdentityVerified: profile.is_identity_verified || false,
          });
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setPatronymic(profile.patronymic || '');
        }
      }
    };

    getUser();
  }, []);

  const copyReferralLink = () => {
    if (!user?.referralCode) return;
    const link = `${window.location.origin}/join?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null, includeTime = false) => {
    if (!dateString) return '—';
    const date = new Date(dateString);

    if (includeTime) {
      return date.toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }

    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      prospect: 'Кандидат',
      member: 'Член',
      activist: 'Активіст',
      regional_leader: 'Регіональний лідер',
      admin: 'Адміністратор',
      super_admin: 'Супер адмін',
      news_editor: 'Редактор новин',
    };
    return roles[role] || role;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setMessage('Помилка: Не авторизовано');
        return;
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (authError) {
        setMessage(`Помилка: ${authError.message}`);
        return;
      }

      // Update users table in database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          patronymic: patronymic.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', authUser.id);

      if (dbError) {
        setMessage(`Помилка: ${dbError.message}`);
        return;
      }

      setMessage('Профіль успішно оновлено!');
      router.refresh();
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

      {/* Account Summary */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-6">ІНФОРМАЦІЯ ПРО АКАУНТ</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-timber-dark/5 rounded">
            <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="font-syne text-2xl font-bold">{user.points}</p>
            <p className="text-xs text-timber-beam">Балів</p>
          </div>
          <div className="text-center p-4 bg-timber-dark/5 rounded">
            <Award className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="font-syne text-2xl font-bold">{user.level}</p>
            <p className="text-xs text-timber-beam">Рівень</p>
          </div>
          <div className="text-center p-4 bg-timber-dark/5 rounded">
            <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="font-syne text-2xl font-bold">{user.referralCount}</p>
            <p className="text-xs text-timber-beam">Запрошено</p>
          </div>
          <div className="text-center p-4 bg-timber-dark/5 rounded">
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="font-syne text-sm font-bold">{getRoleName(user.role)}</p>
            <p className="text-xs text-timber-beam">Роль</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-timber-beam" />
            <span className="text-timber-beam">Член з:</span>
            <span className="font-medium">{formatDate(user.memberSince)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-timber-beam" />
            <span className="text-timber-beam">Локація:</span>
            <span className="font-medium">
              {user.city && user.oblastName
                ? `${user.city}, ${user.oblastName}`
                : user.oblastName || user.city || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-6">РЕФЕРАЛЬНА ПРОГРАМА</p>

        {/* Who referred you */}
        {user.referredByName && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              <span className="font-medium">Вас запросив(ла):</span>{' '}
              <span className="font-bold">{user.referredByName}</span>
            </p>
          </div>
        )}

        {/* Your referral code */}
        <div className="mb-4">
          <label className="label block mb-2">ВАШ РЕФЕРАЛЬНИЙ КОД</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-timber-dark/5 border-2 border-timber-dark font-mono text-lg font-bold tracking-wider">
              {user.referralCode}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-3 border-2 border-timber-dark hover:bg-timber-dark hover:text-white transition-colors flex items-center gap-2"
              title="Скопіювати посилання"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Скопійовано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Копіювати</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-timber-beam mt-2">
            Поділіться цим кодом з друзями, щоб запросити їх до Мережі
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between p-4 bg-timber-dark/5 rounded">
          <div>
            <p className="font-bold">Запрошено людей</p>
            <p className="text-sm text-timber-beam">
              Кожне успішне запрошення = +50 балів
            </p>
          </div>
          <p className="font-syne text-3xl font-bold text-accent">
            {user.referralCount}
          </p>
        </div>
      </div>

      {/* Profile Photo */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-6">ФОТО ПРОФІЛЮ</p>

        <ProfilePhotoUpload
          currentAvatarUrl={user.avatarUrl}
          onUploadComplete={(avatarUrl) => {
            setUser((prev) => prev ? { ...prev, avatarUrl } : null);
            setMessage('Фото профілю успішно оновлено!');
            setTimeout(() => setMessage(''), 3000);
          }}
        />
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
            <label className="label block mb-2">ПО БАТЬКОВІ</label>
            <input
              type="text"
              value={patronymic}
              onChange={(e) => setPatronymic(e.target.value)}
              placeholder="Необов'язково"
              className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">
                <Mail className="w-3 h-3 inline mr-1" />
                ЕЛЕКТРОННА ПОШТА
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-timber-beam/10 border-2 border-timber-dark font-mono text-sm opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="label block mb-2">
                <Phone className="w-3 h-3 inline mr-1" />
                ТЕЛЕФОН
              </label>
              <input
                type="tel"
                value={user.phone || '—'}
                disabled
                className="w-full px-4 py-3 bg-timber-beam/10 border-2 border-timber-dark font-mono text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="label block mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              ДАТА НАРОДЖЕННЯ
            </label>
            <input
              type="text"
              value={formatDate(user.dateOfBirth)}
              disabled
              className="w-full px-4 py-3 bg-timber-beam/10 border-2 border-timber-dark font-mono text-sm opacity-60 cursor-not-allowed"
            />
          </div>

          <p className="text-xs text-timber-beam">
            Для зміни інших особистих даних (телефон, дата народження) зверніться до адміністратора
          </p>

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

      {/* Verification Status */}
      <div className="bg-canvas border-2 border-timber-dark p-6 lg:p-8 relative mb-8">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <p className="label text-accent mb-6">СТАТУС ВЕРИФІКАЦІЇ</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-timber-dark/5 rounded">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-timber-beam" />
              <span>Електронна пошта</span>
            </div>
            {user.isEmailVerified ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Підтверджено
              </span>
            ) : (
              <span className="text-amber-600 text-sm font-medium">Не підтверджено</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-timber-dark/5 rounded">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-timber-beam" />
              <span>Телефон</span>
            </div>
            {user.isPhoneVerified ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Підтверджено
              </span>
            ) : (
              <span className="text-amber-600 text-sm font-medium">Не підтверджено</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-timber-dark/5 rounded">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-timber-beam" />
              <span>Особистість</span>
            </div>
            {user.isIdentityVerified ? (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Підтверджено
              </span>
            ) : (
              <span className="text-amber-600 text-sm font-medium">Не підтверджено</span>
            )}
          </div>
        </div>
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
