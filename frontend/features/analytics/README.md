# 📊 Analytics

Rybbit analytics integration for the frontend. Opt-in via environment variables — fully inactive for developers who don't set them.

## Enabling Analytics

1. Start the local Rybbit stack:
   ```sh
   docker compose -f docker-compose.rybbit.yml up -d
   ```
2. Open the dashboard at `http://localhost:8090`, create an account, and add a new site.
3. Lock registration — set `RYBBIT_DISABLE_SIGNUP=true` in `.env` and restart the backend:
   ```sh
   docker compose -f docker-compose.rybbit.yml restart rybbit-backend
   ```
4. Note the **Site ID** assigned to your site.
5. Add to your `.env`:

   ```env
   BUN_PUBLIC_RYBBIT_HOST=http://localhost:3001
   BUN_PUBLIC_RYBBIT_SITE_ID=<your-site-id>
   ```

   **Use port `3001` (the backend directly), not `8090` (the Caddy proxy).**
   The Caddy proxy only forwards `/api/*` paths to the backend; the SDK’s
   tracking endpoints (`/track`, `/site/tracking-config/…`) have no `/api/`
   prefix and would be routed to the dashboard UI instead. The dashboard
   remains accessible at `http://localhost:8090`.

   These vars are surfaced to frontend code via `frontend/config.ts` — see [Environment Variables](../../README.md#-environment-variables).

6. Restart `bun dev`.

## Tracking Custom Events

Use the `useAnalytics` hook — never import `@rybbit/js` directly in components:

```tsx
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';

const { trackEvent } = useAnalytics();

// In a click handler:
trackEvent('button_clicked', { label: 'Save' });
```

## Files

| File                    | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `analyticsProvider.tsx` | Initialises Rybbit; tracks route changes automatically              |
| `useAnalytics.ts`       | Hook exposing `trackEvent` and `trackPageview`                      |
| `../../config.ts`       | Shared env-var wrapper — `config.rybbit.host/siteId` read from here |
