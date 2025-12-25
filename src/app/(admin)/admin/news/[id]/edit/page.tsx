'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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

  const loadData = async () => {
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
        .select('role, id')
        .eq('clerk_id', user.id)
        .single();

      if (!adminProfile || !['admin', 'super_admin', 'regional_leader'].includes(adminProfile.role)) {
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
        (adminProfile.role === 'regional_leader' && article.author_id === adminProfile.id);

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

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/admin/news/${newsId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <p className="label text-accent mb-2">РЕДАГУВАННЯ СТАТТІ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Редагувати статтю
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <p className="font-bold">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="label mb-2 block">ЗАГОЛОВОК *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="label mb-2 block">URL (SLUG) *</label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-timber-dark/10 border-2 border-r-0 border-timber-dark text-sm text-timber-beam">
                  /news/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="label mb-2 block">КОРОТКИЙ ОПИС</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[80px]"
                placeholder="Короткий опис для анонсів та превʼю..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="label mb-2 block">ЗМІСТ СТАТТІ *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[300px]"
                required
              />
            </div>

            {/* Row: Category + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label mb-2 block">КАТЕГОРІЯ *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="announcement">Оголошення</option>
                  <option value="update">Оновлення</option>
                  <option value="event_recap">Звіт з події</option>
                  <option value="press">Преса</option>
                  <option value="blog">Блог</option>
                </select>
              </div>

              <div>
                <label className="label mb-2 block">СТАТУС *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="draft">Чернетка</option>
                  <option value="published">Опубліковано</option>
                  <option value="archived">Архів</option>
                </select>
              </div>
            </div>

            {/* Featured Image URL */}
            <div>
              <label className="label mb-2 block">URL ГОЛОВНОГО ЗОБРАЖЕННЯ</label>
              <input
                type="url"
                value={formData.featured_image_url}
                onChange={(e) =>
                  setFormData({ ...formData, featured_image_url: e.target.value })
                }
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ'}
          </button>
          <Link href={`/admin/news/${newsId}`} className="btn btn-outline">
            СКАСУВАТИ
          </Link>
        </div>
      </form>
    </div>
  );
}
