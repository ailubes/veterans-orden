'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Folder, MessageSquare, TrendingUp, Eye, ThumbsUp, Plus } from 'lucide-react';

interface HelpStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalViews: number;
  averageHelpfulRate: number;
}

export default function AdminHelpPage() {
  const [stats, setStats] = useState<HelpStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // For now, let's fetch basic counts directly
        // In Phase 4, we'll create a proper analytics API
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch('/api/help/articles?limit=1000'),
          fetch('/api/help/categories'),
        ]);

        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        const articles = articlesData.articles || [];
        const published = articles.filter((a: any) => a.status === 'published');
        const drafts = articles.filter((a: any) => a.status === 'draft');

        const totalViews = articles.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0);
        const articlesWithFeedback = articles.filter(
          (a: any) => (a.helpful_count || 0) + (a.not_helpful_count || 0) > 0
        );
        const avgHelpful = articlesWithFeedback.length > 0
          ? articlesWithFeedback.reduce((sum: number, a: any) => {
              const total = (a.helpful_count || 0) + (a.not_helpful_count || 0);
              return sum + ((a.helpful_count || 0) / total);
            }, 0) / articlesWithFeedback.length
          : 0;

        setStats({
          totalArticles: articles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalCategories: categoriesData.categories?.length || 0,
          totalViews,
          averageHelpfulRate: avgHelpful * 100,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
      <div className="mb-8">
        <h1 className="font-syne text-3xl font-bold mb-2">Управління довідкою</h1>
        <p className="text-timber-beam">
          Керуйте статтями допомоги, категоріями та підказками
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <div className="flex items-start justify-between mb-4">
              <FileText className="text-accent" size={32} />
              <span className="text-xs font-bold text-timber-beam">СТАТТІ</span>
            </div>
            <p className="font-syne text-4xl font-bold mb-2">{stats.totalArticles}</p>
            <p className="text-sm text-timber-beam">
              {stats.publishedArticles} опубліковано, {stats.draftArticles} чернеток
            </p>
          </div>

          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <div className="flex items-start justify-between mb-4">
              <Folder className="text-accent" size={32} />
              <span className="text-xs font-bold text-timber-beam">КАТЕГОРІЇ</span>
            </div>
            <p className="font-syne text-4xl font-bold mb-2">{stats.totalCategories}</p>
            <p className="text-sm text-timber-beam">Активних категорій</p>
          </div>

          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <div className="flex items-start justify-between mb-4">
              <Eye className="text-accent" size={32} />
              <span className="text-xs font-bold text-timber-beam">ПЕРЕГЛЯДИ</span>
            </div>
            <p className="font-syne text-4xl font-bold mb-2">{stats.totalViews.toLocaleString()}</p>
            <p className="text-sm text-timber-beam">Всього переглядів</p>
          </div>

          <div className="bg-white border-2 border-timber-dark p-6 relative">
            <div className="joint" style={{ top: '-3px', left: '-3px' }} />
            <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

            <div className="flex items-start justify-between mb-4">
              <ThumbsUp className="text-accent" size={32} />
              <span className="text-xs font-bold text-timber-beam">КОРИСНІСТЬ</span>
            </div>
            <p className="font-syne text-4xl font-bold mb-2">
              {stats.averageHelpfulRate > 0 ? `${stats.averageHelpfulRate.toFixed(0)}%` : 'N/A'}
            </p>
            <p className="text-sm text-timber-beam">Середня оцінка корисності</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/help/articles/new"
          className="bg-accent text-canvas border-2 border-timber-dark p-8 hover:shadow-[8px_8px_0px_0px_rgba(44,40,36,1)] transition-all group relative"
        >
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ top: '-3px', right: '-3px' }} />

          <div className="flex items-center gap-4">
            <div className="p-4 bg-canvas/20">
              <Plus size={32} className="text-canvas" />
            </div>
            <div>
              <h2 className="font-syne text-2xl font-bold mb-1">Нова стаття</h2>
              <p className="text-canvas/80">Створити статтю довідки</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/help/categories"
          className="bg-white border-2 border-timber-dark p-8 hover:border-accent transition-colors group relative"
        >
          <div className="joint" style={{ top: '-3px', left: '-3px' }} />
          <div className="joint" style={{ bottom: '-3px', right: '-3px' }} />

          <div className="flex items-center gap-4">
            <div className="p-4 bg-timber-dark/10 group-hover:bg-accent/10 transition-colors">
              <Folder size={32} className="text-timber-dark group-hover:text-accent transition-colors" />
            </div>
            <div>
              <h2 className="font-syne text-2xl font-bold mb-1 group-hover:text-accent transition-colors">
                Категорії
              </h2>
              <p className="text-timber-beam">Керування категоріями</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Management Links */}
      <div className="bg-white border-2 border-timber-dark relative">
        <div className="joint" style={{ top: '-3px', left: '-3px' }} />
        <div className="joint" style={{ top: '-3px', right: '-3px' }} />

        <div className="p-6 border-b-2 border-timber-dark/20">
          <h2 className="font-syne text-xl font-bold">Управління контентом</h2>
        </div>

        <div className="divide-y-2 divide-timber-dark/20">
          <Link
            href="/admin/help/articles"
            className="block p-6 hover:bg-timber-dark/5 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="text-accent" size={24} />
                <div>
                  <h3 className="font-bold group-hover:text-accent transition-colors">
                    Всі статті
                  </h3>
                  <p className="text-sm text-timber-beam">
                    Переглянути та редагувати всі статті довідки
                  </p>
                </div>
              </div>
              <span className="text-accent font-bold">→</span>
            </div>
          </Link>

          <Link
            href="/admin/help/tooltips"
            className="block p-6 hover:bg-timber-dark/5 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageSquare className="text-accent" size={24} />
                <div>
                  <h3 className="font-bold group-hover:text-accent transition-colors">
                    Підказки
                  </h3>
                  <p className="text-sm text-timber-beam">
                    Контекстні підказки для інтерфейсу
                  </p>
                </div>
              </div>
              <span className="text-accent font-bold">→</span>
            </div>
          </Link>

          <Link
            href="/admin/help/analytics"
            className="block p-6 hover:bg-timber-dark/5 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="text-accent" size={24} />
                <div>
                  <h3 className="font-bold group-hover:text-accent transition-colors">
                    Аналітика
                  </h3>
                  <p className="text-sm text-timber-beam">
                    Статистика використання та ефективності
                  </p>
                </div>
              </div>
              <span className="text-accent font-bold">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
