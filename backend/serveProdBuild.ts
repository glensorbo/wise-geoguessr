import { join } from 'path';

// Collect all BUN_PUBLIC_* vars from the server's runtime environment and
// inject them into the HTML so the browser can read them via window.__BUN_PUBLIC_ENV.
// This allows env vars to be set on the running container rather than at
// image build time (where they would be baked in as undefined).
const buildPublicEnvScript = (): string => {
  const publicEnv = Object.fromEntries(
    Object.entries(Bun.env).filter(([key]) => key.startsWith('BUN_PUBLIC_')),
  );
  return `<script>window.__BUN_PUBLIC_ENV=${JSON.stringify(publicEnv)};</script>`;
};

const serveHtml = async (htmlPath: string): Promise<Response> => {
  const html = await Bun.file(htmlPath).text();
  const injected = html.replace('</head>', `${buildPublicEnvScript()}</head>`);
  return new Response(injected, { headers: { 'Content-Type': 'text/html' } });
};

export const serveProdBuild = async (pathname: string): Promise<Response> => {
  let filePath = pathname === '/' ? 'index.html' : pathname.slice(1);

  // For client-side routing, serve index.html for non-file requests
  if (!filePath.includes('.')) {
    filePath = 'index.html';
  }

  if (filePath === 'index.html') {
    return serveHtml(join(process.cwd(), 'dist', 'index.html'));
  }

  const fullPath = join(process.cwd(), 'dist', filePath);
  const file = Bun.file(fullPath);

  if (!(await file.exists())) {
    return serveHtml(join(process.cwd(), 'dist', 'index.html'));
  }

  return new Response(file);
};
