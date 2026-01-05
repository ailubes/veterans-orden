'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket, Zap, HelpCircle, Shield, Video, Settings, TrendingUp, Clock, Target, Award, Coins, Trophy } from 'lucide-react';
import type { HelpCategory, HelpArticle } from '@/lib/help/types';

export default function HelpHomePage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [popularArticles, setPopularArticles] = useState<HelpArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/help/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);

        // Fetch popular articles (sorted by views)
        const popularRes = await fetch('/api/help/articles?limit=6');
        const popularData = await popularRes.json();
        setPopularArticles(popularData.articles || []);

        // Fetch recent articles
        const recentRes = await fetch('/api/help/articles?limit=6');
        const recentData = await recentRes.json();
        setRecentArticles(recentData.articles || []);
      } catch (error) {
        console.error('Failed to fetch help data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getCategoryIcon = (iconName: string | null) => {
    const icons: Record<string, any> = {
      Rocket,
      Zap,
      HelpCircle,
      Shield,
      Video,
      Settings,
      Target,
      Award,
      Coins,
      Trophy,
    };
    return icons[iconName || ''] || HelpCircle;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line border-t-accent"></div>
        <p className="mt-4 text-muted-500">Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-white to-accent/5 border border-line rounded-lg p-8 relative overflow-hidden">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />
        <div className="joint joint-bl" />
        <div className="joint joint-br" />

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bronze/5 rounded-full blur-3xl -z-10" />

        <h2 className="font-syne text-3xl font-bold mb-4 text-timber-dark">
          Ласкаво просимо до Центру допомоги!
        </h2>
        <p className="text-lg text-muted-500 mb-6">
          Тут ви знайдете всю необхідну інформацію про роботу з платформою Мережа Вільних Людей.
          Оберіть категорію нижче або скористайтесь пошуком для швидкого доступу до статей.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-line/20">
          <div className="flex items-start gap-3 p-4 bg-white/80 border border-line/20 rounded hover:border-bronze/50 hover:shadow-md transition-all">
            <div className="p-3 bg-bronze/20 rounded">
              <Rocket className="text-bronze" size={24} />
            </div>
            <div>
              <p className="font-bold text-timber-dark">Швидкий старт</p>
              <p className="text-sm text-muted-500">Перші кроки на платформі</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white/80 border border-line/20 rounded hover:border-bronze/50 hover:shadow-md transition-all">
            <div className="p-3 bg-bronze/20 rounded">
              <Zap className="text-bronze" size={24} />
            </div>
            <div>
              <p className="font-bold text-timber-dark">Функції</p>
              <p className="text-sm text-muted-500">Детальні інструкції</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white/80 border border-line/20 rounded hover:border-bronze/50 hover:shadow-md transition-all">
            <div className="p-3 bg-bronze/20 rounded">
              <HelpCircle className="text-bronze" size={24} />
            </div>
            <div>
              <p className="font-bold text-timber-dark">FAQ</p>
              <p className="text-sm text-muted-500">Відповіді на питання</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <section>
        <h2 className="font-syne text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-bronze"></div>
          Категорії
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);

            return (
              <Link
                key={category.id}
                href={`/help/${category.slug}`}
                className="bg-white border border-line rounded-lg p-6 hover:border-bronze hover:shadow-[4px_4px_0px_0px_rgba(212,93,58,0.3)] transition-all group relative"
              >
                <div className="joint joint-tl" />
                <div className="joint joint-tr" />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bronze/10 group-hover:bg-bronze/20 border border-bronze/30 rounded transition-all">
                    <Icon className="text-bronze transition-transform group-hover:scale-110" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-syne text-lg font-bold mb-2 group-hover:text-bronze transition-colors">
                      {category.nameUk}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-500 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <section>
          <h2 className="font-syne text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="text-bronze" size={28} />
            Популярні статті
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.slice(0, 6).map((article: any) => (
              <Link
                key={article.id}
                href={`/help/${article.category?.slug}/${article.slug}`}
                className="bg-white border border-line rounded-lg p-6 hover:border-bronze hover:shadow-[4px_4px_0px_0px_rgba(212,93,58,0.2)] transition-all group relative"
              >
                <div className="joint joint-tl" />
                <div className="joint joint-br" />

                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-bronze bg-bronze/10 px-2 py-1 rounded">
                    {article.category?.name_uk}
                  </span>
                  <span className="text-xs text-muted-500 flex items-center gap-1">
                    <TrendingUp size={14} className="text-bronze" />
                    {article.view_count || 0}
                  </span>
                </div>

                <h3 className="font-syne text-lg font-bold mb-2 group-hover:text-bronze transition-colors">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-sm text-muted-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section>
          <h2 className="font-syne text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="text-bronze" size={28} />
            Нові статті
          </h2>

          <div className="bg-white border border-line rounded-lg relative">
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />

            <div className="divide-y-2 divide-timber-dark/20">
              {recentArticles.slice(0, 5).map((article: any) => (
                <Link
                  key={article.id}
                  href={`/help/${article.category?.slug}/${article.slug}`}
                  className="block p-4 hover:bg-bronze/5 hover:border-l-4 hover:border-l-accent transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1 group-hover:text-bronze transition-colors flex items-center gap-2">
                        {article.title}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-bronze">→</span>
                      </h3>
                      <p className="text-xs font-bold text-bronze bg-bronze/10 px-2 py-0.5 rounded inline-block">
                        {article.category?.name_uk}
                      </p>
                    </div>
                    <span className="text-xs text-muted-500 whitespace-nowrap flex items-center gap-1">
                      <Clock size={12} className="text-bronze" />
                      {new Date(article.created_at).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
