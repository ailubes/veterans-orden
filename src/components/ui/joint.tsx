'use client';

import { cn } from '@/lib/utils';

export interface JointProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top';
  size?: 'sm' | 'default' | 'lg';
}

const positionStyles = {
  'top-left': { top: '-6px', left: '-6px' },
  'top-right': { top: '-6px', right: '-6px' },
  'bottom-left': { bottom: '-6px', left: '-6px' },
  'bottom-right': { bottom: '-6px', right: '-6px' },
  'center-top': { top: '-6px', left: '50%', transform: 'translateX(-50%)' },
};

const sizeStyles = {
  sm: 'w-2 h-2',
  default: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function Joint({
  position = 'top-left',
  size = 'default',
  className,
  style,
  ...props
}: JointProps) {
  return (
    <div
      className={cn('joint', sizeStyles[size], className)}
      style={{ ...positionStyles[position], ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
