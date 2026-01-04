'use client';

import { ReactNode } from 'react';

interface MonolithCardProps {
  children: ReactNode;
  tag?: string;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

/**
 * MonolithCard - Large skewed card component matching the design template
 *
 * Features:
 * - Skewed design with -2deg rotation
 * - Counter-rotates content to keep text level
 * - Hover effect that removes skew
 * - Optional data-tag badge in top-right corner
 * - Rebar pattern overlay
 */
export function MonolithCard({
  children,
  tag,
  className = '',
  hover = true,
  onClick,
}: MonolithCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={`monolith-card ${hover ? 'monolith-card--hover' : ''} ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {/* Rebar pattern overlay */}
      <div className="monolith-card__rebar" aria-hidden="true" />

      {/* Data tag badge */}
      {tag && (
        <div className="monolith-card__tag">
          <span className="monolith-card__tag-text">{tag}</span>
        </div>
      )}

      {/* Content wrapper - counter-rotated */}
      <div className="monolith-card__content">
        {children}
      </div>
    </div>
  );
}

interface MonolithCardTitleProps {
  children: ReactNode;
  className?: string;
}

/**
 * Title component for MonolithCard
 */
export function MonolithCardTitle({ children, className = '' }: MonolithCardTitleProps) {
  return (
    <h2 className={`monolith-card__title ${className}`}>
      {children}
    </h2>
  );
}

interface MonolithCardDescProps {
  children: ReactNode;
  className?: string;
}

/**
 * Description component for MonolithCard
 */
export function MonolithCardDesc({ children, className = '' }: MonolithCardDescProps) {
  return (
    <p className={`monolith-card__desc ${className}`}>
      {children}
    </p>
  );
}

interface MonolithCardActionsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Actions container for MonolithCard buttons
 */
export function MonolithCardActions({ children, className = '' }: MonolithCardActionsProps) {
  return (
    <div className={`monolith-card__actions ${className}`}>
      {children}
    </div>
  );
}
