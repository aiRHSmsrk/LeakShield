import React from 'react';
import { usePageView } from '../../hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  usePageView();
  return <>{children}</>;
}
