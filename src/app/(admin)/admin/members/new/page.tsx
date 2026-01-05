'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

interface CreatedMemberInfo {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export default function NewMemberPage() {
  const router = useRouter();
  const [oblasts, setOblasts] = useState<Oblast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMember, setCreatedMember] = useState<CreatedMemberInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        .eq('auth_id', user.id)
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
      const response = await fetch('/api/admin/members/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка створення члена');
      }

      // Show success with credentials
      setCreatedMember({
        id: data.member.id,
        email: data.credentials.email,
        password: data.credentials.password,
        first_name: data.member.first_name,
        last_name: data.member.last_name,
      });
      setSaving(false);
    } catch (err) {
      console.error('Error creating member:', err);
      setError(err instanceof Error ? err.message : 'Помилка створення члена');
      setSaving(false);
    }
  };

  const copyCredentials = async () => {
    if (!createdMember) return;

    const text = `Email: ${createdMember.email}\nПароль: ${createdMember.password}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-panel-900 border border-line p-8 text-center rounded-lg">
          <p className="text-muted-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  // Success screen with credentials
  if (createdMember) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-panel-900 border border-line p-8 rounded-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h2 className="font-syne text-2xl font-bold text-text-100 mb-2">
              Члена створено успішно!
            </h2>
            <p className="text-muted-500">
              {createdMember.first_name} {createdMember.last_name}
            </p>
          </div>

          <div className="bg-panel-850 border border-line p-4 mb-6 rounded-lg">
            <p className="mono text-bronze text-xs tracking-widest mb-3">ДАНІ ДЛЯ ВХОДУ</p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-500 mb-1">Email</p>
                <p className="font-mono text-sm bg-panel-900 p-2 border border-line text-text-100 rounded">
                  {createdMember.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-500 mb-1">Пароль</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm bg-panel-900 p-2 border border-line text-text-100 flex-1 rounded">
                    {showPassword ? createdMember.password : '••••••••••••'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 border border-line hover:bg-panel-850 transition-colors rounded"
                  >
                    {showPassword ? <EyeOff size={18} className="text-text-100" /> : <Eye size={18} className="text-text-100" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={copyCredentials}
              className="mt-4 w-full px-4 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors flex items-center justify-center gap-2 rounded"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  СКОПІЙОВАНО!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  КОПІЮВАТИ ДАНІ ДЛЯ ВХОДУ
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted-500 text-center mb-6">
            Надішліть ці дані користувачу. Він зможе змінити пароль після входу.
          </p>

          <div className="flex gap-4">
            <Link
              href={`/admin/members/${createdMember.id}`}
              className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors flex-1 text-center rounded"
            >
              ПЕРЕГЛЯНУТИ ПРОФІЛЬ
            </Link>
            <button
              onClick={() => {
                setCreatedMember(null);
                setMember({
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
              }}
              className="px-4 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors rounded"
            >
              СТВОРИТИ ЩЕ
            </button>
          </div>
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
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="mono text-bronze text-xs tracking-widest mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100 flex items-center gap-3">
          <UserPlus size={32} />
          Новий член
        </h1>
        <p className="text-muted-500 mt-2">
          Створення нового члена мережі вручну (тільки для супер-адмінів)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ОСОБИСТА ІНФОРМАЦІЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Ім&apos;я <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={member.first_name}
                onChange={(e) => setMember({ ...member, first_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Прізвище <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={member.last_name}
                onChange={(e) => setMember({ ...member, last_name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">По-батькові</label>
              <input
                type="text"
                value={member.patronymic}
                onChange={(e) => setMember({ ...member, patronymic: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={member.email}
                onChange={(e) => setMember({ ...member, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Телефон</label>
              <input
                type="tel"
                value={member.phone}
                onChange={(e) => setMember({ ...member, phone: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Дата народження</label>
              <input
                type="date"
                value={member.date_of_birth}
                onChange={(e) => setMember({ ...member, date_of_birth: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">МІСЦЕЗНАХОДЖЕННЯ</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Область</label>
              <select
                value={member.oblast_id}
                onChange={(e) => setMember({ ...member, oblast_id: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
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
              <label className="block text-sm font-bold text-text-100 mb-2">Місто</label>
              <input
                type="text"
                value={member.city}
                onChange={(e) => setMember({ ...member, city: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>
          </div>
        </div>

        {/* Role & Status */}
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">РОЛЬ ТА СТАТУС</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Роль</label>
              <select
                value={member.role}
                onChange={(e) => setMember({ ...member, role: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
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
              <label className="block text-sm font-bold text-text-100 mb-2">Статус</label>
              <select
                value={member.status}
                onChange={(e) => setMember({ ...member, status: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
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
        <div className="bg-panel-900 border border-line p-6 mb-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ЧЛЕНСТВО</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">План членства</label>
              <select
                value={member.membership_tier}
                onChange={(e) => setMember({ ...member, membership_tier: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              >
                <option value="free">Безкоштовний</option>
                <option value="basic_49">Базовий (49 грн)</option>
                <option value="supporter_100">Прихильник (100 грн)</option>
                <option value="supporter_200">Прихильник (200 грн)</option>
                <option value="patron_500">Патрон (500 грн)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Оплачено до</label>
              <input
                type="date"
                value={member.membership_paid_until}
                onChange={(e) => setMember({ ...member, membership_paid_until: e.target.value })}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-100 mb-2">Початкові бали</label>
              <input
                type="number"
                min="0"
                value={member.points || ''}
                onChange={(e) => setMember({ ...member, points: e.target.value === '' ? 0 : parseInt(e.target.value, 10) })}
                onBlur={(e) => { if (e.target.value === '') setMember({ ...member, points: 0 }); }}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            <Save size={18} />
            {saving ? 'СТВОРЕННЯ...' : 'СТВОРИТИ ЧЛЕНА'}
          </button>

          <Link href="/admin/members" className="px-4 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors rounded">
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
