'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb - Navigation breadcrumb component
 *
 * Usage:
 * <Breadcrumb items={[
 *   { label: 'Головна', href: '/' },
 *   { label: 'Напрями', href: '/directions' },
 *   { label: 'Адаптація' }  // Current page - no href
 * ]} />
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="breadcrumb-segment">
            {item.href && !isLast ? (
              <Link href={item.href} className="breadcrumb-item">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'breadcrumb-current' : 'breadcrumb-item'}>
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight
                size={14}
                className="breadcrumb-separator"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
