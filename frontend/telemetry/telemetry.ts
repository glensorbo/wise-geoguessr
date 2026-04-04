/**
 * Frontend (browser) OpenTelemetry tracing.
 *
 * Opt-in: only activates when BUN_PUBLIC_OTEL_SERVICE_NAME is set.
 * When the variable is absent the module is a complete no-op — no SDK is
 * loaded, no network connections are made.
 *
 * Spans are forwarded to the backend proxy at `/api/telemetry/traces` rather
 * than directly to the OTel collector.  This keeps the collector off the
 * public internet and removes the need for CORS on the collector.
 *
 * What gets instrumented automatically once enabled:
 *  - Every `fetch()` call (including RTK Query API requests) → a span with
 *    `http.method`, `http.url`, and `http.status_code` attributes.
 *  - W3C `traceparent` / `tracestate` headers are injected into outgoing
 *    requests so the backend can create child spans and link them to the
 *    same trace.
 *
 * Usage: call `initFrontendTelemetry()` once, before the React app renders
 * (i.e. at the top of `frontend/main.tsx`).
 */

import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { config } from '@frontend/config';

// The OTLP HTTP exporter is imported lazily inside the function to ensure the
// export happens only when OTel is actually being initialised.
// (tree-shakers drop it when initFrontendTelemetry() is never called with a
//  valid endpoint, which currently cannot happen, but it signals intent.)

/**
 * Initialises browser-side OpenTelemetry tracing.
 *
 * Call this **once** before mounting the React app. Safe to call multiple
 * times — subsequent calls are no-ops (the provider is only registered once).
 *
 * Spans are sent to the backend proxy (`/api/telemetry/traces`) which
 * forwards them to the OTel collector server-side.  No CORS configuration
 * on the collector is required.
 */
export const initFrontendTelemetry = async (): Promise<void> => {
  const serviceName = config.otel.serviceName;
  if (!serviceName) {
    console.log('🔭 Frontend OTel disabled');
    return;
  }

  // Dynamic import keeps the OTel exporter out of the critical path when OTel
  // is disabled (the import is evaluated only when the endpoint is set).
  const { OTLPTraceExporter } =
    await import('@opentelemetry/exporter-trace-otlp-http');

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: '/api/telemetry/traces',
        }),
      ),
    ],
  });

  // Register the provider and the default W3C trace-context + baggage
  // propagators.  After this call, FetchInstrumentation will automatically
  // inject `traceparent` headers into every outgoing `fetch()`.
  provider.register();

  // Instrument the global fetch — captures RTK Query, raw fetch(), etc.
  const fetchInstrumentation = new FetchInstrumentation({
    // Propagate trace context to the backend.  The backend's withMiddleware
    // extracts these headers and parents its server span to the browser span.
    propagateTraceHeaderCorsUrls: [/.*/],
    // Clear timing resources after collection to avoid memory buildup.
    clearTimingResources: true,
  });
  fetchInstrumentation.setTracerProvider(provider);
  fetchInstrumentation.enable();

  console.log(
    `🔭 Frontend OTel enabled → /api/telemetry/traces (service: ${serviceName})`,
  );
};
