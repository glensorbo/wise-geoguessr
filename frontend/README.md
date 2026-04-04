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

Client-side env vars must be prefixed with `BUN_PUBLIC_` to be exposed to the browser (configured in `bunfig.toml`):

```toml
[serve.static]
env = "BUN_PUBLIC_*"
```

### Config pattern

`frontend/config.ts` is the **single source of truth** for all `BUN_PUBLIC_*` vars. It wraps `import.meta.env` with optional chaining so missing vars fall back to `null` rather than throwing at runtime:

```ts
const env = import.meta.env as ImportMetaEnv | undefined;

export const config = {
  openpanel: {
    clientId: env?.BUN_PUBLIC_OPENPANEL_CLIENT_ID ?? null,
    apiUrl: env?.BUN_PUBLIC_OPENPANEL_API_URL ?? null,
    sessionReplay: env?.BUN_PUBLIC_OPENPANEL_SESSION_REPLAY === 'true',
  },
} as const;
```

- **Must** add new `BUN_PUBLIC_*` vars to `config.ts` — never read them elsewhere
- **Must not** access `import.meta.env` directly outside `config.ts`
- Import via `@frontend/config`: `import { config } from '@frontend/config'`
