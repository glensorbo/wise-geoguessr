import { join } from 'path';

// BUN_PUBLIC_* vars are inlined by Bun's bundler at build time, which means
// they're empty when the image is built without them (e.g. Coolify supplies
// env vars at runtime, not build time).  To fix this, we inject a small
// <script> block into every HTML response that writes the live values from
// Bun.env into window.__APP_CONFIG__.  frontend/config.ts prefers this object
// over import.meta.env, so runtime values always win.
const runtimeConfigScript = (() => {
  const cfg = {
    BUN_PUBLIC_OPENPANEL_CLIENT_ID:
      Bun.env.BUN_PUBLIC_OPENPANEL_CLIENT_ID ?? '',
    BUN_PUBLIC_OPENPANEL_API_URL: Bun.env.BUN_PUBLIC_OPENPANEL_API_URL ?? '',
    BUN_PUBLIC_OPENPANEL_SESSION_REPLAY:
      Bun.env.BUN_PUBLIC_OPENPANEL_SESSION_REPLAY ?? '',
    BUN_PUBLIC_OTEL_SERVICE_NAME: Bun.env.BUN_PUBLIC_OTEL_SERVICE_NAME ?? '',
  };
  return `<script>window.__APP_CONFIG__=${JSON.stringify(cfg)};</script>`;
})();

const serveHtml = async (htmlPath: string): Promise<Response> => {
  const html = await Bun.file(htmlPath).text();
  const injected = html.replace('</head>', `${runtimeConfigScript}</head>`);
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
