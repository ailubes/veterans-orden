'use client';

import { Suspense } from 'react';
import { PostHogProvider } from '@/components/providers/posthog-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Suspense fallback={null}>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </Suspense>
  );
}
