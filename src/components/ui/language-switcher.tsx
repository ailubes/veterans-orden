'use client';

import { useState, useEffect } from 'react';
import {
  locales,
  localeNames,
  type Locale,
  getCurrentLocale,
  setStoredLocale,
} from '@/i18n/config';

interface LanguageSwitcherProps {
  className?: string;
  onChange?: (locale: Locale) => void;
}

/**
 * Language Switcher - UA/EN toggle for switching between languages
 *
 * Uses localStorage for persistence. When locale changes, the page
 * reloads to fetch new translations.
 */
export function LanguageSwitcher({ className = '', onChange }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('uk');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    if (locale === currentLocale) return;

    setCurrentLocale(locale);
    setStoredLocale(locale);
    onChange?.(locale);

    // Reload the page to fetch new translations
    window.location.reload();
  };

  if (!mounted) {
    // Return placeholder to prevent hydration mismatch
    return (
      <div className={`language-switcher ${className}`}>
        <span className="language-switcher-placeholder" />
      </div>
    );
  }

  return (
    <div className={`language-switcher ${className}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleLocaleChange(locale)}
          className={`language-btn ${currentLocale === locale ? 'active' : ''}`}
          aria-label={`Switch to ${localeNames[locale]}`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}

/**
 * Compact language switcher for navigation bar
 * Styled as a pill toggle matching the design system
 */
export function LanguageSwitcherCompact({ className = '', onChange }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('uk');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    if (locale === currentLocale) return;

    setCurrentLocale(locale);
    setStoredLocale(locale);
    onChange?.(locale);

    // Reload the page to fetch new translations
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className={`language-switcher-compact ${className}`}>
        <span className="language-switcher-compact-placeholder" />
      </div>
    );
  }

  return (
    <div className={`language-switcher-compact ${className}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleLocaleChange(locale)}
          className={`language-btn ${currentLocale === locale ? 'active' : ''}`}
          aria-label={`Switch to ${localeNames[locale]}`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
