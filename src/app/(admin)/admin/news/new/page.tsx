'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw, Bell } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadZone } from '@/components/admin/image-upload-zone';
import { generateSlug, validateSlugFormat } from '@/lib/utils/slug';

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'update',
    status: 'draft',
    featured_image_url: '',
    notifyMembers: false,
  });

  // Generate slug when title field loses focus (only if not manually edited)
  const handleTitleBlur = () => {
    if (!formData.title || slugManuallyEdited) return;

    const autoSlug = generateSlug(formData.title);
    if (autoSlug && autoSlug !== formData.slug) {
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  };

  // Regenerate slug from title (button action)
  const handleRegenerateSlug = () => {
    if (!formData.title) return;
    const autoSlug = generateSlug(formData.title);
    setFormData((prev) => ({ ...prev, slug: autoSlug }));
    setSlugManuallyEdited(false);
  };

  // Track manual slug edits
  const handleSlugChange = (value: string) => {
    setFormData({ ...formData, slug: value });
    setSlugManuallyEdited(true);
  };

  // Validate slug uniqueness
  useEffect(() => {
    if (!formData.slug) {
      setSlugError('');
      return;
    }

    // Validate format first
    const formatValidation = validateSlugFormat(formData.slug);
    if (!formatValidation.valid) {
      setSlugError(formatValidation.error || '');
      return;
    }

    // Check uniqueness via API
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const response = await fetch(
          `/api/admin/news/check-slug?slug=${encodeURIComponent(formData.slug)}`
        );
        const data = await response.json();

        if (data.unique === false) {
          setSlugError('Цей slug вже використовується. Виберіть інший.');
        } else {
          setSlugError('');
        }
      } catch (err) {
        console.error('Error checking slug:', err);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate slug
    if (slugError) {
      setError('Виправте помилки slug перед збереженням');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.content || !formData.slug) {
      setError('Заповніть всі обов\'язкові поля');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Не авторизовано');
        return;
      }

      // Get user's database ID
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      // Insert article
      const { data: newArticle, error: insertError } = await supabase
        .from('news_articles')
        .insert({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          featured_image_url: formData.featured_image_url || null,
          author_id: profile.id,
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation
          setError('Стаття з таким slug вже існує');
          return;
        }
        throw insertError;
      }

      // Send notification if enabled and article is published
      if (formData.notifyMembers && formData.status === 'published' && newArticle) {
        try {
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Новина: ${formData.title}`,
              message: formData.excerpt
                ? formData.excerpt.slice(0, 200) + (formData.excerpt.length > 200 ? '...' : '')
                : 'Нова новина в Ордені',
              type: 'info',
              scope: 'all',
            }),
          });
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError);
        }
      }

      router.push('/admin/news');
      router.refresh();
    } catch (err) {
      console.error('News creation error:', err);
      setError('Помилка створення статті');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4"
        >
          <ArrowLeft size={16} />
          Назад до новин
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нова стаття</h1>
        <p className="text-muted-500 mt-2">
          Створіть нову статтю з підтримкою Rich Text Editor та завантаження зображень
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <h2 className="text-xl font-bold mb-4">Основна інформація</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-100 mb-2">
                ЗАГОЛОВОК *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                onBlur={handleTitleBlur}
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                placeholder="Наприклад: Новини з України"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Slug буде згенеровано автоматично після виходу з поля
              </p>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-text-100 mb-2">
                URL (SLUG) *
                {slugManuallyEdited && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">
                    (редаговано вручну)
                  </span>
                )}
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-panel-850/10 border-2 border-r-0 border-line text-sm text-muted-500 whitespace-nowrap">
                  /news/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`flex-1 px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none ${
                    slugError ? 'border-red-500' : ''
                  }`}
                  placeholder="novini-z-ukraini"
                  required
                />
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  disabled={!formData.title}
                  title="Згенерувати slug з заголовка"
                  className="px-3 py-3 border-2 border-l-0 border-line hover:bg-panel-850/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {isCheckingSlug && (
                  <span className="ml-2 text-xs text-gray-500">Перевірка...</span>
                )}
              </div>
              {slugError && (
                <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{slugError}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Можете редагувати slug вручну або натиснути ↻ для генерації з заголовка
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-text-100 mb-2">
                КОРОТКИЙ ОПИС
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none min-h-[80px]"
                placeholder="Короткий опис для превью та соціальних мереж (необов'язково)"
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length} / 300 символів
              </p>
            </div>

            {/* Categories and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">
                  КАТЕГОРІЯ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="announcement">📢 Оголошення</option>
                  <option value="update">🔔 Оновлення</option>
                  <option value="success_story">🏆 Історія успіху</option>
                  <option value="media">📰 Медіа</option>
                  <option value="education">📚 Освіта</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-100 mb-2">
                  СТАТУС *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-sm focus:border-bronze focus:outline-none"
                  required
                >
                  <option value="draft">📝 Чернетка</option>
                  <option value="published">✅ Опублікувати зараз</option>
                </select>
              </div>
            </div>

            {/* Notification Option */}
            <div className="border-t border-line/20 pt-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyMembers}
                  onChange={(e) => setFormData({ ...formData, notifyMembers: e.target.checked })}
                  className="w-5 h-5"
                />
                <Bell className="w-5 h-5 text-bronze" />
                <span className="font-bold">Сповістити всіх членів про новину</span>
              </label>
              <p className="text-xs text-muted-500 mt-2 ml-8">
                Сповіщення буде надіслано тільки якщо статус &quot;Опублікувати зараз&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Featured Image Card */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <h2 className="text-xl font-bold mb-4">Головне зображення</h2>

          <ImageUploadZone
            value={formData.featured_image_url}
            onChange={(url) =>
              setFormData({ ...formData, featured_image_url: url })
            }
            label="Головне зображення статті"
            context="news_featured"
            compress={true}
          />
        </div>

        {/* Content Editor Card */}
        <div className="bg-panel-900 border border-line rounded-lg p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <h2 className="text-xl font-bold mb-4">Контент статті *</h2>

          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Почніть писати статтю... Використовуйте панель інструментів для форматування, або вставте зображення Ctrl+V"
            minHeight="500px"
            maxLength={50000}
          />

          <p className="text-xs text-gray-500 mt-2">
            💡 <strong>Підказки:</strong> Використовуйте ## для заголовків, **жирний**
            для жирного тексту, вставляйте скріншоти через Ctrl+V
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Помилка</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !!slugError || isCheckingSlug}
            className="px-6 py-3 bg-panel-850 text-white font-bold font-mono uppercase tracking-wider transition-transform hover:translate-x-1 hover:-translate-y-1 hover:shadow-[-4px_4px_0_var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading
              ? 'ЗБЕРЕЖЕННЯ...'
              : formData.status === 'published'
              ? '✅ ОПУБЛІКУВАТИ →'
              : '📝 ЗБЕРЕГТИ ЧЕРНЕТКУ →'}
          </button>
          <Link
            href="/admin/news"
            className="text-sm text-muted-500 hover:text-bronze"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
