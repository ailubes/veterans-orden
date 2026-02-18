'use client';

import { useState, useEffect, useRef } from 'react';
import {
  locales,
  localeNames,
  type Locale,
  getCurrentLocale,
  setStoredLocale,
} from '@/i18n/config';

interface LanguageSwitcherDropdownProps {
  className?: string;
}

/**
 * Compact dropdown language switcher
 * Small, clickable dropdown showing current language
 */
export function LanguageSwitcherDropdown({ className = '' }: LanguageSwitcherDropdownProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('uk');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getCurrentLocale());
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

  const handleLocaleChange = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setStoredLocale(locale);

    // Store in cookie
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `order-veterans-locale=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Reload page
    window.location.reload();
  };

  if (!mounted) {
    return <div className="nav-selector-trigger nav-selector-trigger--skeleton" />;
  }

  return (
    <div className={`nav-selector ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="nav-selector-trigger"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span className="nav-selector-label">{currentLocale.toUpperCase()}</span>
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
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => handleLocaleChange(locale)}
              className={`nav-selector-item ${
                currentLocale === locale ? 'nav-selector-item--active' : ''
              }`}
            >
              <span className="nav-selector-item-icon">{locale === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
              {locale === 'uk' ? 'Українська' : 'English'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
