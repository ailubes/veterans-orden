'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface HeavyCtaProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * HeavyCta - Primary CTA button matching the design template
 *
 * Features:
 * - Brutalist design with sharp edges
 * - Hover effect with shadow offset
 * - Multiple variants and sizes
 * - Optional icon support
 * - Link or button rendering
 */
export function HeavyCta({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'right',
}: HeavyCtaProps) {
  const classes = `heavy-cta heavy-cta--${variant} heavy-cta--${size} ${fullWidth ? 'heavy-cta--full' : ''} ${disabled ? 'heavy-cta--disabled' : ''} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="heavy-cta__icon">{icon}</span>}
      <span className="heavy-cta__text">{children}</span>
      {icon && iconPosition === 'right' && <span className="heavy-cta__icon">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {content}
    </button>
  );
}

interface CtaGroupProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/**
 * CtaGroup - Container for multiple CTA buttons
 * Default alignment is center for better visual harmony with section headings
 */
export function CtaGroup({
  children,
  direction = 'row',
  align = 'center',
  className = '',
}: CtaGroupProps) {
  return (
    <div className={`cta-group cta-group--${direction} cta-group--${align} ${className}`}>
      {children}
    </div>
  );
}
