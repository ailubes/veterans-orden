import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { defaultLocale, type Locale, locales, LOCALE_STORAGE_KEY } from './config';

/**
 * Server-side request configuration for next-intl
 *
 * This function is called on each request to determine which locale
 * and messages to use. It now checks the Accept-Language header and
 * cookies to provide proper server-side rendering for the user's locale.
 */
export default getRequestConfig(async () => {
  // Try to get locale from cookie (set by client-side)
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';
  const localeCookie = cookieHeader
    .split(';')
    .find((c) => c.trim().startsWith(`${LOCALE_STORAGE_KEY}=`))
    ?.split('=')[1];

  let locale: Locale = defaultLocale;

  // Check if the cookie locale is valid
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else {
    // Fallback to Accept-Language header
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const browserLang = acceptLanguage.split(',')[0]?.split('-')[0];
      if (browserLang && locales.includes(browserLang as Locale)) {
        locale = browserLang as Locale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
