'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useHydrated } from '@/hooks/use-hydrated';
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
  const activeLocale = useLocale();
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null);
  const mounted = useHydrated();
  const [isSwitching, setIsSwitching] = useState(false);
  const runtimeLocale = locales.includes(activeLocale as Locale)
    ? (activeLocale as Locale)
    : mounted
      ? getCurrentLocale()
      : 'uk';
  const currentLocale = pendingLocale ?? runtimeLocale;

  const handleLocaleChange = (locale: Locale) => {
    if (locale === runtimeLocale || isSwitching) return;

    setIsSwitching(true);
    setPendingLocale(locale);

    // Store in localStorage
    setStoredLocale(locale);

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
