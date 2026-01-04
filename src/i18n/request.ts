import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

/**
 * Server-side request configuration for next-intl
 *
 * This function is called on each request to determine which locale
 * and messages to use. Since we're not using URL-based locale routing,
 * we default to Ukrainian and let the client-side handle switching.
 */
export default getRequestConfig(async () => {
  // For server-side rendering, we use the default locale
  // Client-side will handle locale switching with localStorage
  const locale: Locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
