import { logger } from '@backend/telemetry';

/**
 * Telemetry Controller
 *
 * Thin proxy that forwards OTLP JSON payloads from the browser to the
 * configured OTel collector on the server side.  Moving the forward
 * server-side eliminates the need for CORS on the collector and keeps the
 * collector endpoint off the public internet.
 */
export const telemetryController = {
  /**
   * Handle POST /api/telemetry/traces
   *
   * Receives a raw OTLP JSON trace payload from the browser and forwards it
   * verbatim to `{OTEL_ENDPOINT}/v1/traces`.  The collector's HTTP status is
   * passed back to the caller so the browser exporter can apply its normal
   * retry / back-off logic.
   *
   * Returns 204 immediately when OTEL_ENDPOINT is not set (no-op).
   */
  async proxyTraces(req: Request): Promise<Response> {
    const endpoint = Bun.env['OTEL_ENDPOINT'];

    if (!endpoint) {
      return new Response(null, { status: 204 });
    }

    try {
      const body = await req.arrayBuffer();

      const collectorResponse = await fetch(`${endpoint}/v1/traces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      return new Response(null, { status: collectorResponse.status });
    } catch (err) {
      logger.error('Failed to proxy traces to OTel collector', {
        error: String(err),
      });
      return new Response(null, { status: 502 });
    }
  },
};
