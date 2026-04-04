import { OpenPanel } from '@openpanel/web';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { config } from '@frontend/config';

const { clientId, apiUrl, sessionReplay } = config.openpanel;

export const isEnabled = Boolean(clientId);

export const op = isEnabled
  ? new OpenPanel({
      clientId: clientId!,
      ...(apiUrl ? { apiUrl } : {}),
      trackScreenViews: true,
      trackOutgoingLinks: true,
      trackAttributes: true,
      sessionReplay: {
        enabled: sessionReplay,
        maskAllInputs: true,
        maskAllText: true,
      },
    })
  : null;

/** Tracks a screen_view on every SPA route change. Renders nothing. */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    op?.track('screen_view', { path: location.pathname });
  }, [location.pathname]);

  return null;
};

/**
 * Drop this inside <BrowserRouter> to enable automatic SPA pageview tracking.
 * No-op when BUN_PUBLIC_OPENPANEL_CLIENT_ID is not set.
 */
export const AnalyticsProvider = () => {
  if (!isEnabled) {
    return null;
  }
  return <AnalyticsTracker />;
};
