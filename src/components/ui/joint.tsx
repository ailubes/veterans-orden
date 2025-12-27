'use client';

import { cn } from '@/lib/utils';

export interface JointProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';
  size?: 'sm' | 'default' | 'lg';
}

const positionClasses = {
  'top-left': 'joint-tl',
  'top-right': 'joint-tr',
  'bottom-left': 'joint-bl',
  'bottom-right': 'joint-br',
  'center-top': 'joint-ct',
};

const sizeClasses = {
  sm: '', // Uses default 6x6px
  default: '', // Uses default 6x6px
  lg: 'joint-lg', // Uses 8x8px
};

export function Joint({
  position = 'top-left',
  size = 'default',
  className,
  ...props
}: JointProps) {
  return (
    <div
      className={cn('joint', positionClasses[position], sizeClasses[size], className)}
      aria-hidden="true"
      {...props}
    />
  );
}
