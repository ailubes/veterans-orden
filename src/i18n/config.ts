/**
 * i18n Configuration
 *
 * Defines supported locales and default locale for the application.
 * Uses localStorage for persistence on client-side.
 */

export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'uk';

export const localeNames: Record<Locale, string> = {
  uk: 'UA',
  en: 'EN',
};

export const localeFullNames: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
};

// Storage key for persisting locale preference
export const LOCALE_STORAGE_KEY = 'order-veterans-locale';

/**
 * Get the stored locale from localStorage (client-side only)
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  return null;
}

/**
 * Store the locale preference in localStorage
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

/**
 * Detect user's preferred locale from browser settings
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language.split('-')[0];
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  return defaultLocale;
}

/**
 * Get the current locale with fallback chain:
 * 1. Stored preference
 * 2. Browser language
 * 3. Default locale
 */
export function getCurrentLocale(): Locale {
  const stored = getStoredLocale();
  if (stored) return stored;

  return detectBrowserLocale();
}
