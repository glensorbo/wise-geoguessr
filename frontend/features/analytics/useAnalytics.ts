import rybbit from '@rybbit/js';

import { config } from '@frontend/config';

const isEnabled = Boolean(config.rybbit.host && config.rybbit.siteId);

/**
 * Hook for tracking custom analytics events.
 * Always safe to call — no-op when Rybbit is not configured.
 */
export const useAnalytics = () => ({
  trackEvent: (
    name: string,
    props?: Record<string, string | number | boolean>,
  ) => {
    if (isEnabled) {
      rybbit.event(name, props);
    }
  },
  trackPageview: () => {
    if (isEnabled) {
      rybbit.pageview();
    }
  },
});
