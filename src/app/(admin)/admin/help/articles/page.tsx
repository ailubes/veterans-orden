'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Eye, ThumbsUp, Edit, Trash2, Filter, Search } from 'lucide-react';
import type { HelpArticle, HelpCategory } from '@/lib/help/types';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch('/api/help/articles?limit=1000'),
          fetch('/api/help/categories'),
        ]);

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        setArticles(articlesData.articles || []);
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (filterStatus !== 'all' && article.status !== filterStatus) return false;
    if (filterCategory !== 'all' && article.category_id !== filterCategory) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: 'bg-green-600/10 text-green-600 border-green-600',
      draft: 'bg-yellow-600/10 text-yellow-600 border-yellow-600',
      archived: 'bg-gray-600/10 text-gray-600 border-gray-600',
    };

    const labels = {
      published: 'Опубліковано',
      draft: 'Чернетка',
      archived: 'Архів',
    };

    return (
      <span className={`px-2 py-1 text-xs font-bold border ${styles[status as keyof typeof styles] || styles.draft}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getHelpfulRate = (article: any) => {
    const total = (article.helpful_count || 0) + (article.not_helpful_count || 0);
    if (total === 0) return 'N/A';
    return `${Math.round(((article.helpful_count || 0) / total) * 100)}%`;
  };

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
        <div>
          <h1 className="font-syne text-3xl font-bold mb-2">Статті довідки</h1>
          <p className="text-muted-500">
            Всього: {filteredArticles.length} {filteredArticles.length !== articles.length && `з ${articles.length}`}
          </p>
        </div>

        <Link
          href="/admin/help/articles/new"
          className="flex items-center gap-2 px-6 py-3 bg-bronze text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all"
        >
          <Plus size={20} />
          Нова стаття
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-lg p-4 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-bronze" size={20} />
          <p className="font-bold">Фільтри</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук за назвою..."
              className="w-full pl-10 pr-3 py-2 border border-line rounded-lg focus:border-bronze outline-none text-sm"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none font-bold text-sm"
          >
            <option value="all">Всі статуси</option>
            <option value="published">Опубліковано</option>
            <option value="draft">Чернетки</option>
            <option value="archived">Архів</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-line rounded-lg focus:border-bronze outline-none font-bold text-sm"
          >
            <option value="all">Всі категорії</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameUk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-line rounded-lg relative overflow-x-auto">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <table className="w-full">
          <thead className="bg-timber-dark text-canvas">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-sm">Назва</th>
              <th className="px-4 py-3 text-left font-bold text-sm">Категорія</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Статус</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Перегляди</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Корисність</th>
              <th className="px-4 py-3 text-center font-bold text-sm">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-timber-dark/20">
            {filteredArticles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-500">
                  <FileText className="mx-auto mb-2" size={48} />
                  Статті не знайдені
                </td>
              </tr>
            ) : (
              filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-timber-dark/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold line-clamp-1">{article.title}</p>
                      {article.excerpt && (
                        <p className="text-xs text-muted-500 line-clamp-1 mt-1">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-bronze font-bold">
                      {article.category?.name_uk || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(article.status)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye size={14} className="text-muted-500" />
                      <span className="text-sm">{article.view_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsUp size={14} className="text-muted-500" />
                      <span className="text-sm">{getHelpfulRate(article)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/help/articles/${article.id}/edit`}
                        className="p-2 hover:bg-bronze/10 transition-colors"
                        title="Редагувати"
                      >
                        <Edit size={16} className="text-bronze" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (confirm('Ви впевнені, що хочете видалити цю статтю? Цю дію не можна скасувати.')) {
                            try {
                              const response = await fetch(`/api/admin/help/articles/${article.id}`, {
                                method: 'DELETE',
                              });

                              if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.error || 'Failed to delete article');
                              }

                              alert('Статтю успішно видалено');
                              // Reload articles
                              const articlesRes = await fetch('/api/help/articles?limit=1000');
                              const articlesData = await articlesRes.json();
                              setArticles(articlesData.articles || []);
                            } catch (error: any) {
                              console.error('Failed to delete article:', error);
                              alert(`Помилка: ${error.message}`);
                            }
                          }
                        }}
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
    </div>
  );
}
