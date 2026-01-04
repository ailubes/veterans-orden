'use client';

import { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  variant?: 'default' | 'bronze' | 'steel' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * Pill - Badge/tag component for labels and categories
 *
 * Features:
 * - Multiple variants (default, bronze, steel, outline, ghost)
 * - Size options (sm, md, lg)
 * - Optional click handler
 * - Theme-aware styling
 */
export function Pill({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
}: PillProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      className={`pill pill--${variant} pill--${size} ${className}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
}

interface PillGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * PillGroup - Container for multiple pills
 */
export function PillGroup({ children, className = '' }: PillGroupProps) {
  return (
    <div className={`pill-group ${className}`}>
      {children}
    </div>
  );
}
