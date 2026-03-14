import { serve } from 'bun';
import { join } from 'path';

import index from '../public/index.html';

const isProduction = process.env.NODE_ENV === 'production';

// Static file serving for production
const serveStaticFile = async (pathname: string): Promise<Response> => {
  // Remove leading slash and handle root
  let filePath = pathname === '/' ? 'index.html' : pathname.slice(1);

  // For client-side routing, serve index.html for non-file requests
  if (!filePath.includes('.')) {
    filePath = 'index.html';
  }

  const fullPath = join(process.cwd(), 'dist', filePath);
  const file = Bun.file(fullPath);

  // Check if file exists
  const exists = await file.exists();
  if (!exists) {
    // Serve index.html for 404s (client-side routing)
    const indexFile = Bun.file(join(process.cwd(), 'dist', 'index.html'));
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

    // In production, serve built static files; in dev, serve HTML imports
    '/*': isProduction
      ? async (req) => serveStaticFile(new URL(req.url).pathname)
      : index,
  },

  development: !isProduction && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
