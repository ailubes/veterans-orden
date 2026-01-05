import { createClient } from '@/lib/supabase/server';
import { Plus, FileText, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function AdminNewsPage() {
  const supabase = await createClient();

  // Fetch all news articles
  const { data: articles } = await supabase
    .from('news_articles')
    .select('*, author:users(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-blue-100 text-blue-600',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    archived: 'Архів',
  };

  const categoryLabels: Record<string, string> = {
    announcement: 'Оголошення',
    update: 'Оновлення',
    event_recap: 'Звіт з події',
    press: 'Преса',
    blog: 'Блог',
  };

  const publishedCount = articles?.filter((a) => a.status === 'published').length || 0;
  const draftCount = articles?.filter((a) => a.status === 'draft').length || 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold">Новини</h1>
        </div>
        <Link
          href="/admin/news/new"
          className="btn flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          СТВОРИТИ СТАТТЮ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold">{articles?.length || 0}</p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ОПУБЛІКОВАНО</p>
          <p className="font-syne text-3xl font-bold text-green-600">
            {publishedCount}
          </p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ЧЕРНЕТКИ</p>
          <p className="font-syne text-3xl font-bold text-gray-500">
            {draftCount}
          </p>
        </div>
        <div className="bg-panel-900 border border-line rounded-lg p-4">
          <p className="label mb-1">ОСТАННЯ ПУБЛІКАЦІЯ</p>
          <p className="font-syne text-lg font-bold">
            {articles?.find((a) => a.status === 'published')
              ? formatDate(articles.find((a) => a.status === 'published')!.published_at || articles.find((a) => a.status === 'published')!.created_at)
              : '—'}
          </p>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-panel-900 border border-line rounded-lg relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        {articles && articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-line">
                <tr>
                  <th className="text-left p-4 font-bold text-xs">ЗАГОЛОВОК</th>
                  <th className="text-left p-4 font-bold text-xs">КАТЕГОРІЯ</th>
                  <th className="text-left p-4 font-bold text-xs">СТАТУС</th>
                  <th className="text-left p-4 font-bold text-xs">АВТОР</th>
                  <th className="text-left p-4 font-bold text-xs">ДАТА</th>
                  <th className="text-left p-4 font-bold text-xs">ДІЇ</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-line/20 hover:bg-timber-dark/5">
                    <td className="p-4">
                      <div className="font-bold">{article.title}</div>
                      <div className="text-xs text-muted-500 line-clamp-1">
                        {article.excerpt || article.content?.substring(0, 100)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-timber-dark/10 text-xs">
                        {categoryLabels[article.category as keyof typeof categoryLabels] || article.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold ${
                          statusColors[article.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[article.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td className="p-4">
                      {article.author ? (
                        <span className="text-sm">
                          {article.author.first_name} {article.author.last_name?.charAt(0)}.
                        </span>
                      ) : (
                        <span className="text-sm text-muted-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm">
                        {formatDate(article.published_at || article.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {article.status === 'published' && article.slug && (
                          <Link
                            href={`/news/${article.slug}`}
                            className="p-2 hover:bg-timber-dark/10 rounded"
                            title="Переглянути на сайті"
                            target="_blank"
                          >
                            <ExternalLink size={16} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/news/${article.id}`}
                          className="p-2 hover:bg-timber-dark/10 rounded"
                          title="Переглянути"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/news/${article.id}/edit`}
                          className="p-2 hover:bg-timber-dark/10 rounded"
                          title="Редагувати"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          className="p-2 hover:bg-red-50 rounded text-red-500"
                          title="Видалити"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-500" />
            <h3 className="font-syne text-xl font-bold mb-2">Немає новин</h3>
            <p className="text-sm text-muted-500 mb-6">
              Створіть першу новину для членів Мережі
            </p>
            <Link href="/admin/news/new" className="btn">
              СТВОРИТИ СТАТТЮ →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
