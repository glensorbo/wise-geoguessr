const CORS_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const CORS_HEADERS_ALLOWED = 'Content-Type, Authorization';
const CORS_MAX_AGE = '86400';

const getAllowedOrigin = () => Bun.env.CORS_ORIGIN ?? '*';

const setCorsOriginHeaders = (origin: string, headers: Headers): void => {
  const allowed = getAllowedOrigin();

  if (allowed === '*') {
    headers.set('Access-Control-Allow-Origin', '*');
  } else {
    const origins = allowed.split(',').map((o) => o.trim());
    if (origins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Vary', 'Origin');
    }
  }
};

/**
 * Clones the response and attaches Access-Control headers based on CORS_ORIGIN env var.
 * No-op if the request has no Origin header (e.g. same-origin or server-to-server).
 */
export const applyCorsHeaders = (
  req: Request,
  response: Response,
): Response => {
  const origin = req.headers.get('Origin');
  if (!origin) {
    return response;
  }

  const headers = new Headers(response.headers);
  setCorsOriginHeaders(origin, headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

/**
 * Returns a 204 No Content response for CORS preflight (OPTIONS) requests,
 * with all required Access-Control headers set.
 */
export const corsPreflightResponse = (req: Request): Response => {
  const origin = req.headers.get('Origin') ?? '';
  const headers = new Headers({
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS_ALLOWED,
    'Access-Control-Max-Age': CORS_MAX_AGE,
  });

  setCorsOriginHeaders(origin, headers);

  return new Response(null, { status: 204, headers });
};
