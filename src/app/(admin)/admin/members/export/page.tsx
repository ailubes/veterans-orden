'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileSpreadsheet, Filter, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MembersExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Stats
  const [totalMembers, setTotalMembers] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    checkAccessAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading) {
      loadFilteredCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, tierFilter, loading]);

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

      // Only super_admin can export
      if (!adminProfile || adminProfile.role !== 'super_admin') {
        router.push('/admin/members');
        return;
      }

      // Get total members count
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setTotalMembers(count || 0);
      setFilteredCount(count || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    }
  };

  const loadFilteredCount = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      if (tierFilter) {
        query = query.eq('membership_tier', tierFilter);
      }

      const { count } = await query;
      setFilteredCount(count || 0);
    } catch (err) {
      console.error('Error loading filtered count:', err);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (tierFilter) params.set('tier', tierFilter);

      const response = await fetch(`/api/admin/members/export?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Get the CSV content
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`Успішно експортовано ${filteredCount} членів`);
    } catch (err) {
      console.error('Error exporting:', err);
      setError(err instanceof Error ? err.message : 'Помилка експорту');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-panel-900 border border-line rounded-lg p-8 text-center">
          <p className="text-muted-500">Завантаження...</p>
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
        <p className="label text-bronze mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold flex items-center gap-3">
          <FileSpreadsheet size={32} />
          Експорт членів
        </h1>
        <p className="text-muted-500 mt-2">
          Експорт даних членів у CSV файл (тільки для супер-адмінів)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-2 border-red-600 p-4 mb-6">
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border-2 border-green-600 p-4 mb-6">
          <p className="text-green-600 font-bold">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label text-muted-500 mb-1">ВСЬОГО ЧЛЕНІВ</p>
          <p className="font-syne text-3xl font-bold">{totalMembers}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label text-muted-500 mb-1">БУДЕ ЕКСПОРТОВАНО</p>
          <p className="font-syne text-3xl font-bold text-bronze">{filteredCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 mb-6 relative card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4 flex items-center gap-2">
          <Filter size={14} />
          ФІЛЬТРИ (ОПЦІЙНО)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Роль</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
            >
              <option value="">Всі ролі</option>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
            >
              <option value="">Всі статуси</option>
              <option value="pending">На перевірці</option>
              <option value="active">Активний</option>
              <option value="suspended">Призупинено</option>
              <option value="churned">Відійшов</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">План членства</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-4 py-2 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
            >
              <option value="">Всі плани</option>
              <option value="free">Безкоштовний</option>
              <option value="basic_49">Базовий (49 грн)</option>
              <option value="supporter_100">Прихильник (100 грн)</option>
              <option value="supporter_200">Прихильник (200 грн)</option>
              <option value="patron_500">Патрон (500 грн)</option>
            </select>
          </div>
        </div>

        {(roleFilter || statusFilter || tierFilter) && (
          <button
            type="button"
            onClick={() => {
              setRoleFilter('');
              setStatusFilter('');
              setTierFilter('');
            }}
            className="mt-4 text-sm text-bronze hover:underline"
          >
            Скинути всі фільтри
          </button>
        )}
      </div>

      {/* Export Info */}
      <div className="bg-panel-900 border border-line rounded-lg p-6 mb-6 relative card-with-joints">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <p className="label text-bronze mb-4">ІНФОРМАЦІЯ ПРО ЕКСПОРТ</p>

        <div className="text-sm space-y-2 text-muted-500">
          <p>CSV файл буде містити наступні поля:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>ID, Ім&apos;я, Прізвище, По-батькові</li>
            <li>Email, Телефон, Дата народження</li>
            <li>Область, Місто</li>
            <li>Роль, Статус, План членства</li>
            <li>Оплачено до, Бали, Рівень</li>
            <li>Статус верифікації (Email, Телефон, Особа)</li>
            <li>Дата реєстрації</li>
          </ul>
          <p className="mt-4 text-xs">
            Файл буде в кодуванні UTF-8 з BOM для коректного відображення в Excel.
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || filteredCount === 0}
          className="btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              ЕКСПОРТУЄМО...
            </>
          ) : (
            <>
              <Download size={18} />
              ЕКСПОРТУВАТИ CSV
            </>
          )}
        </button>

        <Link href="/admin/members" className="btn btn-outline">
          СКАСУВАТИ
        </Link>
      </div>
    </div>
  );
}
