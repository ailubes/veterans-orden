'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Folder, FileText } from 'lucide-react';
import { ArticleCard } from '@/components/help/article-card';
import type { HelpArticle, HelpCategory } from '@/lib/help/types';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.categorySlug as string;

  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);

        // Fetch all categories to find the current one
        const categoriesRes = await fetch('/api/help/categories');
        const categoriesData = await categoriesRes.json();

        // Find category by slug (including subcategories)
        let foundCategory: HelpCategory | null = null;
        const findCategory = (cats: HelpCategory[]): HelpCategory | null => {
          for (const cat of cats) {
            if (cat.slug === categorySlug) {
              return cat;
            }
            if (cat.subcategories) {
              const found = findCategory(cat.subcategories);
              if (found) return found;
            }
          }
          return null;
        };

        foundCategory = findCategory(categoriesData.categories || []);

        if (!foundCategory) {
          setError('Категорію не знайдено');
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Fetch articles for this category
        const articlesRes = await fetch(`/api/help/articles?categoryId=${foundCategory.id}&limit=50`);
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка завантаження');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line border-t-accent"></div>
        <p className="mt-4 text-muted-500">Завантаження...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="bg-white border border-line rounded-lg p-12 text-center relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <Folder className="mx-auto mb-4 text-muted-500" size={64} />
        <h2 className="font-syne text-2xl font-bold mb-2">Категорію не знайдено</h2>
        <p className="text-muted-500 mb-6">{error || 'Неможливо знайти категорію'}</p>
        <a href="/help" className="text-bronze hover:underline font-bold">
          ← Повернутися до головної
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="bg-white border border-line rounded-lg p-8 relative">
        <div className="joint joint-tl" />
        <div className="joint joint-tr" />

        <div className="flex items-center gap-2 text-sm text-muted-500 mb-4">
          <a href="/help" className="hover:text-bronze">Допомога</a>
          <span>/</span>
          <span className="font-bold">{category.nameUk}</span>
        </div>

        <h1 className="font-syne text-3xl font-bold mb-3">{category.nameUk}</h1>

        {category.description && (
          <p className="text-lg text-muted-500">{category.description}</p>
        )}

        <div className="mt-4 pt-4 border-t-2 border-line/20">
          <div className="flex items-center gap-2 text-sm text-muted-500">
            <FileText size={16} />
            <span>{articles.length} {articles.length === 1 ? 'стаття' : 'статей'}</span>
          </div>
        </div>
      </div>

      {/* Subcategories (if any) */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">Підкатегорії</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.subcategories.map((subcat) => (
              <a
                key={subcat.id}
                href={`/help/${subcat.slug}`}
                className="bg-white border border-line rounded-lg p-4 hover:border-bronze transition-colors group relative"
              >
                <div className="joint joint-tl" />
                <div className="joint joint-br" />

                <h3 className="font-bold mb-1 group-hover:text-bronze transition-colors">
                  {subcat.nameUk}
                </h3>
                {subcat.description && (
                  <p className="text-sm text-muted-500 line-clamp-2">{subcat.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">Статті</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={{ ...article, category }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-lg p-12 text-center relative">
          <div className="joint joint-tl" />
          <div className="joint joint-br" />

          <FileText className="mx-auto mb-4 text-muted-500" size={48} />
          <p className="text-muted-500">Статті в цій категорії ще не додані</p>
        </div>
      )}
    </div>
  );
}
