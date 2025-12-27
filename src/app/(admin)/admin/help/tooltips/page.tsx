'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, MessageSquare, Search, X, Save, ExternalLink } from 'lucide-react';

interface Tooltip {
  id: string;
  pageSlug: string;
  elementId: string;
  content: string;
  articleId: string | null;
  audience: 'all' | 'members' | 'leaders' | 'admins';
  isActive: boolean;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
}

export default function TooltipsPage() {
  const [tooltips, setTooltips] = useState<Tooltip[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPage, setFilterPage] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingTooltip, setEditingTooltip] = useState<Tooltip | null>(null);

  // Form fields
  const [formPageSlug, setFormPageSlug] = useState('');
  const [formElementId, setFormElementId] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formArticleId, setFormArticleId] = useState('');
  const [formAudience, setFormAudience] = useState<'all' | 'members' | 'leaders' | 'admins'>('all');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Common page slugs
  const commonPages = [
    'dashboard',
    'dashboard-votes',
    'dashboard-events',
    'dashboard-tasks',
    'dashboard-referrals',
    'dashboard-points',
    'dashboard-settings',
    'admin-dashboard',
    'admin-members',
    'admin-votes',
    'admin-events',
    'admin-tasks',
    'admin-news',
    'admin-marketplace',
    'admin-settings',
  ];

  // Fetch tooltips
  const fetchTooltips = async () => {
    try {
      let url = '/api/admin/help/tooltips';
      const params = new URLSearchParams();

      if (filterPage) params.append('pageSlug', filterPage);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      const transformedTooltips = (data.tooltips || []).map((t: any) => ({
        id: t.id,
        pageSlug: t.page_slug,
        elementId: t.element_id,
        content: t.content,
        articleId: t.article_id,
        audience: t.audience,
        isActive: t.is_active,
        article: t.article,
      }));

      setTooltips(transformedTooltips);
    } catch (error) {
      console.error('Failed to fetch tooltips:', error);
    }
  };

  // Fetch articles for dropdown
  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/help/articles?limit=1000');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchTooltips(), fetchArticles()]).finally(() => setLoading(false));
  }, [filterPage, filterActive]);

  // Open modal for create
  const openCreateModal = () => {
    setModalMode('create');
    setEditingTooltip(null);
    setFormPageSlug('');
    setFormElementId('');
    setFormContent('');
    setFormArticleId('');
    setFormAudience('all');
    setFormIsActive(true);
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (tooltip: Tooltip) => {
    setModalMode('edit');
    setEditingTooltip(tooltip);
    setFormPageSlug(tooltip.pageSlug);
    setFormElementId(tooltip.elementId);
    setFormContent(tooltip.content);
    setFormArticleId(tooltip.articleId || '');
    setFormAudience(tooltip.audience);
    setFormIsActive(tooltip.isActive);
    setShowModal(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!formPageSlug.trim() || !formElementId.trim() || !formContent.trim()) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }

    setFormSubmitting(true);

    try {
      const url =
        modalMode === 'create'
          ? '/api/admin/help/tooltips'
          : `/api/admin/help/tooltips/${editingTooltip?.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug: formPageSlug,
          elementId: formElementId,
          content: formContent,
          articleId: formArticleId || null,
          audience: formAudience,
          isActive: formIsActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tooltip');
      }

      alert(
        modalMode === 'create'
          ? 'Підказку успішно створено!'
          : 'Підказку успішно оновлено!'
      );
      setShowModal(false);
      await fetchTooltips();
    } catch (error: any) {
      console.error('Failed to save tooltip:', error);
      alert(`Помилка: ${error.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle active status
  const toggleActive = async (tooltip: Tooltip) => {
    try {
      const response = await fetch(`/api/admin/help/tooltips/${tooltip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !tooltip.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tooltip');
      }

      await fetchTooltips();
    } catch (error: any) {
      console.error('Failed to toggle active:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  // Delete tooltip
  const handleDelete = async (tooltip: Tooltip) => {
    if (
      !confirm(
        `Ви впевнені, що хочете видалити підказку для "${tooltip.pageSlug} → ${tooltip.elementId}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/help/tooltips/${tooltip.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tooltip');
      }

      alert('Підказку успішно видалено');
      await fetchTooltips();
    } catch (error: any) {
      console.error('Failed to delete tooltip:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  // Get unique page slugs from tooltips
  const uniquePages = Array.from(new Set(tooltips.map((t) => t.pageSlug))).sort();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-timber-dark border-t-accent"></div>
          <p className="mt-4 text-timber-beam">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold mb-2">Контекстні підказки</h1>
          <p className="text-timber-beam">
            Керуйте підказками що відображаються в інтерфейсі
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all"
        >
          <Plus size={20} />
          Нова підказка
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-timber-dark p-4 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex items-center gap-2 mb-4">
          <Search className="text-accent" size={20} />
          <p className="font-bold">Фільтри</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Page filter */}
          <div>
            <label className="block font-bold mb-2 text-sm">Сторінка</label>
            <select
              value={filterPage}
              onChange={(e) => setFilterPage(e.target.value)}
              className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-bold text-sm"
            >
              <option value="">Всі сторінки</option>
              {uniquePages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          </div>

          {/* Active filter */}
          <div>
            <label className="block font-bold mb-2 text-sm">Статус</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-bold text-sm"
            >
              <option value="all">Всі</option>
              <option value="true">Активні</option>
              <option value="false">Неактивні</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tooltips Table */}
      <div className="bg-white border-2 border-timber-dark relative overflow-x-auto">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <table className="w-full">
          <thead className="bg-timber-dark text-canvas">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-sm">Сторінка</th>
              <th className="px-4 py-3 text-left font-bold text-sm">Елемент ID</th>
              <th className="px-4 py-3 text-left font-bold text-sm">Текст підказки</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Аудиторія</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Статус</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-timber-dark/20">
            {tooltips.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-timber-beam">
                  <MessageSquare className="mx-auto mb-2" size={48} />
                  Підказки не знайдені
                </td>
              </tr>
            ) : (
              tooltips.map((tooltip) => (
                <tr key={tooltip.id} className="hover:bg-timber-dark/5 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-timber-dark/10 px-2 py-1">
                      {tooltip.pageSlug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-accent/10 px-2 py-1 text-accent font-bold">
                      {tooltip.elementId}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm line-clamp-2">{tooltip.content}</p>
                      {tooltip.article && (
                        <a
                          href={`/help/${tooltip.article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
                        >
                          <ExternalLink size={12} />
                          {tooltip.article.title}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-bold px-2 py-1 bg-timber-dark/10">
                      {tooltip.audience === 'all'
                        ? 'ВСІ'
                        : tooltip.audience === 'members'
                        ? 'УЧАСНИКИ'
                        : tooltip.audience === 'leaders'
                        ? 'ЛІДЕРИ'
                        : 'АДМІНИ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {tooltip.isActive ? (
                      <span className="px-2 py-1 text-xs font-bold bg-green-600/10 text-green-600 border border-green-600">
                        АКТИВНА
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-bold bg-gray-600/10 text-gray-600 border border-gray-600">
                        НЕАКТИВНА
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleActive(tooltip)}
                        className="p-2 hover:bg-timber-dark/10 transition-colors"
                        title={tooltip.isActive ? 'Вимкнути' : 'Увімкнути'}
                      >
                        {tooltip.isActive ? (
                          <Eye size={16} className="text-timber-beam" />
                        ) : (
                          <EyeOff size={16} className="text-timber-beam" />
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(tooltip)}
                        className="p-2 hover:bg-accent/10 transition-colors"
                        title="Редагувати"
                      >
                        <Edit size={16} className="text-accent" />
                      </button>

                      <button
                        onClick={() => handleDelete(tooltip)}
                        className="p-2 hover:bg-red-600/10 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-timber-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-timber-dark">
              <h2 className="font-syne text-2xl font-bold">
                {modalMode === 'create' ? 'Нова підказка' : 'Редагувати підказку'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-timber-dark/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Page Slug */}
              <div>
                <label className="block font-bold mb-2">
                  Сторінка (slug) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formPageSlug}
                  onChange={(e) => setFormPageSlug(e.target.value)}
                  placeholder="dashboard-votes"
                  list="common-pages"
                  className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-mono text-sm"
                />
                <datalist id="common-pages">
                  {commonPages.map((page) => (
                    <option key={page} value={page} />
                  ))}
                </datalist>
                <p className="text-xs text-timber-beam mt-1">
                  Ідентифікатор сторінки (напр: dashboard-votes, admin-members)
                </p>
              </div>

              {/* Element ID */}
              <div>
                <label className="block font-bold mb-2">
                  ID елемента <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formElementId}
                  onChange={(e) => setFormElementId(e.target.value)}
                  placeholder="vote-submit-button"
                  className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-mono text-sm"
                />
                <p className="text-xs text-timber-beam mt-1">
                  Унікальний ідентифікатор елемента на сторінці
                </p>
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold mb-2">
                  Текст підказки <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Натисніть цю кнопку щоб підтвердити свій вибір..."
                  className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-timber-beam mt-1">
                  {formContent.length}/500 символів
                </p>
              </div>

              {/* Article Link */}
              <div>
                <label className="block font-bold mb-2">
                  Посилання на статтю (опціонально)
                </label>
                <select
                  value={formArticleId}
                  onChange={(e) => setFormArticleId(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-bold text-sm"
                >
                  <option value="">Без посилання</option>
                  {articles
                    .filter((a) => a.status === 'published')
                    .map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-timber-beam mt-1">
                  Додайте посилання "Дізнатися більше" на статтю
                </p>
              </div>

              {/* Audience */}
              <div>
                <label className="block font-bold mb-2">Аудиторія</label>
                <select
                  value={formAudience}
                  onChange={(e) => setFormAudience(e.target.value as any)}
                  className="w-full px-4 py-2 border-2 border-timber-dark focus:border-accent outline-none font-bold text-sm"
                >
                  <option value="all">Всі користувачі</option>
                  <option value="members">Лише учасники</option>
                  <option value="leaders">Лідери</option>
                  <option value="admins">Адміністратори</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 border-2 border-timber-dark accent-accent"
                  />
                  <span className="font-bold">Активна (відображати зараз)</span>
                </label>
                <p className="text-xs text-timber-beam mt-1 ml-8">
                  Неактивні підказки не відображаються користувачам
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-timber-dark">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border-2 border-timber-dark hover:bg-timber-dark/10 transition-colors font-bold"
              >
                Скасувати
              </button>

              <button
                onClick={handleSubmit}
                disabled={formSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all disabled:opacity-50"
              >
                <Save size={18} />
                {modalMode === 'create' ? 'Створити' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
