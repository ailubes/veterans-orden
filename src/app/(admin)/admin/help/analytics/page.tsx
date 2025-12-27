'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  FileText,
  ThumbsUp,
  Eye,
  AlertTriangle,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
    overallHelpfulRate: number | null;
    totalFeedback: number;
  };
  topViewedArticles: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    totalFeedback: number;
    helpfulRate: number | null;
    category: { name_uk: string };
  }>;
  lowPerformingArticles: Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    totalFeedback: number;
    helpfulRate: number | null;
    category: { name_uk: string };
  }>;
  recentFeedback: Array<{
    id: string;
    is_helpful: boolean;
    comment: string;
    created_at: string;
    article: { id: string; title: string; slug: string };
  }>;
  categoryPerformance: Array<{
    id: string;
    name: string;
    slug: string;
    articleCount: number;
    totalViews: number;
    totalFeedback: number;
    helpfulRate: number | null;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
}

export default function HelpAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/help/analytics?days=${days}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-syne font-bold text-3xl mb-8">Аналітика довідкової системи</h1>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-canvas min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-syne font-bold text-3xl">Аналітика довідкової системи</h1>

          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border-2 border-timber-dark bg-white focus:outline-none focus:border-accent"
          >
            <option value={7}>Останні 7 днів</option>
            <option value={30}>Останні 30 днів</option>
            <option value={90}>Останні 90 днів</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Articles */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <FileText className="text-timber-beam mb-2" size={24} />
            <p className="text-sm text-timber-beam uppercase tracking-wider mb-1">
              Всього статей
            </p>
            <p className="font-syne font-bold text-3xl">{data.summary.total}</p>
          </div>

          {/* Published */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <TrendingUp className="text-green-600 mb-2" size={24} />
            <p className="text-sm text-timber-beam uppercase tracking-wider mb-1">
              Опубліковано
            </p>
            <p className="font-syne font-bold text-3xl">{data.summary.published}</p>
          </div>

          {/* Total Views */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <Eye className="text-accent mb-2" size={24} />
            <p className="text-sm text-timber-beam uppercase tracking-wider mb-1">
              Переглядів
            </p>
            <p className="font-syne font-bold text-3xl">{data.summary.totalViews}</p>
          </div>

          {/* Helpful Rate */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <ThumbsUp className="text-green-600 mb-2" size={24} />
            <p className="text-sm text-timber-beam uppercase tracking-wider mb-1">
              Корисність
            </p>
            <p className="font-syne font-bold text-3xl">
              {data.summary.overallHelpfulRate !== null
                ? `${data.summary.overallHelpfulRate.toFixed(0)}%`
                : 'N/A'}
            </p>
          </div>

          {/* Total Feedback */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <MessageSquare className="text-timber-beam mb-2" size={24} />
            <p className="text-sm text-timber-beam uppercase tracking-wider mb-1">
              Відгуків
            </p>
            <p className="font-syne font-bold text-3xl">{data.summary.totalFeedback}</p>
          </div>
        </div>

        {/* Top Viewed Articles */}
        <div className="bg-white border-2 border-timber-dark p-6 mb-8 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-accent" size={24} />
            <h2 className="font-syne font-bold text-xl">Топ-10 найпопулярніших статей</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-timber-dark">
                  <th className="text-left py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Назва
                  </th>
                  <th className="text-left py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Категорія
                  </th>
                  <th className="text-right py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Перегляди
                  </th>
                  <th className="text-right py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Відгуків
                  </th>
                  <th className="text-right py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Корисність
                  </th>
                  <th className="text-right py-3 px-2 font-mono text-xs uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topViewedArticles.map((article, index) => (
                  <tr key={article.id} className="border-b border-timber-dark/20">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-timber-beam">#{index + 1}</span>
                        <span>{article.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-timber-beam">
                      {article.category.name_uk}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {article.view_count}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {article.totalFeedback}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {article.helpfulRate !== null ? (
                        <span
                          className={`font-mono ${
                            article.helpfulRate >= 70
                              ? 'text-green-600'
                              : article.helpfulRate >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {article.helpfulRate.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-timber-beam/50">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/help/${article.slug}`}
                        className="text-accent hover:underline text-sm"
                        target="_blank"
                      >
                        Переглянути
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Low Performing Articles */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h2 className="font-syne font-bold text-xl">Статті з низькою оцінкою</h2>
            </div>

            {data.lowPerformingArticles.length === 0 ? (
              <p className="text-timber-beam/70 text-sm">
                Немає статей з низькою оцінкою корисності
              </p>
            ) : (
              <div className="space-y-3">
                {data.lowPerformingArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-3 border border-timber-dark/20 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/admin/help/articles/${article.id}/edit`}
                        className="font-bold hover:text-accent"
                      >
                        {article.title}
                      </Link>
                      <p className="text-xs text-timber-beam mt-1">
                        {article.category.name_uk} • {article.view_count} переглядів •{' '}
                        {article.totalFeedback} відгуків
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="text-red-600" size={16} />
                      <span className="font-mono font-bold text-red-600">
                        {article.helpfulRate?.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Performance */}
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-accent" size={24} />
              <h2 className="font-syne font-bold text-xl">Популярність категорій</h2>
            </div>

            <div className="space-y-3">
              {data.categoryPerformance.map((category) => (
                <div
                  key={category.id}
                  className="p-3 border border-timber-dark/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/help/${category.slug}`}
                      className="font-bold hover:text-accent"
                      target="_blank"
                    >
                      {category.name}
                    </Link>
                    <span className="text-sm text-timber-beam">
                      {category.articleCount} {category.articleCount === 1 ? 'стаття' : 'статей'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-timber-beam">
                        <Eye size={14} className="inline mr-1" />
                        {category.totalViews}
                      </span>
                      <span className="text-timber-beam">
                        <MessageSquare size={14} className="inline mr-1" />
                        {category.totalFeedback}
                      </span>
                    </div>
                    {category.helpfulRate !== null && (
                      <span
                        className={`font-mono ${
                          category.helpfulRate >= 70
                            ? 'text-green-600'
                            : category.helpfulRate >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {category.helpfulRate.toFixed(0)}% корисні
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white border-2 border-timber-dark p-6 relative">
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />
          <div className="joint joint-bl" />
          <div className="joint joint-br" />

          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-accent" size={24} />
            <h2 className="font-syne font-bold text-xl">Останні коментарі</h2>
          </div>

          {data.recentFeedback.length === 0 ? (
            <p className="text-timber-beam/70 text-sm">Поки що немає коментарів</p>
          ) : (
            <div className="space-y-4">
              {data.recentFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 border border-timber-dark/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/help/${feedback.article.slug}`}
                      className="font-bold hover:text-accent"
                      target="_blank"
                    >
                      {feedback.article.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      {feedback.is_helpful ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <ThumbsUp size={14} />
                          Корисно
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <AlertTriangle size={14} />
                          Не корисно
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-timber-dark mb-2">{feedback.comment}</p>
                  <p className="text-xs text-timber-beam">
                    {new Date(feedback.created_at).toLocaleDateString('uk-UA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
