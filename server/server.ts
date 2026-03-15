import { serve } from 'bun';
import { join } from 'path';

import {
  filterResultsByYear,
  getAvailableYears,
  loadResults,
  parseYearParam,
} from './data';

const isProduction = process.env.NODE_ENV === 'production';
const index = isProduction
  ? null
  : (await import('../public/index.html')).default;

const createJsonHeaders = () => ({
  'Cache-Control': isProduction ? 'public, max-age=300' : 'no-store',
});

const serveStaticFile = async (
  pathname: string,
  rootDirectory = 'dist',
): Promise<Response> => {
  let filePath = pathname === '/' ? 'index.html' : pathname.slice(1);

  if (!filePath.includes('.')) {
    filePath = 'index.html';
  }

  const fullPath = join(process.cwd(), rootDirectory, filePath);
  const file = Bun.file(fullPath);
  const exists = await file.exists();

  if (!exists) {
    const indexFile = Bun.file(
      join(process.cwd(), rootDirectory, 'index.html'),
    );
    return new Response(indexFile, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new Response(file);
};

const server = serve({
  routes: {
    '/healthcheck': {
      async GET(_req) {
        return new Response('OK');
      },
    },

    '/api/results/years': {
      async GET() {
        const results = await loadResults();
        return Response.json(getAvailableYears(results), {
          headers: createJsonHeaders(),
        });
      },
    },

    '/api/results': {
      async GET(req) {
        const url = new URL(req.url);
        const yearParam = url.searchParams.get('year');
        const year = parseYearParam(yearParam);

        if (yearParam !== null && year === null) {
          return Response.json(
            { error: 'Invalid year parameter. Expected YYYY.' },
            { status: 400, headers: createJsonHeaders() },
          );
        }

        const results = await loadResults();
        const payload =
          year === null ? results : filterResultsByYear(results, year);

        return Response.json(payload, {
          headers: createJsonHeaders(),
        });
      },
    },

    '/*': isProduction
      ? async (req) => serveStaticFile(new URL(req.url).pathname)
      : index!,
  },

  development: !isProduction && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
