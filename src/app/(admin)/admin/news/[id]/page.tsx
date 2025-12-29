import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, ArrowLeft, ExternalLink, Calendar, User } from 'lucide-react';

interface NewsDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Get news article data
  const { data: article, error } = await supabase
    .from('news_articles')
    .select('*, author:users(first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (error || !article) {
    notFound();
  }

  // Check edit permissions
  const canEdit =
    adminProfile.role === 'super_admin' ||
    adminProfile.role === 'admin' ||
    (adminProfile.role === 'regional_leader' && article.author_id === adminProfile.id);

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status labels
  const statusLabels: Record<string, string> = {
    draft: 'Чернетка',
    published: 'Опубліковано',
    archived: 'Архів',
  };

  // Category labels
  const categoryLabels: Record<string, string> = {
    announcement: 'Оголошення',
    update: 'Оновлення',
    event_recap: 'Звіт з події',
    press: 'Преса',
    blog: 'Блог',
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/news"
          className="inline-flex items-center gap-2 text-sm font-bold text-timber-beam hover:text-accent transition-colors"
        >
          <ArrowLeft size={16} />
          НАЗАД ДО НОВИН
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-timber-dark text-canvas border-2 border-timber-dark p-6 mb-6 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Article info */}
          <div className="flex-1">
            <h1 className="font-syne text-3xl font-bold mb-3">{article.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-timber-dark/20 text-xs font-bold">
                {categoryLabels[article.category] || article.category}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold ${
                  article.status === 'published'
                    ? 'bg-green-500 text-white'
                    : article.status === 'archived'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {statusLabels[article.status] || article.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-canvas/90">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>
                    Автор: {article.author.first_name} {article.author.last_name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {article.status === 'published' && article.published_at
                    ? `Опубліковано: ${formatDate(article.published_at)}`
                    : `Створено: ${formatDate(article.created_at)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {article.status === 'published' && article.slug && (
              <Link
                href={`/news/${article.slug}`}
                target="_blank"
                className="btn btn-outline-light btn-sm flex items-center gap-2"
              >
                <ExternalLink size={16} />
                ПЕРЕГЛЯНУТИ
              </Link>
            )}
            {canEdit && (
              <Link
                href={`/admin/news/${article.id}/edit`}
                className="btn btn-sm flex items-center gap-2"
              >
                <Edit size={16} />
                РЕДАГУВАТИ
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Content */}
        <div className="lg:col-span-2">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="bg-canvas border-2 border-timber-dark p-4 relative mb-6">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />
              <div className="joint joint-bl" />
              <div className="joint joint-br" />

              <Image
                src={article.featured_image_url}
                alt={article.title}
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-accent/10 border-2 border-accent p-6 relative mb-6">
              <div className="joint joint-tl" />
              <div className="joint joint-tr" />
              <div className="joint joint-bl" />
              <div className="joint joint-br" />

              <p className="font-bold text-lg">{article.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div className="bg-canvas border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-accent mb-4">ЗМІСТ СТАТТІ</p>

            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{article.content}</p>
            </div>
          </div>
        </div>

        {/* Article Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-canvas border-2 border-timber-dark p-6 relative mb-6">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-accent mb-4">ІНФОРМАЦІЯ</p>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-timber-beam mb-1">Статус</p>
                <p className="font-bold">{statusLabels[article.status]}</p>
              </div>

              <div>
                <p className="text-timber-beam mb-1">Категорія</p>
                <p className="font-bold">{categoryLabels[article.category]}</p>
              </div>

              <div>
                <p className="text-timber-beam mb-1">URL</p>
                <p className="font-mono text-xs break-all">
                  /news/{article.slug}
                </p>
              </div>

              <div>
                <p className="text-timber-beam mb-1">Створено</p>
                <p className="font-bold">{formatDate(article.created_at)}</p>
              </div>

              {article.published_at && (
                <div>
                  <p className="text-timber-beam mb-1">Опубліковано</p>
                  <p className="font-bold">{formatDate(article.published_at)}</p>
                </div>
              )}

              {article.updated_at && article.updated_at !== article.created_at && (
                <div>
                  <p className="text-timber-beam mb-1">Оновлено</p>
                  <p className="font-bold">{formatDate(article.updated_at)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-canvas border-2 border-timber-dark p-4 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <p className="label text-accent mb-2">АВТОР</p>
            {article.author ? (
              <>
                <p className="text-sm font-bold">
                  {article.author.first_name} {article.author.last_name}
                </p>
                <p className="text-xs text-timber-beam">{article.author.email}</p>
              </>
            ) : (
              <p className="text-sm text-timber-beam">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
