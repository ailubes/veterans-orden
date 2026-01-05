'use client';

import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max: number;
  showMilestones?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  showMilestones = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={cn('h-2 bg-white/10 relative', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      {/* Progress fill */}
      <div
        className="absolute left-0 top-0 bottom-0 bg-bronze transition-all duration-500"
        style={{ width: `${percentage}%`, minWidth: '4px' }}
      />

      {/* Milestone markers */}
      {showMilestones && (
        <>
          <div
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: '10%' }}
          />
          <div
            className="absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: '50%' }}
          />
        </>
      )}
    </div>
  );
}
