import { logger, startHttpSpan } from '@backend/telemetry';
import { applyCorsHeaders, corsPreflightResponse } from '@backend/utils/cors';

/**
 * Middleware System
 *
 * Composable middleware for Bun.serve() route handlers.
 * Middleware runs in order and can short-circuit by returning a Response,
 * or pass through by returning null — augmenting the shared ctx along the way.
 *
 * All handlers wrapped with withMiddleware automatically get:
 * - CORS headers on every response (controlled by CORS_ORIGIN env var)
 * - OPTIONS preflight handling
 * - Request/response logging
 *
 * Usage:
 *   withMiddleware(auth, rateLimit)((req, ctx) => controller.doSomething(req, ctx))
 */

export type BunRequest = Request & { params: Record<string, string> };

/**
 * Shared context passed through the middleware chain.
 * Middleware can attach typed data (e.g. ctx.user) for downstream handlers.
 */
export type Ctx = Record<string, unknown>;

/**
 * A middleware function.
 * Return null to continue the chain, or a Response to short-circuit.
 */
export type MiddlewareFn = (
  req: BunRequest,
  ctx: Ctx,
) => Response | null | Promise<Response | null>;

/**
 * A route handler that receives the request and populated context.
 */
type HandlerFn = (req: BunRequest, ctx: Ctx) => Response | Promise<Response>;

/**
 * A standard Bun.serve() route handler (no ctx — compatible with routes object).
 */
type BunHandler = (req: BunRequest) => Response | Promise<Response>;

const logRequest = (req: Request, res: Response, durationMs: number): void => {
  const ts = new Date().toISOString();
  const path = new URL(req.url).pathname;
  logger.info(
    `[${ts}] ${req.method} ${path} → ${res.status} (${Math.round(durationMs)}ms)`,
  );
};

/**
 * Rebuilds the route template from the actual URL path by replacing dynamic
 * segment *values* with their `:key` placeholder names.
 *
 * @example
 * // req.url = "http://localhost/api/user/42", req.params = { id: "42" }
 * getRouteTemplate(req) // → "/api/user/:id"
 *
 * // req.url = "http://localhost/api/auth/login", req.params = {}
 * getRouteTemplate(req) // → "/api/auth/login"
 */
const getRouteTemplate = (req: BunRequest): string => {
  const path = new URL(req.url).pathname;
  let template = path;
  for (const [key, value] of Object.entries(req.params)) {
    template = template.replace(value, `:${key}`);
  }
  return template;
};

/**
 * Compose middleware functions before a route handler.
 * Each middleware runs in order; the first to return a Response short-circuits the chain.
 * CORS headers, request logging, HTTP traces, and HTTP metrics are applied to
 * every response automatically (traces/metrics are no-ops when OTEL_ENDPOINT is unset).
 *
 * @example
 * withMiddleware(authMiddleware, rateLimitMiddleware)((req, ctx) => {
 *   const user = ctx.user as JWTPayload;
 *   return controller.getProfile(user.sub);
 * })
 */
export const withMiddleware =
  (...middlewares: MiddlewareFn[]) =>
  (handler: HandlerFn): BunHandler =>
  async (req: BunRequest): Promise<Response> => {
    const start = performance.now();
    const path = new URL(req.url).pathname;
    const route = getRouteTemplate(req);

    // Start an HTTP span (no-op when OTEL_ENDPOINT is not set).
    const span = startHttpSpan(req.method, route, path, (name) =>
      req.headers.get(name),
    );

    /** Finalises the request: apply CORS, log, finish span, return response. */
    const finalize = (res: Response): Response => {
      const corsRes = applyCorsHeaders(req, res);
      logRequest(req, corsRes, performance.now() - start);
      span?.finish(corsRes.status);
      return corsRes;
    };

    if (req.method === 'OPTIONS') {
      return finalize(corsPreflightResponse(req));
    }

    const ctx: Ctx = {};

    for (const middleware of middlewares) {
      const result = await middleware(req, ctx);
      if (result !== null) {
        return finalize(result);
      }
    }

    const response = await handler(req, ctx);
    return finalize(response);
  };
