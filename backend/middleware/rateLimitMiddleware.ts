import { tooManyRequestsError } from '@backend/utils/response';

import type { MiddlewareFn } from '.';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window. */
  max: number;
  /** Time window in milliseconds. */
  windowMs: number;
  /** Optional custom error message. */
  message?: string;
}

/**
 * In-memory rate limiter middleware factory.
 * Tracks request counts per IP address within a sliding window.
 *
 * ⚠️  This is single-instance only. For multi-instance deployments,
 *     replace the store with a shared Redis-backed implementation.
 *
 * @example
 * const authRateLimit = createRateLimitMiddleware({ max: 10, windowMs: 60_000 });
 * withMiddleware(authRateLimit)((req) => controller.login(req))
 */
export const createRateLimitMiddleware = (
  options: RateLimitOptions,
): MiddlewareFn => {
  const store = new Map<string, RateLimitEntry>();

  return (req, _ctx) => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('cf-connecting-ip') ??
      'unknown';

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + options.windowMs });
      return Promise.resolve(null);
    }

    entry.count++;

    if (entry.count > options.max) {
      return Promise.resolve(
        tooManyRequestsError(
          options.message ?? 'Too many requests — please try again later',
        ),
      );
    }

    return Promise.resolve(null);
  };
};

/** 10 requests per minute — applied to public auth endpoints. */
export const authRateLimit = createRateLimitMiddleware({
  max: 10,
  windowMs: 60_000,
});
