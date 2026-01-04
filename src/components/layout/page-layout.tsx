'use client';

import { ReactNode } from 'react';
import { PageWrapper, Scaffold } from '@/components/layout/skeleton-grid';
import { NavigationNew } from '@/components/layout/navigation-new';
import { FooterNew } from '@/components/layout/footer-new';

interface PageLayoutProps {
  children: ReactNode;
  showRebar?: boolean;
}

/**
 * PageLayout - Consistent layout wrapper for all pages
 *
 * Includes:
 * - Navigation with theme/language controls
 * - Footer
 * - Theme-aware background
 * - Optional rebar decoration
 */
export function PageLayout({ children, showRebar = true }: PageLayoutProps) {
  return (
    <PageWrapper showRebar={showRebar}>
      <NavigationNew />
      <main>{children}</main>
      <FooterNew />
    </PageWrapper>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

/**
 * PageHeader - Consistent header for content pages
 */
export function PageHeader({ title, subtitle, description, className = '' }: PageHeaderProps) {
  return (
    <header className={`page-header-new ${className}`}>
      <Scaffold>
        <div className="col-span-8">
          {subtitle && <span className="page-header-subtitle">{subtitle}</span>}
          <h1 className="page-header-title">{title}</h1>
          {description && <p className="page-header-desc">{description}</p>}
        </div>
      </Scaffold>
    </header>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

/**
 * PageContent - Main content wrapper with proper grid
 */
export function PageContent({ children, className = '', narrow = false }: PageContentProps) {
  return (
    <div className={`page-content ${className}`}>
      <Scaffold>
        <div className={narrow ? 'col-span-8' : 'col-span-full'}>
          {children}
        </div>
      </Scaffold>
    </div>
  );
}
