'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Calendar,
  Vote,
  CheckSquare,
  Newspaper,
  ArrowRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'member' | 'event' | 'vote' | 'task' | 'news';
  title: string;
  subtitle: string;
  url: string;
  meta: string;
}

const TYPE_ICONS = {
  member: Users,
  event: Calendar,
  vote: Vote,
  task: CheckSquare,
  news: Newspaper,
};

const TYPE_LABELS = {
  member: 'Член',
  event: 'Подія',
  vote: 'Голосування',
  task: 'Завдання',
  news: 'Новина',
};

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle selection
  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, [router]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    },
    [results, selectedIndex, handleSelect]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-timber-dark/80 animate-in fade-in">
      {/* Search Dialog */}
      <div
        className="w-full max-w-2xl bg-panel-900 border-4 border-bronze shadow-2xl animate-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-line">
          <Search className="w-5 h-5 text-muted-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Пошук членів, подій, голосувань..."
            className="flex-1 bg-transparent font-mono text-lg focus:outline-none placeholder:text-muted-500/50"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-timber-dark/10 text-xs font-mono font-bold">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-muted-500">
              <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Пошук...</p>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-muted-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Нічого не знайдено</p>
              <p className="text-xs mt-1">Спробуйте інший запит</p>
            </div>
          )}

          {!loading && query.length > 0 && query.length < 2 && (
            <div className="p-8 text-center text-muted-500">
              <p className="text-sm">Введіть мінімум 2 символи</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((result, index) => {
                const Icon = TYPE_ICONS[result.type];
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-4 p-4 border-b border-line/10 transition-colors text-left ${
                      isSelected
                        ? 'bg-bronze/10 border-l-4 border-l-accent'
                        : 'hover:bg-timber-dark/5 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-bronze text-canvas'
                          : 'bg-timber-dark/10 text-timber-dark'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-500 uppercase">
                          {TYPE_LABELS[result.type]}
                        </span>
                        <span className="text-xs text-muted-500/60">
                          {result.meta}
                        </span>
                      </div>
                      <p className="font-bold truncate">{result.title}</p>
                      <p className="text-sm text-muted-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>

                    {/* Arrow */}
                    {isSelected && (
                      <ArrowRight className="w-5 h-5 text-bronze" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Links (when no query) */}
          {!loading && !query && (
            <div className="p-6">
              <p className="label mb-4">ШВИДКІ ПОСИЛАННЯ</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Члени', url: '/admin/members', icon: Users },
                  { label: 'Події', url: '/admin/events', icon: Calendar },
                  {
                    label: 'Голосування',
                    url: '/admin/votes',
                    icon: Vote,
                  },
                  { label: 'Завдання', url: '/admin/tasks', icon: CheckSquare },
                  { label: 'Новини', url: '/admin/news', icon: Newspaper },
                  {
                    label: 'Налаштування',
                    url: '/admin/settings',
                    icon: Calendar,
                  },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.url}
                      onClick={() => {
                        router.push(link.url);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 border border-line rounded-lg hover:bg-timber-dark hover:text-canvas transition-colors text-left"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-bold text-sm">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-line bg-timber-dark/5">
          <div className="flex items-center gap-4 text-xs text-muted-500">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-timber-dark/10 font-mono font-bold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-timber-dark/10 font-mono font-bold">
                ↓
              </kbd>
              <span>навігація</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-timber-dark/10 font-mono font-bold">
                ↵
              </kbd>
              <span>відкрити</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery('');
              setResults([]);
            }}
            className="text-xs text-muted-500 hover:text-timber-dark"
          >
            Закрити
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={() => {
          setIsOpen(false);
          setQuery('');
          setResults([]);
        }}
      />
    </div>
  );
}
