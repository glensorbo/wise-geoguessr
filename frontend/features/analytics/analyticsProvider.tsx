import rybbit from '@rybbit/js';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { config } from '@frontend/config';

const { host, siteId } = config.rybbit;
const isEnabled = Boolean(host && siteId);

/**
 * Module-level promise so init only runs once per page load.
 * Resolves when the Rybbit SDK has finished initialising (including its
 * remote config fetch).  Pageview tracking is gated on this promise to
 * avoid the race where rybbit.pageview() fires while rybbit.init() is
 * still awaiting its HTTP round-trip and `m` (the internal "ready" flag)
 * is still false — which would silently drop the event with no network
 * request.
 */
let initPromise: Promise<void> | null = null;
if (isEnabled) {
  initPromise = rybbit.init({ analyticsHost: host!, siteId: siteId! });
}

/** Tracks a pageview on every route change. Renders nothing. */
const AnalyticsTracker = () => {
  const location = useLocation();

  // `ready` becomes true once initPromise resolves.  All tracking is
  // gated on this flag so we never call rybbit.pageview() before the SDK
  // has finished initialising.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initPromise?.then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) {
      rybbit.pageview();
    }
  }, [location.pathname, ready]);

  return null;
};

/**
 * Drop this inside <BrowserRouter> to enable automatic SPA pageview tracking.
 * No-op when BUN_PUBLIC_RYBBIT_HOST / BUN_PUBLIC_RYBBIT_SITE_ID are not set.
 */
export const AnalyticsProvider = () => {
  if (!isEnabled) {
    return null;
  }
  return <AnalyticsTracker />;
};
