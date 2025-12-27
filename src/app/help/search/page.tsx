'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, Sparkles, AlertCircle } from 'lucide-react';
import type { SearchResult } from '@/lib/help/types';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/help/articles/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query.trim(), limit: 50 }),
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  // Highlight matching text
  const highlightText = (text: string | null, query: string) => {
    if (!text || !query.trim()) return text || '';

    const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-accent/30 font-bold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  if (!query.trim()) {
    return (
      <div className="bg-white border-2 border-timber-dark p-12 text-center relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <Search className="mx-auto mb-4 text-timber-beam" size={64} />
        <h2 className="font-syne text-2xl font-bold mb-2">Введіть запит для пошуку</h2>
        <p className="text-timber-beam">
          Використовуйте пошукову форму вгорі для пошуку статей
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-timber-dark border-t-accent"></div>
        <p className="mt-4 text-timber-beam">Пошук...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-2 border-timber-dark p-12 text-center relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <AlertCircle className="mx-auto mb-4 text-red-600" size={64} />
        <h2 className="font-syne text-2xl font-bold mb-2">Помилка пошуку</h2>
        <p className="text-timber-beam">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white border-2 border-timber-dark p-8 relative">
        <div className="joint" style={{ top: '-6px', left: '-6px' }} />
        <div className="joint" style={{ top: '-6px', right: '-6px' }} />

        <div className="flex items-center gap-3 mb-4">
          <Search className="text-accent" size={32} />
          <h1 className="font-syne text-3xl font-bold">Результати пошуку</h1>
        </div>

        <p className="text-lg mb-2">
          Знайдено <span className="font-bold text-accent">{results.length}</span>{' '}
          {results.length === 1 ? 'результат' : 'результатів'} за запитом:{' '}
          <span className="font-bold">"{query}"</span>
        </p>

        {results.length > 0 && (
          <p className="text-sm text-timber-beam">
            Результати відсортовані за релевантністю
          </p>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Link
              key={result.id}
              href={`/help/${result.slug}`}
              className="block bg-white border-2 border-timber-dark p-6 hover:border-accent transition-colors group relative"
            >
              <div className="joint" style={{ top: '-6px', left: '-6px' }} />
              <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent/10 border-2 border-accent flex items-center justify-center">
                    <span className="font-syne font-bold text-accent">#{index + 1}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      {result.categoryName}
                    </span>
                    <span className="text-xs text-timber-beam">
                      • Релевантність: {Math.round(result.rank * 100)}%
                    </span>
                  </div>

                  {/* Title with highlighting */}
                  <h2 className="font-syne text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                    {highlightText(result.title, query)}
                  </h2>

                  {/* Excerpt with highlighting */}
                  {result.excerpt && (
                    <p className="text-sm text-timber-beam line-clamp-3">
                      {highlightText(result.excerpt, query)}
                    </p>
                  )}

                  {/* Match indicator */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-timber-beam">
                    <Sparkles size={14} className="text-accent" />
                    <span>Відповідає вашому запиту</span>
                  </div>
                </div>

                <FileText className="text-timber-beam group-hover:text-accent transition-colors flex-shrink-0" size={24} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-timber-dark p-12 text-center relative">
          <div className="joint" style={{ top: '-6px', left: '-6px' }} />
          <div className="joint" style={{ top: '-6px', right: '-6px' }} />

          <Search className="mx-auto mb-4 text-timber-beam" size={64} />
          <h2 className="font-syne text-2xl font-bold mb-2">Нічого не знайдено</h2>
          <p className="text-timber-beam mb-6">
            За запитом "{query}" не знайдено жодної статті
          </p>

          <div className="bg-timber-dark/5 border-2 border-timber-dark/20 p-6 max-w-md mx-auto">
            <h3 className="font-bold mb-3">Поради для пошуку:</h3>
            <ul className="text-sm text-left space-y-2 text-timber-beam">
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Перевірте правильність написання</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Спробуйте більш загальні слова</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Використовуйте синоніми</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span>Перегляньте категорії допомоги</span>
              </li>
            </ul>
          </div>

          <Link
            href="/help"
            className="inline-block mt-6 px-6 py-3 bg-accent text-canvas font-bold hover:shadow-[4px_4px_0px_0px_rgba(44,40,36,1)] transition-all"
          >
            Повернутися до допомоги
          </Link>
        </div>
      )}
    </div>
  );
}
