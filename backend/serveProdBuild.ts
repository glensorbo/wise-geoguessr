import { join } from 'path';

export const serveProdBuild = async (pathname: string): Promise<Response> => {
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
