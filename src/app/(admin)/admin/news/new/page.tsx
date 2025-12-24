'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'update',
    status: 'draft',
    featured_image_url: '',
  });

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
    setError('');
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
        .eq('clerk_id', user.id)
        .single();

      if (!profile) {
        setError('Профіль не знайдено');
        return;
      }

      const { error: insertError } = await supabase.from('news_articles').insert({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        featured_image_url: formData.featured_image_url || null,
        author_id: profile.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      });

      if (insertError) throw insertError;

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
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4"
        >
          <ArrowLeft size={16} />
          Назад до новин
        </Link>
        <h1 className="font-syne text-3xl font-bold">Нова стаття</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-canvas border-2 border-timber-dark p-6 relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <div className="space-y-4">
            <div>
              <label className="label block mb-2">ЗАГОЛОВОК *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                placeholder="Заголовок статті"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">URL (SLUG)</label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-timber-dark/10 border-2 border-r-0 border-timber-dark text-sm text-timber-beam">
                  /news/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="flex-1 px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div>
              <label className="label block mb-2">КОРОТКИЙ ОПИС</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[80px]"
                placeholder="Короткий опис для превью (необов'язково)"
              />
            </div>

            <div>
              <label className="label block mb-2">КОНТЕНТ *</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none min-h-[300px]"
                placeholder="Текст статті... (підтримується Markdown)"
                required
              />
            </div>

            <div>
              <label className="label block mb-2">ЗОБРАЖЕННЯ (URL)</label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label block mb-2">КАТЕГОРІЯ *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
                <label className="label block mb-2">СТАТУС *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
                  required
                >
                  <option value="draft">Чернетка</option>
                  <option value="published">Опублікувати зараз</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'ЗБЕРЕЖЕННЯ...' : formData.status === 'published' ? 'ОПУБЛІКУВАТИ →' : 'ЗБЕРЕГТИ ЧЕРНЕТКУ →'}
          </button>
          <Link
            href="/admin/news"
            className="text-sm text-timber-beam hover:text-accent"
          >
            Скасувати
          </Link>
        </div>
      </form>
    </div>
  );
}
