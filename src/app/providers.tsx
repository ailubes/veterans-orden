'use client';

import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ThemeProvider } from '@/lib/themes/ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Kyiv">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
