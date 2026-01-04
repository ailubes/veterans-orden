'use client';

import { useTranslations } from 'next-intl';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { StatCard, StatGrid } from '@/components/ui/stat-card';

interface StatsSectionProps {
  veterans?: number;
  regions?: number;
  programs?: number;
  className?: string;
}

/**
 * StatsSection - Statistics display section
 *
 * Features:
 * - 3-column grid of stat cards
 * - Bronze accent borders
 * - Theme-aware styling
 * - i18n support
 */
export function StatsSection({
  veterans = 25,
  regions = 6,
  programs = 12,
  className = '',
}: StatsSectionProps) {
  const t = useTranslations('stats');

  return (
    <section className={`stats-section section-sm ${className}`}>
      <Scaffold>
        <div className="col-span-full">
          <StatGrid columns={3}>
            <StatCard
              value={veterans.toLocaleString('uk-UA')}
              label={t('veterans')}
              variant="bronze"
            />
            <StatCard
              value={regions.toLocaleString('uk-UA')}
              label={t('regions')}
              variant="bronze"
            />
            <StatCard
              value={programs.toLocaleString('uk-UA')}
              label={t('programs')}
              variant="bronze"
            />
          </StatGrid>
        </div>
      </Scaffold>
    </section>
  );
}
