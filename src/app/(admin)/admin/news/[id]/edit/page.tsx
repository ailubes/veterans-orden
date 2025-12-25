'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ImageUploadZone } from '@/components/admin/image-upload-zone';
import { validateSlugFormat } from '@/lib/utils/slug';

interface NewsEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NewsEditPage({ params }: NewsEditPageProps) {
  const router = useRouter();
  const [newsId, setNewsId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'update',
    status: 'draft',
    featured_image_url: '',
    author_id: '',
  });

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setNewsId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (newsId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newsId]);

  // Validate slug uniqueness (exclude current article)
  useEffect(() => {
    if (!formData.slug || !newsId) {
      setSlugError('');
      return;
    }

    // Validate format first
    const formatValidation = validateSlugFormat(formData.slug);
    if (!formatValidation.valid) {
      setSlugError(formatValidation.error || '');
      return;
    }

    // Check uniqueness via API (excluding current article)
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const response = await fetch(
          `/api/admin/news/check-slug?slug=${encodeURIComponent(
            formData.slug
          )}&excludeId=${newsId}`
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
  }, [formData.slug, newsId]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // Get current admin profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data: adminProfile } = await supabase
        .from('users')
        .select('role, id')
        .eq('clerk_id', user.id)
        .single();

      if (
        !adminProfile ||
        !['admin', 'super_admin', 'regional_leader', 'news_editor'].includes(
          adminProfile.role
        )
      ) {
        router.push('/dashboard');
        return;
      }

      // Get news article data
      const { data: article, error: articleError } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', newsId)
        .single();

      if (articleError || !article) {
        setError('Не вдалося завантажити дані статті');
        setLoading(false);
        return;
      }

      // Check if user can edit
      const hasEditPermission =
        adminProfile.role === 'super_admin' ||
        adminProfile.role === 'admin' ||
        adminProfile.role === 'news_editor' ||
        (adminProfile.role === 'regional_leader' &&
          article.author_id === adminProfile.id);

      if (!hasEditPermission) {
        router.push('/admin/news');
        return;
      }

      setCanEdit(hasEditPermission);

      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || 'update',
        status: article.status || 'draft',
        featured_image_url: article.featured_image_url || '',
        author_id: article.author_id || '',
      });

      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setSaving(true);
    setError(null);

    try {
      // Determine if we need to set published_at
      const wasPublished = formData.status === 'published';

      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          featured_image_url: formData.featured_image_url || null,
          shouldSetPublishedAt: wasPublished,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Помилка збереження');
      }

      router.push(`/admin/news/${newsId}`);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Помилка збереження');
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

  if (error && !canEdit) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-500 p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle size={24} />
            <p className="font-bold">{error || 'Помилка доступу'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/news/${newsId}`}
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4"
        >
          <ArrowLeft size={16} />
          Назад до статті
        </Link>
        <h1 className="font-syne text-3xl font-bold">Редагувати статтю</h1>
        <p className="text-timber-beam mt-2">
          Оновіть вміст статті з підтримкою Rich Text Editor
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <h2 className="text-xl font-bold mb-4">Основна інформація</h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-timber-dark mb-2">
                ЗАГОЛОВОК *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-timber-dark mb-2">
                URL (SLUG) *
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-timber-dark/10 border-2 border-r-0 border-timber-dark text-sm text-timber-beam whitespace-nowrap">
                  /news/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className={`flex-1 px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none ${
                    slugError ? 'border-red-500' : ''
                  }`}
                  required
                />
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
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-timber-dark mb-2">
                КОРОТКИЙ ОПИС
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[80px]"
                placeholder="Короткий опис для превью та соціальних мереж (необов'язково)"
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length} / 300 символів
              </p>
            </div>

            {/* Categories and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-timber-dark mb-2">
                  КАТЕГОРІЯ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
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
                <label className="block text-sm font-medium text-timber-dark mb-2">
                  СТАТУС *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="draft">📝 Чернетка</option>
                  <option value="published">✅ Опубліковано</option>
                  <option value="archived">📦 Архів</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image Card */}
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

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
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <h2 className="text-xl font-bold mb-4">Контент статті *</h2>

          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
            placeholder="Редагуйте вміст статті..."
            minHeight="500px"
            maxLength={50000}
          />
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
            disabled={saving || !!slugError || isCheckingSlug}
            className="px-6 py-3 bg-timber-dark text-white font-bold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'ЗБЕРЕЖЕННЯ...' : '💾 ЗБЕРЕГТИ ЗМІНИ →'}
          </button>
          <Link
            href={`/admin/news/${newsId}`}
            className="text-sm text-timber-beam hover:text-accent"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
