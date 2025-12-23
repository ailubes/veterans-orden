'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Joint } from './joint';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  withJoints?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'light', withJoints = false, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          variant === 'light' ? 'card' : 'card-dark',
          className
        )}
        ref={ref}
        {...props}
      >
        {withJoints && (
          <>
            <Joint position="top-left" />
            <Joint position="top-right" />
          </>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
