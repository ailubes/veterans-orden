import { posthog } from './posthog';

/**
 * Web Analytics Utilities
 *
 * Track traditional web analytics metrics like traffic sources,
 * referrers, bounce rate, session duration, etc.
 */

// Extract UTM parameters from URL
export const getUtmParams = () => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
};

// Get referrer information
export const getReferrerInfo = () => {
  if (typeof window === 'undefined') return {};

  const referrer = document.referrer;

  if (!referrer) {
    return {
      referrer: 'direct',
      referrer_domain: 'direct',
    };
  }

  try {
    const url = new URL(referrer);
    return {
      referrer: referrer,
      referrer_domain: url.hostname,
    };
  } catch {
    return {
      referrer: referrer,
      referrer_domain: 'unknown',
    };
  }
};

// Track page view with enhanced web analytics data
export const trackPageView = (url: string) => {
  const utmParams = getUtmParams();
  const referrerInfo = getReferrerInfo();

  posthog.capture('$pageview', {
    $current_url: url,
    ...utmParams,
    ...referrerInfo,
    page_title: document.title,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  });

  // Store UTM params for the session if present
  if (Object.values(utmParams).some(v => v)) {
    posthog.register(utmParams);
  }

  // Store referrer for the session
  if (referrerInfo.referrer && referrerInfo.referrer !== 'direct') {
    posthog.register_once(referrerInfo);
  }
};

// Track scroll depth
let maxScrollDepth = 0;
let scrollTimeout: NodeJS.Timeout;

export const trackScrollDepth = () => {
  if (typeof window === 'undefined') return;

  const calculateScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrollPercent = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;

      // Track milestones
      if (scrollPercent >= 25 && maxScrollDepth < 25) {
        posthog.capture('scroll_depth_milestone', { depth: 25 });
      } else if (scrollPercent >= 50 && maxScrollDepth < 50) {
        posthog.capture('scroll_depth_milestone', { depth: 50 });
      } else if (scrollPercent >= 75 && maxScrollDepth < 75) {
        posthog.capture('scroll_depth_milestone', { depth: 75 });
      } else if (scrollPercent >= 100 && maxScrollDepth < 100) {
        posthog.capture('scroll_depth_milestone', { depth: 100 });
      }
    }
  };

  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(calculateScrollDepth, 100);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(scrollTimeout);

    // Send final scroll depth on unmount
    if (maxScrollDepth > 0) {
      posthog.capture('page_scroll_depth', {
        max_depth: maxScrollDepth,
        page: window.location.pathname,
      });
    }

    // Reset for next page
    maxScrollDepth = 0;
  };
};

// Track time on page
let pageStartTime: number;

export const startTimeOnPage = () => {
  pageStartTime = Date.now();
};

export const trackTimeOnPage = (pagePath: string) => {
  if (!pageStartTime) return;

  const timeSpent = Math.round((Date.now() - pageStartTime) / 1000); // in seconds

  // Only track if user spent more than 5 seconds
  if (timeSpent >= 5) {
    posthog.capture('time_on_page', {
      page: pagePath,
      time_seconds: timeSpent,
      time_minutes: Math.round(timeSpent / 60),
    });
  }
};

// Track external link clicks
export const trackExternalLink = (url: string, linkText?: string) => {
  posthog.capture('external_link_clicked', {
    url,
    link_text: linkText,
    page: window.location.pathname,
  });
};

// Track file downloads
export const trackDownload = (fileName: string, fileType: string) => {
  posthog.capture('file_downloaded', {
    file_name: fileName,
    file_type: fileType,
    page: window.location.pathname,
  });
};

// Track search queries
export const trackSearch = (query: string, resultsCount?: number) => {
  posthog.capture('search_performed', {
    query,
    results_count: resultsCount,
    page: window.location.pathname,
  });
};

// Track 404 errors
export const track404Error = (attemptedPath: string) => {
  posthog.capture('404_error', {
    attempted_path: attemptedPath,
    referrer: document.referrer || 'direct',
  });
};

// Track exit intent (when mouse leaves viewport)
export const trackExitIntent = () => {
  if (typeof window === 'undefined') return;

  let exitIntentTracked = false;

  const handleMouseLeave = (e: MouseEvent) => {
    if (e.clientY <= 0 && !exitIntentTracked) {
      exitIntentTracked = true;
      posthog.capture('exit_intent', {
        page: window.location.pathname,
        time_on_page: pageStartTime
          ? Math.round((Date.now() - pageStartTime) / 1000)
          : 0,
      });
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    document.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Track form interactions
export const trackFormStart = (formName: string) => {
  posthog.capture('form_started', {
    form_name: formName,
    page: window.location.pathname,
  });
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  posthog.capture('form_submitted', {
    form_name: formName,
    success,
    page: window.location.pathname,
  });
};

export const trackFormAbandonment = (formName: string, completedFields: number, totalFields: number) => {
  posthog.capture('form_abandoned', {
    form_name: formName,
    completed_fields: completedFields,
    total_fields: totalFields,
    completion_rate: Math.round((completedFields / totalFields) * 100),
    page: window.location.pathname,
  });
};

// Track CTA (Call to Action) clicks
export const trackCTAClick = (ctaName: string, ctaLocation: string, ctaDestination?: string) => {
  posthog.capture('cta_clicked', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    cta_destination: ctaDestination,
    page: window.location.pathname,
  });
};

// Track video interactions
export const trackVideoPlay = (videoTitle: string, videoUrl: string) => {
  posthog.capture('video_played', {
    video_title: videoTitle,
    video_url: videoUrl,
    page: window.location.pathname,
  });
};

export const trackVideoComplete = (videoTitle: string, videoUrl: string, duration: number) => {
  posthog.capture('video_completed', {
    video_title: videoTitle,
    video_url: videoUrl,
    duration_seconds: duration,
    page: window.location.pathname,
  });
};

// Track session start (first page view)
export const trackSessionStart = () => {
  const isNewSession = !sessionStorage.getItem('posthog_session_started');

  if (isNewSession) {
    sessionStorage.setItem('posthog_session_started', 'true');

    posthog.capture('session_started', {
      ...getUtmParams(),
      ...getReferrerInfo(),
      landing_page: window.location.pathname,
    });
  }
};

// Automatically track session on first load
if (typeof window !== 'undefined') {
  trackSessionStart();
}
