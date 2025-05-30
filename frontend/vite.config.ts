/// <reference types="vitest" />
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const useHttps = env.VITE_REACT_APP_USE_HTTPS;

  let protocol = '';
  if (useHttps === 'true') {
    protocol = 'https';
  } else if (useHttps === 'false') {
    protocol = 'http';
  } else if (process.platform === 'win32') {
    protocol = 'https';
  } else {
    protocol = 'http';
  }

  return {
    plugins: [
      react({
        //babel: {
        //  plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
        //},
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.mjs',
    },
    html: {
      cspNonce: 'NGINX_CSP_NONCE',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `${protocol}://localhost:44303`,
          secure: false,
        },
      },
    },
  };
});
