'use client';

interface SkeletonGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Legacy SkeletonGrid - maintained for backward compatibility
 * New pages should use Scaffold component instead
 */
export function SkeletonGrid({ children, className = '' }: SkeletonGridProps) {
  return (
    <div className={`skeleton-container ${className}`}>
      {/* Structural Beams - hidden on mobile via CSS */}
      <div className="beam-v beam-left" />
      <div className="beam-v beam-right" />
      <div className="beam-v beam-center" />

      {children}
    </div>
  );
}

interface ScaffoldProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article';
}

/**
 * Scaffold - New 12-column grid layout component
 * Based on the Order of Veterans design template
 */
export function Scaffold({ children, className = '', as: Component = 'div' }: ScaffoldProps) {
  return (
    <Component className={`scaffold ${className}`}>
      {children}
    </Component>
  );
}

interface PageWrapperProps {
  children: React.ReactNode;
  showRebar?: boolean;
  className?: string;
}

/**
 * PageWrapper - Wraps entire page with theme-aware background and optional rebar decoration
 */
export function PageWrapper({ children, showRebar = true, className = '' }: PageWrapperProps) {
  return (
    <div className={`page-wrapper ${className}`}>
      {showRebar && <div className="rebar-vertical" aria-hidden="true" />}
      {children}
    </div>
  );
}
