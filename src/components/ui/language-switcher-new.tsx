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
}

/**
 * Modern Language Switcher with better UX
 *
 * Features:
 * - Clear visual feedback
 * - Smooth animations
 * - Loading state during switch
 * - Better cookie handling
 */
export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('uk');
  const [mounted, setMounted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    if (locale === currentLocale || isSwitching) return;

    setIsSwitching(true);
    setCurrentLocale(locale);

    // Store in localStorage
    setStoredLocale(locale);

    // Store in cookie with proper settings
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `order-veterans-locale=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

    // Small delay to show loading state, then reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <div className={`lang-switcher-skeleton ${className}`}>
        <div className="lang-switcher-skeleton-pill" />
      </div>
    );
  }

  return (
    <div className={`lang-switcher ${className}`}>
      <div className="lang-switcher-track">
        {/* Active indicator background */}
        <div
          className={`lang-switcher-indicator ${
            currentLocale === 'en' ? 'lang-switcher-indicator--right' : ''
          }`}
          style={{
            opacity: isSwitching ? 0.5 : 1,
          }}
        />

        {/* Language buttons */}
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => handleLocaleChange(locale)}
            disabled={isSwitching}
            className={`lang-switcher-btn ${
              currentLocale === locale ? 'lang-switcher-btn--active' : ''
            }`}
            aria-label={`Switch to ${locale === 'uk' ? 'Ukrainian' : 'English'}`}
            aria-pressed={currentLocale === locale}
          >
            {isSwitching && currentLocale === locale ? (
              <span className="lang-switcher-spinner" />
            ) : (
              localeNames[locale]
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact version for navigation bar
 */
export function LanguageSwitcherCompact({ className = '' }: LanguageSwitcherProps) {
  return <LanguageSwitcher className={`lang-switcher--compact ${className}`} />;
}
