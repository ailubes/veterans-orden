'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog } from '@/lib/analytics/posthog';
import {
  trackPageView,
  trackScrollDepth,
  startTimeOnPage,
  trackTimeOnPage,
  trackSessionStart,
} from '@/lib/analytics/web-analytics';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize PostHog on mount
    initPostHog();

    // Track session start
    trackSessionStart();
  }, []);

  useEffect(() => {
    // Track pageviews with enhanced web analytics
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }

      // Track previous page time on page
      const previousPath = sessionStorage.getItem('current_path');
      if (previousPath && previousPath !== pathname) {
        trackTimeOnPage(previousPath);
      }

      // Track new page view
      trackPageView(url);
      startTimeOnPage();

      // Store current path
      sessionStorage.setItem('current_path', pathname);

      // Track scroll depth for this page
      const cleanup = trackScrollDepth();

      return cleanup;
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
