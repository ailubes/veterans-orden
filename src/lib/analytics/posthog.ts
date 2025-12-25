import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';

    if (!apiKey) {
      console.warn('PostHog API key not found');
      return;
    }

    posthog.init(apiKey, {
      api_host: host,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll capture manually with more data
      capture_pageleave: true,  // Track when users leave
      autocapture: false,        // Disable autocapture for privacy
      session_recording: {
        maskAllInputs: true,     // Privacy: mask form inputs
        maskTextSelector: '*',   // Privacy: mask all text by default
      },
      // Web Analytics enhancements
      persistence: 'localStorage', // Persist user data
      property_blacklist: [],      // Don't send sensitive properties
      sanitize_properties: null,   // Custom sanitization if needed
    });

    // Track initial session properties
    posthog.register({
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    });
  }
};

export { posthog };
