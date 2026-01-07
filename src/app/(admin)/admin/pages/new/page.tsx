'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { BlockEditor } from '@/components/admin/block-editor';
import { ImageUploadZone } from '@/components/admin/image-upload-zone';

export default function NewPagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [parentPages, setParentPages] = useState<{ slug: string; title: string }[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    label: '',
    description: '',
    content: '',
    parent_slug: '',
    status: 'draft',
    featured_image_url: '',
    show_in_nav: false,
    nav_label: '',
    meta_title: '',
    meta_description: '',
    sort_order: 0,
  });

  // Load parent pages for dropdown
  useEffect(() => {
    const loadParentPages = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('pages')
        .select('slug, title')
        .is('parent_slug', null)
        .order('sort_order');

      if (data) {
        setParentPages(data);
      }
    };
    loadParentPages();
  }, []);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
      'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
      'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
      'я': 'ya', "'": '', '\u2019': '',
    };

    return title
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleBlur = () => {
    if (!formData.title || slugManuallyEdited) return;
    const autoSlug = generateSlug(formData.title);
    if (autoSlug && autoSlug !== formData.slug) {
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  };

  const handleRegenerateSlug = () => {
    if (!formData.title) return;
    const autoSlug = generateSlug(formData.title);
    setFormData((prev) => ({ ...prev, slug: autoSlug }));
    setSlugManuallyEdited(false);
  };

  const handleSlugChange = (value: string) => {
    setFormData({ ...formData, slug: value });
    setSlugManuallyEdited(true);
  };

  // Check slug uniqueness
  useEffect(() => {
    if (!formData.slug) {
      setSlugError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const supabase = createClient();
        const fullSlug = formData.parent_slug
          ? `${formData.parent_slug}/${formData.slug}`
          : formData.slug;

        const { data } = await supabase
          .from('pages')
          .select('id')
          .eq('slug', fullSlug)
          .maybeSingle();

        if (data) {
          setSlugError('Цей slug вже використовується');
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
  }, [formData.slug, formData.parent_slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (slugError) {
      setError('Виправте помилки slug перед збереженням');
      return;
    }

    if (!formData.title || !formData.content || !formData.slug) {
      setError('Заповніть всі обов\'язкові поля');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Не авторизовано');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      const fullSlug = formData.parent_slug
        ? `${formData.parent_slug}/${formData.slug}`
        : formData.slug;

      const { error: insertError } = await supabase
        .from('pages')
        .insert({
          title: formData.title,
          slug: fullSlug,
          label: formData.label || null,
          description: formData.description || null,
          content: formData.content,
          parent_slug: formData.parent_slug || null,
          status: formData.status,
          featured_image_url: formData.featured_image_url || null,
          show_in_nav: formData.show_in_nav,
          nav_label: formData.nav_label || null,
          meta_title: formData.meta_title || null,
          meta_description: formData.meta_description || null,
          sort_order: formData.sort_order,
          author_id: profile.id,
          published_at: formData.status === 'published' ? new Date().toISOString() : null,
        });

      if (insertError) {
        throw insertError;
      }

      router.push('/admin/pages');
    } catch (err) {
      console.error('Error creating page:', err);
      setError(err instanceof Error ? err.message : 'Не вдалося створити сторінку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-500 hover:text-bronze transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО СПИСКУ
        </Link>
        <h1 className="font-syne text-3xl font-bold text-text-100">Нова сторінка</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 flex items-start gap-3 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ОСНОВНА ІНФОРМАЦІЯ</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                Заголовок *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={handleTitleBlur}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                placeholder="Назва сторінки"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                URL Slug *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  {formData.parent_slug && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-500 text-sm">
                      {formData.parent_slug}/
                    </span>
                  )}
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-panel-850 border text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded ${
                      slugError ? 'border-red-500' : 'border-line'
                    } ${formData.parent_slug ? 'pl-[120px]' : ''}`}
                    placeholder="url-slug"
                    required
                  />
                  {isCheckingSlug && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-500">
                      <RefreshCw size={14} className="animate-spin" />
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="px-3 py-2 border border-line text-muted-500 hover:text-bronze hover:border-bronze transition-colors rounded"
                  title="Згенерувати з заголовка"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              {slugError && <p className="text-red-400 text-xs mt-1">{slugError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted-500 mb-2">
                  Батьківська сторінка
                </label>
                <select
                  value={formData.parent_slug}
                  onChange={(e) => setFormData({ ...formData, parent_slug: e.target.value })}
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                >
                  <option value="">Немає (коренева)</option>
                  {parentPages.map((page) => (
                    <option key={page.slug} value={page.slug}>
                      {page.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-500 mb-2">
                  Мітка категорії
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                  placeholder="ХТО МИ, УПРАВЛІННЯ..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                Короткий опис
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded resize-none"
                placeholder="Опис для заголовка сторінки та SEO"
              />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">ЗОБРАЖЕННЯ</p>
          <ImageUploadZone
            value={formData.featured_image_url}
            onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
            label="Зображення сторінки"
            context="other"
          />
        </div>

        {/* Content */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">КОНТЕНТ *</p>
          <BlockEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Почніть писати, або натисніть / для вставки блоку..."
          />
        </div>

        {/* Navigation */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">НАВІГАЦІЯ</p>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_in_nav}
                onChange={(e) => setFormData({ ...formData, show_in_nav: e.target.checked })}
                className="w-5 h-5 rounded border-line bg-panel-850 accent-bronze"
              />
              <span className="text-sm text-text-100">Показувати в головному меню</span>
            </label>

            {formData.show_in_nav && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-500 mb-2">
                    Назва в меню
                  </label>
                  <input
                    type="text"
                    value={formData.nav_label}
                    onChange={(e) => setFormData({ ...formData, nav_label: e.target.value })}
                    className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                    placeholder="Коротка назва"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-500 mb-2">
                    Порядок сортування
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-4">SEO</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                maxLength={70}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                placeholder="SEO заголовок (до 70 символів)"
              />
              <p className="text-xs text-muted-500 mt-1">{formData.meta_title.length}/70</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                maxLength={160}
                rows={2}
                className="w-full px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded resize-none"
                placeholder="SEO опис (до 160 символів)"
              />
              <p className="text-xs text-muted-500 mt-1">{formData.meta_description.length}/160</p>
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="bg-panel-900 border border-line p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-bold text-muted-500 mb-2">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-4 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опублікувати</option>
                <option value="archived">Архів</option>
              </select>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Link
                href="/admin/pages"
                className="flex-1 sm:flex-none px-6 py-2 border border-line text-text-100 text-sm font-bold hover:bg-panel-850 transition-colors text-center rounded"
              >
                СКАСУВАТИ
              </Link>
              <button
                type="submit"
                disabled={loading || !!slugError}
                className="flex-1 sm:flex-none px-6 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {loading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
