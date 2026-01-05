'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { MembershipUpgrade } from '@/components/dashboard/membership-upgrade';
import { ProfilePhotoUpload } from '@/components/dashboard/profile-photo-upload';
import { MessageToLeader } from '@/components/dashboard/message-to-leader';
import { NovaPoshtaSelector } from '@/components/dashboard/nova-poshta-selector';
import { KatottgSelector, type KatottgDetails } from '@/components/ui/katottg-selector';
import { formatDate } from '@/lib/utils';
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
  Home,
  Package,
} from 'lucide-react';

type UserSex = 'male' | 'female' | 'not_specified' | null;

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  sex: UserSex;
  membershipTier: string;
  avatarUrl: string | null;
  referralCode: string;
  referralCount: number;
  referredById: string | null;
  referredByName: string | null;
  // KATOTTG location
  katottgCode: string | null;
  settlementName: string | null;
  hromadaName: string | null;
  raionName: string | null;
  oblastNameKatottg: string | null;
  locationLastChangedAt: string | null; // For 30-day restriction
  // Legacy location (for display)
  oblastId: string | null;
  oblastName: string | null;
  city: string | null;
  // Address fields
  streetAddress: string | null;
  postalCode: string | null;
  // Nova Poshta fields
  novaPoshtaCity: string | null;
  novaPoshtaBranch: string | null;
  // Stats
  points: number;
  level: number;
  role: string;
  status: string;
  memberSince: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  regionalLeaderId: string | null;
  regionalLeaderName: string | null;
}

