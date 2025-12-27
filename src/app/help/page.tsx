'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Rocket, Zap, HelpCircle, Shield, Video, Settings, TrendingUp, Clock } from 'lucide-react';
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
    };
    return icons[iconName || ''] || HelpCircle;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-timber-dark border-t-accent"></div>
        <p className="mt-4 text-timber-beam">Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="bg-white border-2 border-timber-dark p-8 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
        <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

        <h2 className="font-syne text-3xl font-bold mb-4">
          Ласкаво просимо до Центру допомоги!
        </h2>
        <p className="text-lg text-timber-beam mb-6">
          Тут ви знайдете всю необхідну інформацію про роботу з платформою Мережа Вільних Людей.
          Оберіть категорію нижче або скористайтесь пошуком для швидкого доступу до статей.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-timber-dark/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10">
              <Rocket className="text-accent" size={24} />
            </div>
            <div>
              <p className="font-bold">Швидкий старт</p>
              <p className="text-sm text-timber-beam">Перші кроки на платформі</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10">
              <Zap className="text-accent" size={24} />
            </div>
            <div>
              <p className="font-bold">Функції</p>
              <p className="text-sm text-timber-beam">Детальні інструкції</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10">
              <HelpCircle className="text-accent" size={24} />
            </div>
            <div>
              <p className="font-bold">FAQ</p>
              <p className="text-sm text-timber-beam">Відповіді на питання</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <section>
        <h2 className="font-syne text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="h-1 w-12 bg-accent"></div>
          Категорії
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);

            return (
              <Link
                key={category.id}
                href={`/help/${category.slug}`}
                className="bg-white border-2 border-timber-dark p-6 hover:border-accent transition-colors group relative"
              >
                <div className="joint" style={{ top: '-6px', left: '-6px' }} />
                <div className="joint" style={{ top: '-6px', right: '-6px' }} />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-timber-dark/10 group-hover:bg-accent/10 transition-colors">
                    <Icon className="text-timber-dark group-hover:text-accent transition-colors" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-syne text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                      {category.nameUk}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-timber-beam line-clamp-2">
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
            <TrendingUp className="text-accent" size={28} />
            Популярні статті
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularArticles.slice(0, 6).map((article: any) => (
              <Link
                key={article.id}
                href={`/help/${article.category?.slug}/${article.slug}`}
                className="bg-white border-2 border-timber-dark p-6 hover:border-accent transition-colors group relative"
              >
                <div className="joint" style={{ top: '-6px', left: '-6px' }} />
                <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-accent">
                    {article.category?.name_uk}
                  </span>
                  <span className="text-xs text-timber-beam">
                    {article.view_count || 0} переглядів
                  </span>
                </div>

                <h3 className="font-syne text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>

                {article.excerpt && (
                  <p className="text-sm text-timber-beam line-clamp-2">
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
            <Clock className="text-accent" size={28} />
            Нові статті
          </h2>

          <div className="bg-white border-2 border-timber-dark relative">
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />

            <div className="divide-y-2 divide-timber-dark/20">
              {recentArticles.slice(0, 5).map((article: any) => (
                <Link
                  key={article.id}
                  href={`/help/${article.category?.slug}/${article.slug}`}
                  className="block p-4 hover:bg-timber-dark/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1 group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-timber-beam">
                        {article.category?.name_uk}
                      </p>
                    </div>
                    <span className="text-xs text-timber-beam whitespace-nowrap">
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
