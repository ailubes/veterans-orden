'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-timber-beam/20 rounded',
        className
      )}
    />
  );
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 border border-grid-line', className)}>
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-8 w-3/4 mb-4" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonAvatar({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    default: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-12 w-32', className)} />;
}

export function SkeletonCounter({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Skeleton className="h-16 w-48" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
