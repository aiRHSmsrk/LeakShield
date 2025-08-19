import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { track } from '@vercel/analytics';

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    track('page_view', {
      page: location.pathname,
      title: document.title,
    });
  }, [location.pathname]);
}

export function useAnalyticsEvents() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    track(eventName, properties);
  };

  return { trackEvent };
}
