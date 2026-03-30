/**
 * Entry point for the React app. Sets up global providers and mounts the root.
 * Included in `public/index.html`.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { AuthProvider } from './providers/authProvider';
import { ThemeProvider } from './providers/themeProvider';
import { ToastProvider } from './providers/toastProvider';
import { store } from './redux/store';
import { AppRouter } from './router';
import { ErrorBoundary } from './shared/components/errorBoundary';
import { initFrontendTelemetry } from '@frontend/telemetry/telemetry';

// Start browser-side OTel tracing before the app renders.
// No-op (async import skipped) when BUN_PUBLIC_OTEL_ENDPOINT is not set.
void initFrontendTelemetry();

const elem = document.getElementById('root')!;
const app = (
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
