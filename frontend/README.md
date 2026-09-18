# ⚛️ Frontend

React 19 frontend built and served by Bun with zero configuration — no Vite, no Webpack.

## 📁 Structure

```
frontend/
├── config.ts       # Single source of truth for all BUN_PUBLIC_* env vars
├── main.tsx        # Entry point — mounts React root, handles HMR
├── App.tsx         # Root application component
└── test-setup.ts   # Registers happy-dom globally for all tests
```

## 🔧 How It Works

### Development

`backend/server.ts` imports `public/index.html` directly and serves it via `Bun.serve()`. Bun automatically transpiles any `.tsx`/`.ts` files referenced in the HTML and enables HMR:

```ts
import index from '../public/index.html';
// ...
'/*': index  // Bun handles bundling + HMR automatically
```

`main.tsx` uses `import.meta.hot` to preserve the React root between hot reloads:

```ts
if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
}
```

### Production

`bun run build` runs `build.ts`, which scans `frontend/` for all `.html` files, runs them through Bun's bundler with the React Compiler plugin, and outputs minified assets to `dist/`. The backend then serves from `dist/` with SPA fallback.

## 🛡️ Error Handling

`frontend/shared/components/errorBoundary.tsx` wraps the app root. If a component throws during render, the boundary catches it and displays a fallback UI with a **Reset** button. Import and use `<ErrorBoundary>` from `@frontend/shared/components/errorBoundary`.

## 💀 Loading States

Prefer **skeleton loaders** over spinners for content that maps to a known layout. Shared skeletons live in `frontend/shared/components/skeleton.tsx`:

| Component       | Use case                           |
| --------------- | ---------------------------------- |
| `TableSkeleton` | Data tables while rows are loading |
| `ListSkeleton`  | List items while data is fetching  |
| `CardSkeleton`  | Card/panel content                 |

Import from `@frontend/shared/components/skeleton`.

## 🧪 Testing

Frontend tests use `happy-dom` for DOM APIs. It's registered globally via `frontend/test-setup.ts`, which is preloaded by Bun for all tests (configured in `bunfig.toml`):

```toml
[test]
preload = ["./frontend/test-setup.ts"]
```

## ⚙️ React Compiler

The build pipeline includes the React Compiler (`babel-plugin-react-compiler`), which automatically optimises components. The ESLint plugin (`eslint-plugin-react-compiler`) catches violations at lint time — run `bun run lint:compiler` to check.

## 🌍 Environment Variables

Client-side env vars must be prefixed `BUN_PUBLIC_`.

- **Development** — Bun exposes them to the browser via the bundler (configured in `bunfig.toml`):

  ```toml
  [serve.static]
  env = "BUN_PUBLIC_*"
  ```

- **Production** — they are **not baked in at build time**. `backend/serveProdBuild.ts` reads `Bun.env` at request time and injects `<script>window.__APP_CONFIG__={...}</script>` into `index.html` before serving it. Set `BUN_PUBLIC_*` vars on the running container and they are picked up without rebuilding the image.

### Config pattern

`frontend/config.ts` is the **single source of truth** for all `BUN_PUBLIC_*` vars. It uses a per-property priority pattern: `window.__APP_CONFIG__` (runtime injection) takes precedence over `import.meta.env` (build-time), so deployments that supply env vars at runtime (e.g. Coolify) work without rebuilding the image:

```ts
const runtimeConfig =
  typeof window !== 'undefined' ? window.__APP_CONFIG__ : undefined;
const env = import.meta.env as ImportMetaEnv | undefined;

export const config = {
  openpanel: {
    clientId:
      runtimeConfig?.BUN_PUBLIC_OPENPANEL_CLIENT_ID ||
      env?.BUN_PUBLIC_OPENPANEL_CLIENT_ID ||
      null,
    apiUrl:
      runtimeConfig?.BUN_PUBLIC_OPENPANEL_API_URL ||
      env?.BUN_PUBLIC_OPENPANEL_API_URL ||
      null,
    sessionReplay:
      (runtimeConfig?.BUN_PUBLIC_OPENPANEL_SESSION_REPLAY ??
        env?.BUN_PUBLIC_OPENPANEL_SESSION_REPLAY) === 'true',
  },
  otel: {
    serviceName:
      runtimeConfig?.BUN_PUBLIC_OTEL_SERVICE_NAME ||
      env?.BUN_PUBLIC_OTEL_SERVICE_NAME ||
      null,
  },
} as const;
```

- **Must** add new `BUN_PUBLIC_*` vars to `config.ts` **and** `backend/serveProdBuild.ts` — never read them elsewhere
- **Must not** access `import.meta.env` or `window.__APP_CONFIG__` directly outside `config.ts`
- Import via `@frontend/config`: `import { config } from '@frontend/config'`
