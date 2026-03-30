import {
  context,
  metrics,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_SERVICE_NAME,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions';

import type { Counter, Histogram } from '@opentelemetry/api';
import type {
  AnyValueMap,
  Logger as OtelLogger,
} from '@opentelemetry/api-logs';

type LogAttrs = AnyValueMap;

/** Opaque handle returned by startHttpSpan — call finish() when the response is ready. */
type SpanHandle = {
  /** Records the response status code, sets the span status, and ends the span. */
  finish: (statusCode: number) => void;
};

// ---------------------------------------------------------------------------
// Internal state — set by initTelemetry()
// ---------------------------------------------------------------------------
const SERVICE_NAME = 'bun-boiler';

/** True once initTelemetry() has registered providers. */
let _enabled = false;

/** OTel logger for structured log shipping. */
let otelLogger: OtelLogger | null = null;

/** HTTP request duration histogram (ms). Null when OTel is disabled. */
let _reqDuration: Histogram | null = null;

/** HTTP request count counter. Null when OTel is disabled. */
let _reqCount: Counter | null = null;

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

export const initTelemetry = (): void => {
  const endpoint = Bun.env.OTEL_ENDPOINT;
  if (!endpoint) {
    return;
  }

  const serviceName = Bun.env.OTEL_SERVICE_NAME ?? SERVICE_NAME;

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  });

  // --- Traces ---
  const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
      ),
    ],
  });
  // register() sets the global TracerProvider AND the default W3C propagator
  tracerProvider.register();

  // --- Metrics ---
  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: `${endpoint}/v1/metrics` }),
        exportIntervalMillis: 30_000,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  // Pre-build instruments — cheap to keep around.
  const meter = meterProvider.getMeter(serviceName);
  _reqDuration = meter.createHistogram('http.server.request.duration', {
    description: 'Duration of inbound HTTP requests in milliseconds.',
    unit: 'ms',
  });
  _reqCount = meter.createCounter('http.server.request.count', {
    description: 'Total number of inbound HTTP requests.',
  });

  // --- Logs ---
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({ url: `${endpoint}/v1/logs` }),
      ),
    ],
  });

  otelLogger = loggerProvider.getLogger(serviceName);
  _enabled = true;

  console.log(
    `🔭 OpenTelemetry enabled → ${endpoint} (service: ${serviceName})`,
  );
};

// ---------------------------------------------------------------------------
// HTTP span helper (used by withMiddleware — keeps OTel imports in this file)
// ---------------------------------------------------------------------------

/**
 * Starts an HTTP server span for an inbound request.
 *
 * - Extracts the incoming W3C `traceparent` / `tracestate` headers so the
 *   span is automatically parented to any upstream trace (e.g. a browser
 *   span sent by the frontend).
 * - Returns a {@link SpanHandle} whose `finish()` sets the HTTP status code,
 *   marks errors, records metrics, and ends the span.
 * - Returns `null` when OTel is disabled so callers skip everything cheaply.
 *
 * @param method  HTTP method (upper-case, e.g. "GET")
 * @param route   Route template (e.g. "/api/user/:id")
 * @param path    Actual URL path (e.g. "/api/user/42")
 * @param getHeader  Header accessor from the incoming Request
 */
export const startHttpSpan = (
  method: string,
  route: string,
  path: string,
  getHeader: (name: string) => string | null,
): SpanHandle | null => {
  if (!_enabled) {
    return null;
  }

  // Extract parent context from W3C traceparent / tracestate headers.
  const carrier: Record<string, string> = {};
  const traceparent = getHeader('traceparent');
  const tracestate = getHeader('tracestate');
  if (traceparent) {
    carrier['traceparent'] = traceparent;
  }
  if (tracestate) {
    carrier['tracestate'] = tracestate;
  }

  const parentCtx = propagation.extract(context.active(), carrier);

  const spanName = `${method} ${route}`;
  const tracer = trace.getTracer(SERVICE_NAME);

  const span = tracer.startSpan(
    spanName,
    {
      attributes: {
        [ATTR_HTTP_REQUEST_METHOD]: method,
        [ATTR_HTTP_ROUTE]: route,
        [ATTR_URL_PATH]: path,
      },
    },
    parentCtx,
  );

  const startMs = performance.now();

  return {
    finish: (statusCode: number): void => {
      const durationMs = performance.now() - startMs;

      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, statusCode);

      if (statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      span.end();

      // Record metrics with low-cardinality labels.
      const labels = {
        [ATTR_HTTP_REQUEST_METHOD]: method,
        [ATTR_HTTP_ROUTE]: route,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode,
      };
      _reqDuration?.record(durationMs, labels);
      _reqCount?.add(1, labels);
    },
  };
};

const emit = (
  severity: SeverityNumber,
  severityText: string,
  message: string,
  attrs?: LogAttrs,
): void => {
  if (!otelLogger) {
    return;
  }
  otelLogger.emit({
    severityNumber: severity,
    severityText,
    body: message,
    attributes: attrs,
  });
};

export const logger = {
  info: (message: string, attrs?: LogAttrs): void => {
    if (attrs) {
      console.log(message, attrs);
    } else {
      console.log(message);
    }
    emit(SeverityNumber.INFO, 'INFO', message, attrs);
  },

  warn: (message: string, attrs?: LogAttrs): void => {
    if (attrs) {
      console.warn(message, attrs);
    } else {
      console.warn(message);
    }
    emit(SeverityNumber.WARN, 'WARN', message, attrs);
  },

  error: (message: string, attrs?: LogAttrs): void => {
    if (attrs) {
      console.error(message, attrs);
    } else {
      console.error(message);
    }
    emit(SeverityNumber.ERROR, 'ERROR', message, attrs);
  },

  debug: (message: string, attrs?: LogAttrs): void => {
    if (attrs) {
      console.debug(message, attrs);
    } else {
      console.debug(message);
    }
    emit(SeverityNumber.DEBUG, 'DEBUG', message, attrs);
  },
};
