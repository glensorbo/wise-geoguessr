import { telemetryController } from '@backend/controllers/telemetryController';
import { withMiddleware } from '@backend/middleware';

/**
 * Telemetry Routes
 *
 * Proxy endpoints that forward browser OTLP payloads to the real OTel
 * collector on the server side.  No auth is required — telemetry is
 * low-sensitivity and the browser exporter cannot supply bearer tokens.
 *
 * Spread into Bun.serve() routes: { ...telemetryRoutes }
 */
export const telemetryRoutes = {
  '/api/telemetry/traces': {
    POST: withMiddleware()((req) => telemetryController.proxyTraces(req)),
  },
};
