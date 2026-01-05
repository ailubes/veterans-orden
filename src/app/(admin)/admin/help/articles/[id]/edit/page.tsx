'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Eye, Save, Send, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { VideoEmbed } from '@/components/help/video-embed';
import type { HelpCategory } from '@/lib/help/types';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [articleId, setArticleId] = useState<string>('');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [audience, setAudience] = useState<'all' | 'members' | 'leaders' | 'admins'>('all');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [relatedArticleIds, setRelatedArticleIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  // Fetch article and dependencies
  useEffect(() => {
    async function fetchData() {
      try {
        const resolvedParams = await params;
        setArticleId(resolvedParams.id);

        const [categoriesRes, articlesRes, articleRes] = await Promise.all([
          fetch('/api/help/categories'),
          fetch('/api/help/articles?limit=1000'),
          fetch(`/api/help/articles/${resolvedParams.id}`),
        ]);

        const categoriesData = await categoriesRes.json();
        const articlesData = await articlesRes.json();
        const articleData = await articleRes.json();

        if (!articleData.article) {
          alert('Статтю не знайдено');
          router.push('/admin/help/articles');
          return;
        }

        const article = articleData.article;

        // Populate form fields
        setTitle(article.title);
        setSlug(article.slug);
        setCategoryId(article.category_id);
        setContent(article.content);
        setExcerpt(article.excerpt || '');
        setVideoUrl(article.video_url || '');
        setKeywords(article.keywords || []);
        setAudience(article.audience || 'all');
        setMetaTitle(article.meta_title || '');
        setMetaDescription(article.meta_description || '');
        setRelatedArticleIds(article.related_article_ids || []);
        setStatus(article.status);

        setCategories(categoriesData.categories || []);
        setArticles(articlesData.articles || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        alert('Помилка при завантаженні статті');
        router.push('/admin/help/articles');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params, router]);

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Keyword management
  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  // Form submission
  const handleSubmit = async (newStatus?: 'draft' | 'published' | 'archived') => {
    // Validation
    if (!title.trim()) {
      alert('Будь ласка, введіть назву статті');
      return;
    }

    if (!slug.trim()) {
      alert('Будь ласка, введіть URL-слаг');
      return;
    }

    if (!categoryId) {
      alert('Будь ласка, оберіть категорію');
      return;
    }

    if (!content.trim() || content.trim() === '<p></p>') {
      alert('Будь ласка, додайте вміст статті');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/help/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          categoryId,
          content,
          excerpt,
          videoUrl: videoUrl || null,
          keywords,
          audience,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          relatedArticleIds,
          status: newStatus || status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update article');
      }

      setStatus(newStatus || status);
      alert('Статтю успішно оновлено!');
    } catch (error: any) {
      console.error('Failed to update article:', error);
      alert(`Помилка: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete article
  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цю статтю? Цю дію не можна скасувати.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/help/articles/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete article');
      }

      alert('Статтю успішно видалено');
      router.push('/admin/help/articles');
    } catch (error: any) {
      console.error('Failed to delete article:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  // Get flat category list for dropdown
  type FlatCategory = HelpCategory & { depth: number };
  const flatCategories: FlatCategory[] = [];
  const flattenCategories = (cats: HelpCategory[], depth = 0) => {
    cats.forEach((cat) => {
      flatCategories.push({ ...cat, depth });
      if (cat.subcategories && cat.subcategories.length > 0) {
        flattenCategories(cat.subcategories, depth + 1);
      }
    });
  };
  flattenCategories(categories);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line border-t-accent"></div>
          <p className="mt-4 text-muted-500">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/help/articles"
            className="p-2 hover:bg-timber-dark/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-syne text-3xl font-bold">Редагувати статтю</h1>
            <p className="text-muted-500">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-line rounded-lg hover:bg-timber-dark/10 transition-colors font-bold"
          >
            <Eye size={18} />
            {showPreview ? 'Редагувати' : 'Попередній перегляд'}
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 hover:bg-red-600/10 transition-colors font-bold"
          >
            <Trash2 size={18} />
            Видалити
          </button>

          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 border border-line rounded-lg hover:bg-timber-dark/10 transition-colors font-bold disabled:opacity-50"
          >
            <Save size={18} />
            Зберегти зміни
          </button>

          {status !== 'published' && (
            <button
              onClick={() => handleSubmit('published')}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-bronze text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all disabled:opacity-50"
            >
              <Send size={18} />
              Опублікувати
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-block px-4 py-2 text-sm font-bold border-2 ${
            status === 'published'
              ? 'bg-green-600/10 text-green-600 border-green-600'
              : status === 'archived'
              ? 'bg-gray-600/10 text-gray-600 border-gray-600'
              : 'bg-yellow-600/10 text-yellow-600 border-yellow-600'
          }`}
        >
          {status === 'published' ? 'ОПУБЛІКОВАНО' : status === 'archived' ? 'АРХІВ' : 'ЧЕРНЕТКА'}
        </span>

        {status === 'published' && (
          <button
            onClick={() => handleSubmit('archived')}
            className="ml-3 text-sm font-bold text-muted-500 hover:text-timber-dark"
          >
            → Перемістити в архів
          </button>
        )}
        {status === 'archived' && (
          <button
            onClick={() => handleSubmit('published')}
            className="ml-3 text-sm font-bold text-bronze hover:text-timber-dark"
          >
            → Відновити до опублікованого
          </button>
        )}
      </div>

      {/* Preview Mode */}
      {showPreview ? (
        <div className="bg-white border border-line rounded-lg p-8 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <span className="text-xs font-bold text-bronze uppercase tracking-wider">
                {categories.find((c) => c.id === categoryId)?.nameUk || 'Категорія не обрана'}
              </span>
            </div>

            <h1 className="font-syne text-4xl font-bold mb-4">{title || 'Назва статті'}</h1>

            {excerpt && <p className="text-lg text-muted-500 mb-8">{excerpt}</p>}

            {videoUrl && (
              <div className="mb-8">
                <VideoEmbed url={videoUrl} />
              </div>
            )}

            <div
              className="article-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      ) : (
        /* Editor Mode - Same as new page */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />

              <h2 className="font-syne text-xl font-bold mb-4">Основна інформація</h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-bold mb-2">
                    Назва статті <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Напр: Як проголосувати у голосуванні"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none"
                    maxLength={255}
                  />
                  <p className="text-xs text-muted-500 mt-1">{title.length}/255 символів</p>
                </div>

                {/* Slug */}
                <div>
                  <label className="block font-bold mb-2">
                    URL-слаг <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="yak-progolosuvaty-u-golosuvanni"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-500 mt-1">
                    Буде доступно за адресою: /help/категорія/{slug || 'slug'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold mb-2">
                    Категорія <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-bold"
                  >
                    <option value="">Оберіть категорію...</option>
                    {flatCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.depth || 0)}
                        {cat.nameUk}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block font-bold mb-2">Короткий опис</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Короткий опис статті (2-3 речення)"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-500 mt-1">{excerpt.length}/500 символів</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />

              <h2 className="font-syne text-xl font-bold mb-4">
                Вміст статті <span className="text-red-600">*</span>
              </h2>

              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Напишіть вміст статті тут..."
                minHeight="500px"
                maxLength={50000}
              />
            </div>

            {/* Video */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />

              <h2 className="font-syne text-xl font-bold mb-4">Відео (опціонально)</h2>

              <div>
                <label className="block font-bold mb-2">URL YouTube</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-mono text-sm"
                />
                <p className="text-xs text-muted-500 mt-1">Вставте посилання на YouTube відео</p>

                {videoUrl && (
                  <div className="mt-4">
                    <p className="font-bold mb-2 text-sm">Попередній перегляд:</p>
                    <VideoEmbed url={videoUrl} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Audience */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-br" />

              <h2 className="font-syne text-lg font-bold mb-4">Аудиторія</h2>

              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as 'all' | 'members' | 'leaders' | 'admins')}
                className="w-full px-4 py-2 border border-line rounded-lg focus:border-bronze outline-none font-bold text-sm"
              >
                <option value="all">Всі користувачі</option>
                <option value="members">Лише учасники</option>
                <option value="leaders">Лідери</option>
                <option value="admins">Адміністратори</option>
              </select>
            </div>

            {/* Keywords */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-br" />

              <h2 className="font-syne text-lg font-bold mb-4">Ключові слова</h2>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  placeholder="Додати слово..."
                  className="flex-1 px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm"
                />
                <button
                  onClick={addKeyword}
                  className="p-2 bg-bronze text-canvas hover:shadow-[2px_2px_0px_0px_rgba(44,40,36,1)] transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="flex items-center gap-1 px-3 py-1 bg-timber-dark/10 border border-line text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-br" />

              <h2 className="font-syne text-lg font-bold mb-4">Пов'язані статті</h2>

              <select
                multiple
                value={relatedArticleIds}
                onChange={(e) =>
                  setRelatedArticleIds(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                className="w-full px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm h-40"
              >
                {articles
                  .filter((a) => a.status === 'published' && a.id !== articleId)
                  .map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.title}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-muted-500 mt-2">
                Утримуйте Ctrl/Cmd для вибору кількох статей
              </p>
            </div>

            {/* SEO */}
            <div className="bg-white border border-line rounded-lg p-6 relative">
              <div className="joint joint-tl" />
              <div className="joint joint-br" />

              <h2 className="font-syne text-lg font-bold mb-4">SEO</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2 text-sm">Meta заголовок</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || 'Автоматично з назви'}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm"
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-500 mt-1">{metaTitle.length}/70</p>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">Meta опис</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={excerpt || 'Автоматично з опису'}
                    className="w-full px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm resize-none"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-500 mt-1">{metaDescription.length}/160</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
