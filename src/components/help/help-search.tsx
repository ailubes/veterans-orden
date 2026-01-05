'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight, FileText } from 'lucide-react';
import type { SearchResult } from '@/lib/help/types';

interface HelpSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function HelpSearch({ placeholder = 'Пошук статей...', onSearch }: HelpSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/help/articles/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), limit: 8 }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (300ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Navigate to search results
  const navigateToSearchResults = () => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/help/search?q=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearchResults();
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(`/help/${result.categorySlug}/${result.slug}`);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else {
          // Navigate to search results page
          navigateToSearchResults();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-bronze/30 font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-500 pointer-events-none"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-line rounded-lg focus:border-bronze outline-none font-mono text-sm"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 text-bronze animate-spin"
            size={20}
          />
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-line rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <div className="p-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={`w-full text-left p-3 transition-colors border-2 mb-2 ${
                  selectedIndex === index
                    ? 'border-bronze bg-bronze/10'
                    : 'border-line/20 hover:border-bronze hover:bg-panel-850/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="text-bronze flex-shrink-0 mt-1" size={16} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm mb-1 line-clamp-1">
                      {highlightText(result.title, query)}
                    </h4>
                    {result.excerpt && (
                      <p className="text-xs text-muted-500 line-clamp-2">
                        {highlightText(result.excerpt, query)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-bronze font-bold">
                        {result.categoryName}
                      </span>
                      <span className="text-xs text-muted-500">
                        • Релевантність: {Math.round(result.rank * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* View all results */}
            <button
              onClick={handleSubmit}
              className={`w-full text-left p-3 transition-colors border-2 font-bold ${
                selectedIndex === results.length
                  ? 'border-bronze bg-bronze/10'
                  : 'border-line/20 hover:border-bronze hover:bg-panel-850/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">Переглянути всі результати для "{query}"</span>
                <ArrowRight size={16} className="text-bronze" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && !isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-line rounded-lg p-6 text-center z-50"
        >
          <div className="joint joint-tl" />
          <div className="joint joint-tr" />

          <Search className="mx-auto mb-2 text-muted-500" size={32} />
          <p className="text-muted-500 text-sm">
            Нічого не знайдено за запитом "{query}"
          </p>
          <p className="text-xs text-muted-500 mt-2">
            Спробуйте інші ключові слова або перегляньте категорії
          </p>
        </div>
      )}
    </div>
  );
}
