'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface Category {
  id: string;
  name_uk: string;
  name_en: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  is_active: boolean;
}

export default function NewsCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/sign-in';
        return;
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('clerk_id', user.id)
        .single();

      if (!userProfile || userProfile.role !== 'super_admin') {
        setError('Тільки super_admin має доступ до цієї сторінки');
        setLoading(false);
        return;
      }

      setHasPermission(true);
      loadCategories();
    } catch (err) {
      console.error('Permission check error:', err);
      setError('Помилка перевірки прав доступу');
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load categories');
      }

      setCategories(data.categories || []);
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setLoading(false);
    }
  };

  const handleUpdate = async (categoryId: string, updates: Partial<Category>) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      // Update local state
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, ...updates } : cat))
      );

      setSuccess('Категорію оновлено');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Помилка оновлення');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    await handleUpdate(categoryId, { is_active: !currentStatus });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-canvas border-2 border-timber-dark p-8 text-center">
          <p className="text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <div>
              <p className="font-bold">Доступ заборонено</p>
              <p className="text-sm">{error || 'У вас немає прав доступу до цієї сторінки'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4"
        >
          <ArrowLeft size={16} />
          Назад до налаштувань
        </Link>
        <h1 className="font-syne text-3xl font-bold">Категорії новин</h1>
        <p className="text-timber-beam mt-2">
          Керуйте метаданими категорій: назви, іконки, кольори та порядок відображення
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 p-6 mb-6">
        <h3 className="font-bold text-blue-900 mb-2">ℹ️ Важлива інформація</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <strong>Додавання нових категорій:</strong> потребує міграції бази даних для
            додавання значення до enum
          </li>
          <li>
            <strong>Редагування метаданих:</strong> можна змінювати назви, іконки, кольори
            без міграції
          </li>
          <li>
            <strong>Деактивація:</strong> категорія залишається в базі, але приховується в
            формах
          </li>
        </ul>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onUpdate={handleUpdate}
            onToggleActive={handleToggleActive}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onUpdate: (id: string, updates: Partial<Category>) => Promise<void>;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
  saving: boolean;
}

function CategoryCard({ category, onUpdate, onToggleActive, saving }: CategoryCardProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name_uk: category.name_uk,
    name_en: category.name_en,
    description: category.description || '',
    icon: category.icon || '',
    color: category.color || '',
  });

  const handleSave = async () => {
    await onUpdate(category.id, formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name_uk: category.name_uk,
      name_en: category.name_en,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
    });
    setEditing(false);
  };

  return (
    <div className="bg-canvas border-2 border-timber-dark p-6 relative">
      <div className="joint" style={{ top: '-6px', left: '-6px' }} />
      <div className="joint" style={{ top: '-6px', right: '-6px' }} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: category.color || '#6b7280' }}
          >
            {category.icon || '📄'}
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {category.name_uk} <span className="text-gray-500">/ {category.name_en}</span>
            </h3>
            <p className="text-sm text-gray-600">ID: {category.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-sm font-medium rounded ${
              category.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {category.is_active ? 'Активна' : 'Неактивна'}
          </span>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Назва (Українська)</label>
              <input
                type="text"
                value={formData.name_uk}
                onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
                className="w-full px-3 py-2 border-2 border-timber-dark focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Назва (English)</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-3 py-2 border-2 border-timber-dark focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border-2 border-timber-dark focus:border-accent focus:outline-none min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Іконка (emoji або Lucide)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border-2 border-timber-dark focus:border-accent focus:outline-none"
                placeholder="📢 або megaphone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Колір (hex)</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border-2 border-timber-dark focus:border-accent focus:outline-none"
                placeholder="#ef4444"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-timber-dark text-white font-bold font-mono uppercase tracking-wider text-sm transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--accent)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Зберегти
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border-2 border-timber-dark hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Скасувати
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 mb-4">{category.description || 'Без опису'}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-timber-dark text-white font-bold font-mono uppercase tracking-wider text-sm transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--accent)]"
            >
              Редагувати
            </button>
            <button
              onClick={() => onToggleActive(category.id, category.is_active)}
              disabled={saving}
              className={`px-4 py-2 font-bold transition-colors disabled:opacity-50 ${
                category.is_active
                  ? 'border-2 border-gray-300 hover:bg-gray-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {category.is_active ? 'Деактивувати' : 'Активувати'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
