'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface SectionCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  href?: string;
  className?: string;
  variant?: 'default' | 'dark' | 'bronze' | 'outline';
}

/**
 * SectionCard - Card component for sections like About, Directions, etc.
 *
 * Features:
 * - Multiple variants
 * - Optional title and subtitle
 * - Optional link wrapper
 * - Rebar pattern overlay
 */
export function SectionCard({
  children,
  title,
  subtitle,
  href,
  className = '',
  variant = 'default',
}: SectionCardProps) {
  const content = (
    <>
      {/* Rebar pattern overlay */}
      <div className="section-card__rebar" aria-hidden="true" />

      <div className="section-card__content">
        {subtitle && (
          <span className="section-card__subtitle">{subtitle}</span>
        )}
        {title && (
          <h3 className="section-card__title">{title}</h3>
        )}
        <div className="section-card__body">
          {children}
        </div>
      </div>
    </>
  );

  const cardClass = `section-card section-card--${variant} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClass}>
      {content}
    </div>
  );
}

interface SectionCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

/**
 * SectionCardGrid - Grid layout for SectionCards
 */
export function SectionCardGrid({ children, columns = 3, className = '' }: SectionCardGridProps) {
  return (
    <div className={`section-card-grid section-card-grid--${columns} ${className}`}>
      {children}
    </div>
  );
}
