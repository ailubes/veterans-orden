'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export interface KatottgDetails {
  code: string;
  name: string;
  category: string;
  level: number;
  oblastCode: string | null;
  raionCode: string | null;
  hromadaCode: string | null;
  oblastName: string | null;
  raionName: string | null;
  hromadaName: string | null;
  fullPath: string;
}

interface KatottgSearchResult {
  code: string;
  name: string;
  category: string;
  level: number;
  oblastCode: string | null;
  raionCode: string | null;
  hromadaCode: string | null;
  oblastName: string | null;
  raionName: string | null;
  hromadaName: string | null;
  fullPath: string;
}

interface KatottgSelectorProps {
  value: string | null;
  onChange: (code: string | null, details: KatottgDetails | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'O': 'Область',
  'K': 'Місто',
  'P': 'Район',
  'B': 'Район',
  'H': 'Громада',
  'M': 'Місто',
  'T': 'СМТ',
  'C': 'Село',
  'X': 'Селище',
};

const CATEGORY_ICONS: Record<string, string> = {
  'M': '🏙️',
  'T': '🏘️',
  'C': '🏡',
  'X': '🏠',
  'O': '🗺️',
  'K': '⭐',
  'P': '📍',
  'H': '🏛️',
  'B': '🏢',
};

export function KatottgSelector({
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  label = 'НАСЕЛЕНИЙ ПУНКТ',
}: KatottgSelectorProps) {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<KatottgSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<KatottgDetails | null>(null);

  const debouncedSearch = useDebounce(searchInput, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load selected value details on mount
  useEffect(() => {
    if (value && !selectedDetails) {
      loadDetails(value);
    }
  }, [value]);

  const loadDetails = async (code: string) => {
    try {
      const response = await fetch(`/api/katottg/${encodeURIComponent(code)}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedDetails(data);
        setSearchInput(data.name);
      }
    } catch (error) {
      console.error('Error loading KATOTTG details:', error);
    }
  };

  // Search when debounced value changes
  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/katottg/search?q=${encodeURIComponent(query)}&limit=30`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error searching KATOTTG:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch && debouncedSearch !== selectedDetails?.name) {
      search(debouncedSearch);
      setShowDropdown(true);
    }
  }, [debouncedSearch, selectedDetails?.name, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: KatottgSearchResult) => {
    const details: KatottgDetails = {
      code: result.code,
      name: result.name,
      category: result.category,
      level: result.level,
      oblastCode: result.oblastCode,
      raionCode: result.raionCode,
      hromadaCode: result.hromadaCode,
      oblastName: result.oblastName,
      raionName: result.raionName,
      hromadaName: result.hromadaName,
      fullPath: result.fullPath,
    };
    setSelectedDetails(details);
    setSearchInput(result.name);
    setShowDropdown(false);
    onChange(result.code, details);
  };

  const handleClear = () => {
    setSearchInput('');
    setSelectedDetails(null);
    setResults([]);
    onChange(null, null);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    if (newValue !== selectedDetails?.name) {
      setSelectedDetails(null);
    }
  };

  // Group results by oblast
  const groupedResults = results.reduce((acc, result) => {
    const oblast = result.oblastName || 'Інше';
    if (!acc[oblast]) {
      acc[oblast] = [];
    }
    acc[oblast].push(result);
    return acc;
  }, {} as Record<string, KatottgSearchResult[]>);

  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs uppercase tracking-wider text-timber-dark mb-2">
          <MapPin className="w-3 h-3 inline mr-1" />
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* Selected Location Display */}
      {selectedDetails && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-600">✓</span>
                <span className="font-medium">
                  {CATEGORY_ICONS[selectedDetails.category]} {selectedDetails.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-green-100 rounded">
                  {CATEGORY_LABELS[selectedDetails.category]}
                </span>
              </div>
              <div className="text-xs text-timber-beam flex flex-wrap items-center gap-1">
                {selectedDetails.oblastName && (
                  <span>{selectedDetails.oblastName}</span>
                )}
                {selectedDetails.raionName && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{selectedDetails.raionName}</span>
                  </>
                )}
                {selectedDetails.hromadaName && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span>{selectedDetails.hromadaName}</span>
                  </>
                )}
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-timber-beam hover:text-timber-dark p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Input */}
      {!selectedDetails && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam" />
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onFocus={() => {
                if (results.length > 0 || searchInput.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Почніть вводити назву міста або села..."
              disabled={disabled}
              className={`w-full pl-10 pr-10 py-3 bg-canvas border-2 font-mono text-sm focus:outline-none transition-colors ${
                error
                  ? 'border-accent focus:border-accent'
                  : 'border-timber-dark focus:border-accent'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {loading && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam animate-spin" />
            )}
            {searchInput && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-timber-dark/10 rounded"
              >
                <X className="w-4 h-4 text-timber-beam" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchInput.length >= 2 && (
            <div className="absolute z-50 w-full mt-1 bg-canvas border-2 border-timber-dark shadow-lg max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-timber-beam" />
                  <p className="text-sm text-timber-beam mt-2">Пошук...</p>
                </div>
              ) : results.length > 0 ? (
                <div>
                  {Object.entries(groupedResults).map(([oblast, items]) => (
                    <div key={oblast}>
                      <div className="px-3 py-2 bg-timber-dark/5 text-xs font-bold text-timber-beam uppercase tracking-wider sticky top-0">
                        {oblast}
                      </div>
                      {items.map((result) => (
                        <button
                          key={result.code}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className="w-full px-4 py-3 text-left hover:bg-timber-dark/5 border-b border-timber-dark/10 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">
                              {CATEGORY_ICONS[result.category]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{result.name}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-timber-dark/10 rounded">
                                  {CATEGORY_LABELS[result.category]}
                                </span>
                              </div>
                              <p className="text-xs text-timber-beam mt-0.5 truncate">
                                {result.raionName && `${result.raionName}`}
                                {result.hromadaName && ` · ${result.hromadaName}`}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-timber-beam text-sm">
                  <p>Не знайдено населених пунктів</p>
                  <p className="text-xs mt-1">Спробуйте змінити запит</p>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="mt-2 text-xs text-timber-beam">
              Введіть щонайменше 2 символи для пошуку
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 font-mono text-xs text-accent">{error}</p>
      )}
    </div>
  );
}
