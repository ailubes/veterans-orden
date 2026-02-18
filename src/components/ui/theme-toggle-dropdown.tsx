'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';

interface ThemeToggleDropdownProps {
  className?: string;
}

/**
 * Compact dropdown theme toggle
 * Small, clickable dropdown showing current theme
 */
export function ThemeToggleDropdown({ className = '' }: ThemeToggleDropdownProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    return <div className="nav-selector-trigger nav-selector-trigger--skeleton" />;
  }

  const isDark = resolvedTheme === 'dark';
  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
  ];

  return (
    <div className={`nav-selector ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="nav-selector-trigger"
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <span className="nav-selector-icon">{isDark ? '🌙' : '☀️'}</span>
        <svg
          className={`nav-selector-arrow ${isOpen ? 'nav-selector-arrow--open' : ''}`}
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="nav-selector-menu">
          {themes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTheme(t.value);
                setIsOpen(false);
              }}
              className={`nav-selector-item ${
                resolvedTheme === t.value ? 'nav-selector-item--active' : ''
              }`}
            >
              <span className="nav-selector-item-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
