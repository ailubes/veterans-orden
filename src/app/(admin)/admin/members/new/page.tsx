'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generateReferralCode } from '@/lib/utils';

interface Oblast {
  id: string;
  name: string;
}

interface NewMember {
  first_name: string;
  last_name: string;
  patronymic: string;
  email: string;
  phone: string;
  date_of_birth: string;
  oblast_id: string;
  city: string;
  role: string;
  status: string;
  membership_tier: string;
  membership_paid_until: string;
  points: number;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [oblasts, setOblasts] = useState<Oblast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [member, setMember] = useState<NewMember>({
    first_name: '',
    last_name: '',
    patronymic: '',
    email: '',
    phone: '',
    date_of_birth: '',
    oblast_id: '',
    city: '',
    role: 'full_member',
    status: 'active',
    membership_tier: 'free',
    membership_paid_until: '',
    points: 0,
  });

  useEffect(() => {
    checkAccessAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccessAndLoadData = async () => {
    try {
      const supabase = createClient();

      // Get current admin profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data: adminProfile } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', user.id)
        .single();

      // Only super_admin can create new members
      if (!adminProfile || adminProfile.role !== 'super_admin') {
        router.push('/admin/members');
        return;
      }

      // Get oblasts
      const { data: oblastsData } = await supabase
        .from('oblasts')
        .select('id, name')
        .order('name');

      if (oblastsData) {
        setOblasts(oblastsData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', member.email)
        .single();

      if (existingUser) {
        setError('Користувач з таким email вже існує');
        setSaving(false);
        return;
      }

      // Generate unique clerk_id for manually created members
      const manualClerkId = `manual_${crypto.randomUUID()}`;

      // Generate unique referral code
      let referralCode = generateReferralCode();

      // Check if referral code exists and regenerate if needed
      let codeExists = true;
      while (codeExists) {
        const { data: existingCode } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single();

        if (!existingCode) {
          codeExists = false;
        } else {
          referralCode = generateReferralCode();
        }
      }

      // Create new member
      const { data: newMember, error: insertError } = await supabase
        .from('users')
        .insert({
          clerk_id: manualClerkId,
          first_name: member.first_name,
          last_name: member.last_name,
          patronymic: member.patronymic || null,
          email: member.email,
          phone: member.phone || null,
          date_of_birth: member.date_of_birth || null,
          oblast_id: member.oblast_id || null,
          city: member.city || null,
          role: member.role,
          status: member.status,
          membership_tier: member.membership_tier,
          membership_paid_until: member.membership_paid_until || null,
          points: member.points,
          level: 1,
          referral_code: referralCode,
          referral_count: 0,
          is_email_verified: false,
          is_phone_verified: false,
          is_identity_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Redirect to new member's page
      router.push(`/admin/members/${newMember.id}`);
    } catch (err) {
      console.error('Error creating member:', err);
      setError('Помилка створення члена');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="label text-accent mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold flex items-center gap-3">
          <UserPlus size={32} />
          Новий член
        </h1>
        <p className="text-timber-beam mt-2">
          Створення нового члена мережі вручну (тільки для супер-адмінів)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-600 p-4 mb-6">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <p className="label text-accent mb-4">ОСОБИСТА ІНФОРМАЦІЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Ім&apos;я <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={member.first_name}
                onChange={(e) => setMember({ ...member, first_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Прізвище <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={member.last_name}
                onChange={(e) => setMember({ ...member, last_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">По-батькові</label>
              <input
                type="text"
                value={member.patronymic}
                onChange={(e) => setMember({ ...member, patronymic: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Телефон</label>
              <input
                type="tel"
                value={member.phone}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Дата народження</label>
              <input
                type="date"
                value={member.date_of_birth}
                onChange={(e) => setMember({ ...member, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <p className="label text-accent mb-4">МІСЦЕЗНАХОДЖЕННЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Область</label>
              <select
                value={member.oblast_id}
                onChange={(e) => setMember({ ...member, oblast_id: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="">Оберіть область</option>
                {oblasts.map((oblast) => (
                  <option key={oblast.id} value={oblast.id}>
                    {oblast.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Місто</label>
              <input
                type="text"
                value={member.city}
                onChange={(e) => setMember({ ...member, city: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <p className="label text-accent mb-4">РОЛЬ ТА СТАТУС</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Роль</label>
              <select
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="free_viewer">Спостерігач</option>
                <option value="prospect">Потенційний член</option>
                <option value="silent_member">Мовчазний член</option>
                <option value="full_member">Повноцінний член</option>
                <option value="group_leader">Лідер групи</option>
                <option value="regional_leader">Регіональний лідер</option>
                <option value="admin">Адмін</option>
                <option value="super_admin">Супер-адмін</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Статус</label>
              <select
                value={member.status}
                onChange={(e) => setMember({ ...member, status: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="pending">На перевірці</option>
                <option value="active">Активний</option>
                <option value="suspended">Призупинено</option>
                <option value="churned">Відійшов</option>
              </select>
            </div>
          </div>
        </div>

        {/* Membership */}
        <div className="bg-canvas border-2 border-timber-dark p-6 mb-6 relative card-with-joints">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <p className="label text-accent mb-4">ЧЛЕНСТВО</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">План членства</label>
              <select
                value={member.membership_tier}
                onChange={(e) => setMember({ ...member, membership_tier: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              >
                <option value="free">Безкоштовний</option>
                <option value="basic_49">Базовий (49 грн)</option>
                <option value="supporter_100">Прихильник (100 грн)</option>
                <option value="supporter_200">Прихильник (200 грн)</option>
                <option value="patron_500">Патрон (500 грн)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Оплачено до</label>
              <input
                type="date"
                value={member.membership_paid_until}
                onChange={(e) => setMember({ ...member, membership_paid_until: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Початкові бали</label>
              <input
                type="number"
                value={member.points}
                onChange={(e) => setMember({ ...member, points: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'СТВОРЕННЯ...' : 'СТВОРИТИ ЧЛЕНА'}
          </button>

          <Link href="/admin/members" className="btn btn-outline">
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