// Check if location change is allowed (30 days since last change)
function canChangeLocation(lastChangedAt: string | null): { allowed: boolean; daysRemaining: number } {
  if (!lastChangedAt) return { allowed: true, daysRemaining: 0 };

  const lastChanged = new Date(lastChangedAt);
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 30 - daysSinceChange);

  return { allowed: daysSinceChange >= 30, daysRemaining };
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
  const [sex, setSex] = useState<UserSex>(null);

  // KATOTTG location
  const [katottgCode, setKatottgCode] = useState<string | null>(null);
  const [katottgDetails, setKatottgDetails] = useState<KatottgDetails | null>(null);
  // Track original location for change detection
  const [originalKatottgCode, setOriginalKatottgCode] = useState<string | null>(null);

  // Address fields
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Nova Poshta fields
  const [novaPoshtaCity, setNovaPoshtaCity] = useState('');
  const [novaPoshtaBranch, setNovaPoshtaBranch] = useState('');

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
        // Fetch full profile with KATOTTG and referrer info
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
            sex,
            membership_tier,
            avatar_url,
            referral_code,
            referral_count,
            referred_by_id,
            katottg_code,
            settlement_name,
            hromada_name,
            raion_name,
            oblast_name_katottg,
            location_last_changed_at,
            oblast_id,
            city,
            street_address,
            postal_code,
            nova_poshta_city,
            nova_poshta_branch,
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
          .eq('auth_id', authUser.id)
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

          // Get regional leader if user has an oblast
          let regionalLeaderId = null;
          let regionalLeaderName = null;
          if (profile.oblast_id) {
            const { data: oblast } = await supabase
              .from('oblasts')
              .select('leader_id')
              .eq('id', profile.oblast_id)
              .single();

            if (oblast?.leader_id) {
              const { data: leader } = await supabase
                .from('users')
                .select('id, first_name, last_name')
                .eq('id', oblast.leader_id)
                .single();
              if (leader) {
                regionalLeaderId = leader.id;
                regionalLeaderName = `${leader.first_name} ${leader.last_name}`;
              }
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
            sex: profile.sex as UserSex,
            membershipTier: profile.membership_tier || 'free',
            avatarUrl: profile.avatar_url,
            referralCode: profile.referral_code,
            referralCount: profile.referral_count || 0,
            referredById: profile.referred_by_id || null,
            referredByName,
            // KATOTTG location
            katottgCode: profile.katottg_code || null,
            settlementName: profile.settlement_name || null,
            hromadaName: profile.hromada_name || null,
            raionName: profile.raion_name || null,
            oblastNameKatottg: profile.oblast_name_katottg || null,
            locationLastChangedAt: profile.location_last_changed_at || null,
            // Legacy location
            oblastId: profile.oblast_id || null,
            oblastName: Array.isArray(profile.oblast)
              ? profile.oblast[0]?.name || null
              : (profile.oblast as { name: string } | null)?.name || null,
            city: profile.city,
            streetAddress: profile.street_address,
            postalCode: profile.postal_code,
            novaPoshtaCity: profile.nova_poshta_city,
            novaPoshtaBranch: profile.nova_poshta_branch,
            points: profile.points || 0,
            level: profile.level || 1,
            role: profile.role,
            status: profile.status,
            memberSince: profile.member_since,
            isEmailVerified: profile.is_email_verified || false,
            isPhoneVerified: profile.is_phone_verified || false,
            isIdentityVerified: profile.is_identity_verified || false,
            regionalLeaderId,
            regionalLeaderName,
          });
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setPatronymic(profile.patronymic || '');
          setSex(profile.sex as UserSex);
          setKatottgCode(profile.katottg_code || null);
          setOriginalKatottgCode(profile.katottg_code || null); // Track original for change detection
          // Load KATOTTG details if code exists
          if (profile.katottg_code) {
            setKatottgDetails({
              code: profile.katottg_code,
              name: profile.settlement_name || '',
              category: '',
              level: 4,
              oblastCode: null,
              raionCode: null,
              hromadaCode: null,
              oblastName: profile.oblast_name_katottg || null,
              raionName: profile.raion_name || null,
              hromadaName: profile.hromada_name || null,
              fullPath: '',
            });
          }
          setStreetAddress(profile.street_address || '');
          setPostalCode(profile.postal_code || '');
          setNovaPoshtaCity(profile.nova_poshta_city || '');
          setNovaPoshtaBranch(profile.nova_poshta_branch || '');
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

      // Check if location is being changed
      const locationChanged = katottgCode !== originalKatottgCode;

      // If location is being changed, check if it's allowed
      if (locationChanged && user) {
        const locationStatus = canChangeLocation(user.locationLastChangedAt);
        if (!locationStatus.allowed) {
          setMessage(`Помилка: Ви можете змінити локацію через ${locationStatus.daysRemaining} днів`);
          setLoading(false);
          return;
        }
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

      // If location is being changed, log it first
      if (locationChanged && user) {
        const { error: logError } = await supabase
          .from('user_location_changes')
          .insert({
            user_id: user.id,
            previous_katottg_code: originalKatottgCode,
            previous_settlement_name: user.settlementName,
            previous_hromada_name: user.hromadaName,
            previous_raion_name: user.raionName,
            previous_oblast_name: user.oblastNameKatottg,
            new_katottg_code: katottgCode,
            new_settlement_name: katottgDetails?.name || null,
            new_hromada_name: katottgDetails?.hromadaName || null,
            new_raion_name: katottgDetails?.raionName || null,
            new_oblast_name: katottgDetails?.oblastName || null,
            change_reason: 'user_update',
            changed_by: user.id,
          });

        if (logError) {
          console.error('Failed to log location change:', logError);
          // Don't block the update, just log the error
        }
      }

      // Build update object
      const updateData: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        patronymic: patronymic.trim() || null,
        sex: sex || 'not_specified',
        // Address
        street_address: streetAddress.trim() || null,
        postal_code: postalCode.trim() || null,
        nova_poshta_city: novaPoshtaCity.trim() || null,
        nova_poshta_branch: novaPoshtaBranch.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Only update location fields if location change is allowed
      if (locationChanged && user) {
        const locationStatus = canChangeLocation(user.locationLastChangedAt);
        if (locationStatus.allowed) {
          updateData.katottg_code = katottgCode;
          updateData.settlement_name = katottgDetails?.name || null;
          updateData.hromada_name = katottgDetails?.hromadaName || null;
          updateData.raion_name = katottgDetails?.raionName || null;
          updateData.oblast_name_katottg = katottgDetails?.oblastName || null;
          updateData.location_last_changed_at = new Date().toISOString();
        }
      }

      // Update users table in database
      const { error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('auth_id', authUser.id);

      if (dbError) {
        setMessage(`Помилка: ${dbError.message}`);
        return;
      }

      // Update local state if location was changed
      if (locationChanged && user) {
        setOriginalKatottgCode(katottgCode);
        setUser(prev => prev ? {
          ...prev,
          katottgCode,
          settlementName: katottgDetails?.name || null,
          hromadaName: katottgDetails?.hromadaName || null,
          raionName: katottgDetails?.raionName || null,
          oblastNameKatottg: katottgDetails?.oblastName || null,
          locationLastChangedAt: new Date().toISOString(),
        } : null);
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
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-6">ІНФОРМАЦІЯ ПРО АКАУНТ</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-panel-850/5 rounded">
            <Star className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="font-syne text-2xl font-bold">{user.points}</p>
            <p className="text-xs text-muted-500">Балів</p>
          </div>
          <div className="text-center p-4 bg-panel-850/5 rounded">
            <Award className="w-6 h-6 mx-auto mb-2 text-bronze" />
            <p className="font-syne text-2xl font-bold">{user.level}</p>
            <p className="text-xs text-muted-500">Рівень</p>
          </div>
          <div className="text-center p-4 bg-panel-850/5 rounded">
            <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="font-syne text-2xl font-bold">{user.referralCount}</p>
            <p className="text-xs text-muted-500">Запрошено</p>
          </div>
          <div className="text-center p-4 bg-panel-850/5 rounded">
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="font-syne text-sm font-bold">{getRoleName(user.role)}</p>
            <p className="text-xs text-muted-500">Роль</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-500" />
            <span className="text-muted-500">Член з:</span>
            <span className="font-medium">{formatDate(user.memberSince)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-500" />
            <span className="text-muted-500">Локація:</span>
            <span className="font-medium">
              {user.settlementName
                ? `${user.settlementName}, ${user.oblastNameKatottg || ''}`
                : user.city && user.oblastName
                ? `${user.city}, ${user.oblastName}`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-6">РЕФЕРАЛЬНА ПРОГРАМА</p>

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
            <div className="flex-1 px-4 py-3 bg-panel-850/5 border border-line rounded-lg font-mono text-lg font-bold tracking-wider">
              {user.referralCode}
            </div>
            <button
              onClick={copyReferralLink}
              className="px-4 py-3 border border-line rounded-lg hover:bg-panel-850 hover:text-white transition-colors flex items-center gap-2"
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
          <p className="text-xs text-muted-500 mt-2">
            Поділіться цим кодом з друзями, щоб запросити їх до Мережі
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between p-4 bg-panel-850/5 rounded">
          <div>
            <p className="font-bold">Запрошено людей</p>
            <p className="text-sm text-muted-500">
              Кожне успішне запрошення = +50 балів
            </p>
          </div>
          <p className="font-syne text-3xl font-bold text-bronze">
            {user.referralCount}
          </p>
        </div>
      </div>

      {/* Message to Leader Section */}
      {(user.referredById || user.regionalLeaderId) && (
        <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <p className="label text-bronze mb-6">НАПИСАТИ ЛІДЕРУ</p>

          <MessageToLeader
            referrerId={user.referredById}
            referrerName={user.referredByName}
            regionalLeaderId={user.regionalLeaderId}
            regionalLeaderName={user.regionalLeaderName}
            oblastName={user.oblastName}
          />
        </div>
      )}

      {/* Profile Photo */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-6">ФОТО ПРОФІЛЮ</p>

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
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-6">ОСОБИСТІ ДАНІ</p>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ІМ&apos;Я</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
              />
            </div>
            <div>
              <label className="label block mb-2">ПРІЗВИЩЕ</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">ПО БАТЬКОВІ</label>
              <input
                type="text"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                placeholder="Необов'язково"
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
              />
            </div>
            <div>
              <label className="label block mb-2">СТАТЬ</label>
              <select
                value={sex || 'not_specified'}
                onChange={(e) => setSex(e.target.value as UserSex)}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
              >
                <option value="not_specified">Не вказано</option>
                <option value="male">Чоловік</option>
                <option value="female">Жінка</option>
              </select>
            </div>
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
                className="w-full px-4 py-3 bg-bronze/10 border border-line rounded-lg font-mono text-sm opacity-60 cursor-not-allowed"
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
                className="w-full px-4 py-3 bg-bronze/10 border border-line rounded-lg font-mono text-sm opacity-60 cursor-not-allowed"
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
              className="w-full px-4 py-3 bg-bronze/10 border border-line rounded-lg font-mono text-sm opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Location Section */}
          <div className="border-t border-line/20 pt-6 mt-6">
            <p className="label text-bronze mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              ЛОКАЦІЯ
            </p>

            {/* 30-day restriction warning */}
            {user.locationLastChangedAt && !canChangeLocation(user.locationLastChangedAt).allowed && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <p className="font-medium mb-1">⚠️ Зміна локації тимчасово недоступна</p>
                <p className="text-xs">
                  Ви зможете змінити локацію через {canChangeLocation(user.locationLastChangedAt).daysRemaining} днів.
                  Останнє оновлення: {formatDate(user.locationLastChangedAt)}
                </p>
              </div>
            )}

            <KatottgSelector
              value={katottgCode}
              onChange={(code, details) => {
                setKatottgCode(code);
                setKatottgDetails(details);
              }}
              required
              disabled={user.locationLastChangedAt !== null && !canChangeLocation(user.locationLastChangedAt).allowed}
            />

            {/* Info about location change restriction */}
            <p className="text-xs text-muted-500 mt-2">
              Локацію можна змінювати раз на 30 днів для забезпечення чесності виборчого процесу.
            </p>
          </div>

          {/* Delivery Address Section */}
          <div className="border-t border-line/20 pt-6 mt-2">
            <p className="label text-bronze mb-4 flex items-center gap-2">
              <Home className="w-4 h-4" />
              АДРЕСА ДОСТАВКИ
            </p>
            <p className="text-xs text-muted-500 mb-4">
              Вкажіть адресу для отримання матеріалів Мережі
            </p>

            <div className="space-y-4">
              <div>
                <label className="label block mb-2">ВУЛИЦЯ, БУДИНОК, КВАРТИРА</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Наприклад: вул. Хрещатик, 1, кв. 10"
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-2">ПОШТОВИЙ ІНДЕКС</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="01001"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nova Poshta Section */}
          <div className="border-t border-line/20 pt-6 mt-2">
            <p className="label text-bronze mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              НОВА ПОШТА
            </p>
            <p className="text-xs text-muted-500 mb-4">
              Вкажіть відділення Нової Пошти для отримання посилок
            </p>

            <NovaPoshtaSelector
              city={novaPoshtaCity}
              branch={novaPoshtaBranch}
              onCityChange={(city) => setNovaPoshtaCity(city)}
              onBranchChange={(branch) => setNovaPoshtaBranch(branch)}
            />
          </div>

          <p className="text-xs text-muted-500 mt-6">
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
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-6">СТАТУС ВЕРИФІКАЦІЇ</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-panel-850/5 rounded">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-500" />
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

          <div className="flex items-center justify-between p-3 bg-panel-850/5 rounded">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-500" />
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

          <div className="flex items-center justify-between p-3 bg-panel-850/5 rounded">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-500" />
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
      <div className="bg-panel-900 border border-line rounded-lg p-6 lg:p-8 relative mb-8">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4">ЧЛЕНСТВО</p>

        {user.membershipTier === 'free' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-syne text-xl font-bold">Безкоштовний план</h3>
                <p className="text-sm text-muted-500">Базові можливості Мережі</p>
              </div>
              <div className="text-right">
                <p className="font-syne text-2xl font-bold">0 ₴</p>
                <p className="text-xs text-muted-500">/ місяць</p>
              </div>
            </div>

            <div className="border-t border-line/20 pt-6">
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
                <p className="text-sm text-muted-500">Активне членство</p>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold">
                АКТИВНИЙ
              </div>
            </div>

            <p className="text-sm text-muted-500 mb-4">
              Дякуємо за підтримку Мережі Вільних Людей!
            </p>

            <div className="border-t border-line/20 pt-6">
              <p className="font-bold mb-4">Оновити план:</p>
              <MembershipUpgrade currentTier={user.membershipTier} />
            </div>
          </>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-panel-900 border-2 border-red-200 p-6 lg:p-8 relative">
        <p className="label text-red-600 mb-4">НЕБЕЗПЕЧНА ЗОНА</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-syne font-bold">Вийти з акаунту</h3>
            <p className="text-sm text-muted-500">
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
