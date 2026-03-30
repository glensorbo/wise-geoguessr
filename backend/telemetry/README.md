# 🔭 Telemetry

Optional OpenTelemetry (OTel) observability for the Bun backend and browser frontend.

When `OTEL_ENDPOINT` is **not** set, the module is a complete no-op — zero overhead, no SDK started, no network connections.

When `OTEL_ENDPOINT` **is** set, the module starts three signal pipelines via OTLP HTTP.

---

## Quick Start

### With the local SigNoz stack (recommended for development)

A full SigNoz stack is included in the repo — ClickHouse, Zookeeper, the SigNoz UI, and the OTel Collector. All data is persisted in named Docker volumes so it survives restarts.

1. Start SigNoz:

   ```sh
   docker compose -f docker-compose.signoz.yml up -d
   ```

2. Wait ~30 s for ClickHouse to become healthy, then open [http://localhost:8080](http://localhost:8080).

3. Uncomment the OTel vars in your `.env`:

   ```
   OTEL_ENDPOINT=http://localhost:4318
   OTEL_SERVICE_NAME=wise-geoguessr
   ```

   For frontend browser tracing, also set:

   ```
   BUN_PUBLIC_OTEL_SERVICE_NAME=wise-geoguessr-frontend
   ```

4. Start the dev server — you should see:

   ```
   🔭 OpenTelemetry enabled → http://localhost:4318 (service: wise-geoguessr)
   ```

5. To stop SigNoz (data is preserved in volumes):

   ```sh
   docker compose -f docker-compose.signoz.yml down
   ```

6. To stop **and** wipe all data:

   ```sh
   docker compose -f docker-compose.signoz.yml down -v
   ```

### With an external collector

Set `OTEL_ENDPOINT` in your `.env` pointing at any OTLP HTTP collector:

```
OTEL_ENDPOINT=http://<your-collector>:4318
OTEL_SERVICE_NAME=wise-geoguessr   # optional, defaults to "wise-geoguessr"
```

Port **4318** (OTLP HTTP) — not 4317 (gRPC).

---

## Environment Variables

| Variable                       | Required | Default          | Description                                                                      |
| ------------------------------ | -------- | ---------------- | -------------------------------------------------------------------------------- |
| `OTEL_ENDPOINT`                | No       | —                | OTLP HTTP base URL (e.g. `http://localhost:4318`). OTel is disabled when absent. |
| `OTEL_SERVICE_NAME`            | No       | `wise-geoguessr` | Service name reported in all backend signals.                                    |
| `BUN_PUBLIC_OTEL_SERVICE_NAME` | No       | —                | Service name for browser spans. Frontend tracing is disabled when absent.        |

---

## Signals

| Signal  | Exporter                    | Endpoint path                |
| ------- | --------------------------- | ---------------------------- |
| Traces  | `OTLPTraceExporter` (HTTP)  | `{OTEL_ENDPOINT}/v1/traces`  |
| Metrics | `OTLPMetricExporter` (HTTP) | `{OTEL_ENDPOINT}/v1/metrics` |
| Logs    | `OTLPLogExporter` (HTTP)    | `{OTEL_ENDPOINT}/v1/logs`    |

---

## HTTP Tracing (automatic)

All routes wrapped with `withMiddleware()` automatically create HTTP server spans — no code changes needed in routes or controllers.

Each span includes:

- **Name:** `{METHOD} {route}` — e.g. `GET /api/user/:id`
- **Attributes:** `http.request.method`, `http.route`, `url.path`, `http.response.status_code`
- **W3C `traceparent` extraction** — if the request carries a `traceparent` header (e.g. injected by the browser frontend), the server span is automatically parented to the upstream span

---

## Metrics (automatic)

`withMiddleware()` records two instruments for every HTTP request:

| Instrument                     | Type      | Unit | Labels                                                           |
| ------------------------------ | --------- | ---- | ---------------------------------------------------------------- |
| `http.server.request.duration` | Histogram | ms   | `http.request.method`, `http.route`, `http.response.status_code` |
| `http.server.request.count`    | Counter   | —    | `http.request.method`, `http.route`, `http.response.status_code` |

Metrics are exported every **30 seconds**.

---

## Frontend Tracing

Browser-side tracing lives in `frontend/telemetry/telemetry.ts`. When `BUN_PUBLIC_OTEL_SERVICE_NAME` is set, every `fetch()` call — including RTK Query requests — gets a span automatically. W3C `traceparent` headers are injected into outgoing requests so backend spans appear as children of the browser span in the trace waterfall.

Spans are **not** sent directly to the OTel collector from the browser. Instead, they are forwarded through the backend proxy at `POST /api/telemetry/traces`, which relays them server-side to `{OTEL_ENDPOINT}/v1/traces`. This keeps the collector off the public internet and removes the need for CORS on the collector.

**Setup:**

1. Set `BUN_PUBLIC_OTEL_SERVICE_NAME=wise-geoguessr-frontend` in your `.env`

**CORS:** No collector CORS configuration is needed. The browser talks only to the backend proxy.

---

## Collector Examples

| Collector                        | `OTEL_ENDPOINT`              |
| -------------------------------- | ---------------------------- |
| SigNoz (self-hosted, bundled)    | `http://localhost:4318`      |
| Jaeger (OTLP receiver enabled)   | `http://localhost:4318`      |
| OpenTelemetry Collector (Docker) | `http://otel-collector:4318` |

---

## Using the Logger

Import `logger` anywhere in the backend — it always writes to `console.*` and, when OTel is enabled, also emits structured log records to the collector.

```ts
import { logger } from '@backend/telemetry';

logger.info('Server started');
logger.warn('Slow query', { durationMs: 1234, query: 'SELECT ...' });
logger.error('Unhandled error', { error: String(err) });
logger.debug('Cache hit', { key: 'user:42' });
```

| Method                      | Console         | OTel Severity |
| --------------------------- | --------------- | ------------- |
| `logger.info(msg, attrs?)`  | `console.log`   | `INFO`        |
| `logger.warn(msg, attrs?)`  | `console.warn`  | `WARN`        |
| `logger.error(msg, attrs?)` | `console.error` | `ERROR`       |
| `logger.debug(msg, attrs?)` | `console.debug` | `DEBUG`       |

---

## Adding Custom Spans

Span creation helpers must live in `backend/telemetry/index.ts` and be exported from `@backend/telemetry`.

Service-layer code **must not** import from `@opentelemetry/*` directly. Add a helper to `backend/telemetry/index.ts` and import it from `@backend/telemetry` instead.

Inside `backend/telemetry/index.ts` only, the tracer is obtained via:

```ts
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('wise-geoguessr');
```

---

## Initialisation Order

`initTelemetry()` **must be called before any module that logs**, so it is invoked at the very top of `backend/server.ts` before `validateEnv()` and `pingDb()`.
