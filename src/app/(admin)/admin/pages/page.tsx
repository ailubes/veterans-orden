import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Edit2, Trash2, Eye, ExternalLink, GripVertical } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminPagesPage() {
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Fetch all pages ordered by sort_order
  const { data: pages } = await supabase
    .from('pages')
    .select('*, author:users!pages_author_id_fkey(first_name, last_name)')
    .order('sort_order', { ascending: true });

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400',
    published: 'bg-green-500/10 text-green-400',
    archived: 'bg-blue-500/10 text-blue-400',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    archived: 'Архів',
  };

  const publishedCount = pages?.filter((p) => p.status === 'published').length || 0;
  const draftCount = pages?.filter((p) => p.status === 'draft').length || 0;

  // Group pages by parent for hierarchical display
  const rootPages = pages?.filter(p => !p.parent_slug) || [];
  const childPages = pages?.filter(p => p.parent_slug) || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="mono text-bronze text-xs tracking-widest mb-2">// КОНТЕНТ</p>
          <h1 className="font-syne text-3xl lg:text-4xl font-bold text-text-100">
            Сторінки
          </h1>
        </div>
        <Link
          href="/admin/pages/new"
          className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors flex items-center justify-center gap-2 rounded"
        >
          <Plus size={18} />
          НОВА СТОРІНКА
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-panel-900 border border-line p-4 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-1">ВСЬОГО</p>
          <p className="font-syne text-3xl font-bold text-text-100">{pages?.length || 0}</p>
        </div>
        <div className="bg-panel-900 border border-line p-4 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-1">ОПУБЛІКОВАНО</p>
          <p className="font-syne text-3xl font-bold text-green-400">
            {publishedCount}
          </p>
        </div>
        <div className="bg-panel-900 border border-line p-4 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-1">ЧЕРНЕТКИ</p>
          <p className="font-syne text-3xl font-bold text-yellow-400">
            {draftCount}
          </p>
        </div>
        <div className="bg-panel-900 border border-line p-4 rounded-lg">
          <p className="mono text-bronze text-xs tracking-widest mb-1">В МЕНЮ</p>
          <p className="font-syne text-3xl font-bold text-text-100">
            {pages?.filter(p => p.show_in_nav).length || 0}
          </p>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-panel-900 border border-line rounded-lg overflow-hidden">
        {pages && pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-panel-850">
                <tr>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">СТОРІНКА</th>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">URL</th>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">СТАТУС</th>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">МІТКА</th>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">ОНОВЛЕНО</th>
                  <th className="text-left p-4 mono text-bronze text-xs tracking-widest">ДІЇ</th>
                </tr>
              </thead>
              <tbody>
                {rootPages.map((page) => (
                  <>
                    <tr key={page.id} className="border-b border-line/20 hover:bg-panel-850">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-muted-500" />
                          <div>
                            <div className="font-bold text-text-100">{page.title}</div>
                            {page.description && (
                              <div className="text-xs text-muted-500 line-clamp-1 max-w-[300px]">
                                {page.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-sm text-bronze font-mono">/{page.slug}</code>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${statusColors[page.status]}`}>
                          {statusLabels[page.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        {page.label && (
                          <span className="px-2 py-1 bg-panel-850 text-text-200 text-xs rounded">
                            {page.label}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm text-muted-500">
                          {formatDate(page.updated_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {page.status === 'published' && (
                            <Link
                              href={`/${page.slug}`}
                              className="p-2 hover:bg-panel-850 rounded text-muted-500 hover:text-bronze transition-colors"
                              title="Переглянути на сайті"
                              target="_blank"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          <Link
                            href={`/admin/pages/${page.id}/edit`}
                            className="p-2 hover:bg-panel-850 rounded text-muted-500 hover:text-bronze transition-colors"
                            title="Редагувати"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            className="p-2 hover:bg-red-500/10 rounded text-muted-500 hover:text-red-400 transition-colors"
                            title="Видалити"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Child pages */}
                    {childPages
                      .filter(child => child.parent_slug === page.slug)
                      .map(child => (
                        <tr key={child.id} className="border-b border-line/20 hover:bg-panel-850 bg-panel-850/30">
                          <td className="p-4 pl-12">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-500">└</span>
                              <div>
                                <div className="font-bold text-text-100">{child.title}</div>
                                {child.description && (
                                  <div className="text-xs text-muted-500 line-clamp-1 max-w-[280px]">
                                    {child.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <code className="text-sm text-bronze font-mono">/{child.slug}</code>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${statusColors[child.status]}`}>
                              {statusLabels[child.status]}
                            </span>
                          </td>
                          <td className="p-4">
                            {child.label && (
                              <span className="px-2 py-1 bg-panel-850 text-text-200 text-xs rounded">
                                {child.label}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-mono text-sm text-muted-500">
                              {formatDate(child.updated_at)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              {child.status === 'published' && (
                                <Link
                                  href={`/${child.slug}`}
                                  className="p-2 hover:bg-panel-850 rounded text-muted-500 hover:text-bronze transition-colors"
                                  title="Переглянути на сайті"
                                  target="_blank"
                                >
                                  <ExternalLink size={16} />
                                </Link>
                              )}
                              <Link
                                href={`/admin/pages/${child.id}/edit`}
                                className="p-2 hover:bg-panel-850 rounded text-muted-500 hover:text-bronze transition-colors"
                                title="Редагувати"
                              >
                                <Edit2 size={16} />
                              </Link>
                              <button
                                className="p-2 hover:bg-red-500/10 rounded text-muted-500 hover:text-red-400 transition-colors"
                                title="Видалити"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-500" />
            <h3 className="font-syne text-xl font-bold mb-2 text-text-100">Немає сторінок</h3>
            <p className="text-sm text-muted-500 mb-6">
              Створіть першу сторінку для вашого сайту
            </p>
            <Link href="/admin/pages/new" className="px-4 py-2 bg-bronze text-bg-950 text-sm font-bold hover:bg-bronze/90 transition-colors rounded inline-block">
              СТВОРИТИ СТОРІНКУ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
