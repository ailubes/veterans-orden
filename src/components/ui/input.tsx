'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-xs uppercase tracking-wider text-text-100 mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 bg-panel-900 border border-line rounded-lg font-mono text-base',
            'placeholder:text-muted-500/50',
            'focus:outline-none focus:border-bronze focus:ring-0',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-bronze',
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 font-mono text-xs text-muted-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 font-mono text-xs text-bronze">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
