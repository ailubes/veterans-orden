'use client';

import { Suspense } from 'react';
import { PostHogProvider } from '@/components/providers/posthog-provider';
import { ThemeProvider } from '@/lib/themes/ThemeProvider';
import { TinaProvider } from '@/lib/tina/TinaProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={null}>
      <PostHogProvider>
        <ThemeProvider>
          <TinaProvider>
            {children}
          </TinaProvider>
        </ThemeProvider>
      </PostHogProvider>
    </Suspense>
  );
}
