'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Package, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Division {
  id: string;
  name: string;
  shortName: string;
  number: string;
  city: string;
  cityRef?: string;
  region: string;
  address: string;
  status: string;
  category: string;
}

interface City {
  ref: string;
  name: string;
  region: string;
}

interface NovaPoshtaSelectorProps {
  city: string;
  branch: string;
  cityRef?: string;
  branchRef?: string;
  onCityChange: (city: string, ref?: string) => void;
  onBranchChange: (branch: string, ref?: string) => void;
}

export function NovaPoshtaSelector({
  city,
  branch,
  onCityChange,
  onBranchChange,
}: NovaPoshtaSelectorProps) {
  const [cityInput, setCityInput] = useState(city);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(city);
  const [selectedCityRef, setSelectedCityRef] = useState('');

  const debouncedCity = useDebounce(cityInput, 400);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cities and divisions when city input changes
  const fetchDivisions = useCallback(async (searchCity: string, cityRef?: string) => {
    if (!searchCity || searchCity.length < 2) {
      setDivisions([]);
      setCities([]);
      return;
    }

    setLoading(true);
    try {
      const url = cityRef
        ? `/api/nova-poshta/divisions?city=${encodeURIComponent(searchCity)}&cityRef=${encodeURIComponent(cityRef)}&limit=100`
        : `/api/nova-poshta/divisions?city=${encodeURIComponent(searchCity)}&limit=100`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.cities) {
        setCities(data.cities);
      }
      if (data.divisions) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error('Error fetching Nova Poshta divisions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedCity && debouncedCity !== selectedCity) {
      fetchDivisions(debouncedCity);
      setShowDropdown(true);
    }
  }, [debouncedCity, selectedCity, fetchDivisions]);

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

  const handleCitySelect = async (cityItem: City) => {
    setSelectedCity(cityItem.name);
    setSelectedCityRef(cityItem.ref);
    setCityInput(cityItem.name);
    onCityChange(cityItem.name, cityItem.ref);
    setShowDropdown(false);
    // Clear branch when city changes
    onBranchChange('');
    // Fetch warehouses for this city
    await fetchDivisions(cityItem.name, cityItem.ref);
  };

  const handleBranchSelect = (division: Division) => {
    const branchName = `${division.shortName || division.name} (${division.address})`;
    onBranchChange(branchName, division.id);
  };

  const handleClearCity = () => {
    setCityInput('');
    setSelectedCity('');
    setSelectedCityRef('');
    onCityChange('');
    onBranchChange('');
    setDivisions([]);
    setCities([]);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Postomat':
        return '📦';
      case 'CargoBranch':
        return '🚛';
      case 'PUDO':
        return '🏪';
      default:
        return '📮';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'Postomat':
        return 'Поштомат';
      case 'CargoBranch':
        return 'Вантажне';
      case 'PUDO':
        return 'Пункт видачі';
      default:
        return 'Відділення';
    }
  };

  return (
    <div className="space-y-4">
      {/* City Search */}
      <div>
        <label className="label block mb-2">
          <MapPin className="w-3 h-3 inline mr-1" />
          МІСТО (НОВА ПОШТА)
        </label>
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam" />
            <input
              ref={inputRef}
              type="text"
              value={cityInput}
              onChange={(e) => {
                setCityInput(e.target.value);
                if (e.target.value !== selectedCity) {
                  setSelectedCity('');
                }
              }}
              onFocus={() => {
                if (divisions.length > 0 || cityInput.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Почніть вводити назву міста..."
              className="w-full pl-10 pr-10 py-3 bg-canvas border-2 border-timber-dark font-mono text-sm focus:border-accent focus:outline-none"
            />
            {loading && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-timber-beam animate-spin" />
            )}
            {cityInput && (
              <button
                type="button"
                onClick={handleClearCity}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-timber-dark/10 rounded"
              >
                <X className="w-4 h-4 text-timber-beam" />
              </button>
            )}
          </div>

          {/* City Dropdown */}
          {showDropdown && cities.length > 0 && !selectedCity && (
            <div className="absolute z-50 w-full mt-1 bg-canvas border-2 border-timber-dark shadow-lg max-h-60 overflow-y-auto">
              {cities.map((item, idx) => (
                <button
                  key={`${item.ref}-${idx}`}
                  type="button"
                  onClick={() => handleCitySelect(item)}
                  className="w-full px-4 py-3 text-left hover:bg-timber-dark/5 border-b border-timber-dark/10 last:border-b-0"
                >
                  <div className="font-medium">{item.name}</div>
                  {item.region && (
                    <div className="text-xs text-timber-beam">{item.region}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Branch Selection */}
      {selectedCity && (
        <div>
          <label className="label block mb-2">
            <Package className="w-3 h-3 inline mr-1" />
            ВІДДІЛЕННЯ / ПОШТОМАТ
          </label>

          {/* Selected branch display */}
          {branch && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">{branch}</span>
              </div>
              <button
                type="button"
                onClick={() => onBranchChange('')}
                className="text-timber-beam hover:text-timber-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Branch list */}
          {!branch && (
            <div className="border-2 border-timber-dark max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-timber-beam" />
                  <p className="text-sm text-timber-beam mt-2">Завантаження...</p>
                </div>
              ) : divisions.length > 0 ? (
                <div>
                  {divisions.map((division) => (
                    <button
                      key={division.id}
                      type="button"
                      onClick={() => handleBranchSelect(division)}
                      disabled={division.status !== 'Working'}
                      className={`w-full p-3 text-left border-b border-timber-dark/10 last:border-b-0 transition-colors ${
                        division.status === 'Working'
                          ? 'hover:bg-timber-dark/5'
                          : 'opacity-50 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getCategoryIcon(division.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {division.shortName || division.name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-timber-dark/10 rounded">
                              {getCategoryLabel(division.category)}
                            </span>
                          </div>
                          <p className="text-xs text-timber-beam mt-0.5 truncate">
                            {division.address}
                          </p>
                          {division.status !== 'Working' && (
                            <p className="text-xs text-red-600 mt-0.5">
                              Тимчасово не працює
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-timber-beam text-sm">
                  Відділень не знайдено
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-timber-beam mt-2">
            Знайдено {divisions.length} відділень у місті {selectedCity}
          </p>
        </div>
      )}
    </div>
  );
}
