'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
  variant?: 'default' | 'bronze' | 'outline';
}

/**
 * StatCard - Statistics display card with accent border
 *
 * Features:
 * - Large value display
 * - Bronze left border accent
 * - Theme-aware styling
 */
export function StatCard({
  value,
  label,
  className = '',
  variant = 'default',
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant} ${className}`}>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

interface StatStripProps {
  children: ReactNode;
  className?: string;
}

/**
 * StatStrip - Horizontal strip container for multiple StatCards
 */
export function StatStrip({ children, className = '' }: StatStripProps) {
  return (
    <div className={`stat-strip ${className}`}>
      {children}
    </div>
  );
}

interface StatGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * StatGrid - Grid layout for StatCards
 */
export function StatGrid({ children, columns = 3, className = '' }: StatGridProps) {
  return (
    <div className={`stat-grid stat-grid--${columns} ${className}`}>
      {children}
    </div>
  );
}
