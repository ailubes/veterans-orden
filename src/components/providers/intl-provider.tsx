'use client';

import { useState, useEffect } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getCurrentLocale, type Locale } from '@/i18n/config';

interface IntlProviderProps {
  children: React.ReactNode;
  initialMessages: AbstractIntlMessages;
  initialLocale: Locale;
}

/**
 * Client-side IntlProvider that handles locale switching
 *
 * On initial load, it checks localStorage for the user's preferred locale.
 * If different from the server-rendered locale, it dynamically loads
 * the correct messages.
 */
export function IntlProvider({
  children,
  initialMessages,
  initialLocale,
}: IntlProviderProps) {
  const [messages, setMessages] = useState<AbstractIntlMessages>(initialMessages);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocale = async () => {
      const preferredLocale = getCurrentLocale();

      if (preferredLocale !== initialLocale) {
        try {
          const newMessages = await import(`@/messages/${preferredLocale}.json`);
          setMessages(newMessages.default);
          setLocale(preferredLocale);
        } catch (error) {
          console.error('Failed to load locale messages:', error);
        }
      }
      setIsLoading(false);
    };

    loadLocale();
  }, [initialLocale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Kyiv"
    >
      {children}
    </NextIntlClientProvider>
  );
}
