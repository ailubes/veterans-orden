'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Oblast {
  id: string;
  name: string;
}

interface EventFiltersProps {
  oblasts: Oblast[];
  userOblastId?: string | null;
}

export function EventFilters({ oblasts, userOblastId }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'all';

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', value);
    }
    router.push(`/dashboard/events?${params.toString()}`);
  };

  return (
    <select
      value={currentFilter}
      onChange={(e) => handleFilterChange(e.target.value)}
      className="px-4 py-2 bg-panel-900 border border-line text-text-100 font-mono text-sm focus:border-bronze focus:outline-none cursor-pointer rounded"
    >
      <option value="all">Всі регіони</option>
      <option value="online">Онлайн</option>
      {userOblastId && <option value="my-region">Моя область</option>}
      <optgroup label="Області">
        {oblasts.map((oblast) => (
          <option key={oblast.id} value={oblast.id}>
            {oblast.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
