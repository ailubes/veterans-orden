'use client';

import { Suspense } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { ThemeProvider } from '@/lib/themes/ThemeProvider';
import { TinaProvider } from '@/lib/tina/TinaProvider';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <Suspense fallback={null}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Kyiv">
        <PostHogProvider>
          <ThemeProvider>
            <TinaProvider>
              {children}
            </TinaProvider>
          </ThemeProvider>
        </PostHogProvider>
      </NextIntlClientProvider>
    </Suspense>
  );
}
