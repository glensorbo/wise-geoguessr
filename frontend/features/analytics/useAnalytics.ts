import { isEnabled, op } from '@frontend/features/analytics/analyticsProvider';

/**
 * Hook for tracking custom analytics events.
 * Always safe to call — no-op when OpenPanel is not configured.
 */
export const useAnalytics = () => ({
  trackEvent: (
    name: string,
    props?: Record<string, string | number | boolean>,
  ) => {
    if (isEnabled) {
      op?.track(name, props);
    }
  },
  identify: (
    profileId: string,
    traits?: Record<string, string | number | boolean>,
  ) => {
    if (isEnabled) {
      op?.identify({ profileId, ...traits });
    }
  },
  clearIdentity: () => {
    if (isEnabled) {
      op?.clear();
    }
  },
});
