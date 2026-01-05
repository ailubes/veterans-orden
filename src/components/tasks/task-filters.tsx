'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

const typeLabels: Record<string, string> = {
  recruitment: 'Рекрутинг',
  outreach: 'Охоплення',
  event_support: 'Підтримка подій',
  content: 'Контент',
  administrative: 'Адміністративне',
};

const priorityLabels: Record<string, string> = {
  urgent: 'Терміново',
  high: 'Високий',
  medium: 'Середній',
  low: 'Низький',
};

export function TaskFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentType = searchParams.get('type') || '';
  const currentPriority = searchParams.get('priority') || '';

  const hasFilters = currentType || currentPriority;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/tasks?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/dashboard/tasks');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded transition-colors ${
          hasFilters
            ? 'bg-bronze text-bg-950'
            : 'bg-panel-900 border border-line text-text-100 hover:border-bronze/50'
        }`}
      >
        <Filter size={16} />
        ФІЛЬТР
        {hasFilters && (
          <span className="w-5 h-5 bg-bg-950 text-bronze rounded-full text-xs flex items-center justify-center font-bold">
            {(currentType ? 1 : 0) + (currentPriority ? 1 : 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-panel-900 border border-line p-4 z-50 shadow-lg rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-text-100">Фільтри</span>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-bronze hover:underline flex items-center gap-1"
                >
                  <X size={12} />
                  Очистити
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mono text-bronze text-xs tracking-widest block mb-2">ТИП</label>
                <select
                  value={currentType}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full px-3 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                >
                  <option value="">Всі типи</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mono text-bronze text-xs tracking-widest block mb-2">ПРІОРИТЕТ</label>
                <select
                  value={currentPriority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-panel-850 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none rounded"
                >
                  <option value="">Всі пріоритети</option>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 bg-bronze text-bg-950 px-4 py-2 font-bold text-sm hover:bg-bronze/90 transition-colors rounded"
            >
              ЗАСТОСУВАТИ
            </button>
          </div>
        </>
      )}
    </div>
  );
}
