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
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${item.href ?? 'current'}-${index}`;

          return (
            <li key={key} className="breadcrumb-segment">
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumb-item">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'breadcrumb-current' : 'breadcrumb-item'} aria-current={isLast ? 'page' : undefined}>
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
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
