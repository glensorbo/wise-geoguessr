# 📊 Analytics

OpenPanel analytics integration for the frontend. Opt-in via environment variables — fully inactive for developers who don't set them.

## Enabling Analytics

### Cloud (openpanel.dev)

1. Create an account at [openpanel.dev](https://openpanel.dev) and add a new project.
2. Copy the **Client ID** from the project settings.
3. Add to your `.env`:

   ```env
   BUN_PUBLIC_OPENPANEL_CLIENT_ID=your-client-id
   ```

4. Restart `bun dev`.

### Self-Hosted

1. Start the local OpenPanel stack:
   ```sh
   docker compose -f docker-compose.openpanel.yml up -d
   ```
2. Open the dashboard at `http://localhost:7780`, create an account, and add a new project.
3. Note the **Client ID** assigned to your project.
4. Add to your `.env`:

   ```env
   BUN_PUBLIC_OPENPANEL_CLIENT_ID=your-client-id
   BUN_PUBLIC_OPENPANEL_API_URL=http://localhost:3001
   ```

5. Restart `bun dev`.

## Session Replay (optional)

Enable session replay by adding to your `.env`:

```env
BUN_PUBLIC_OPENPANEL_SESSION_REPLAY=true
```

All text content and inputs are **masked by default** (`maskAllText: true`, `maskAllInputs: true`) — sensitive content is replaced with `***` before leaving the browser. This is the safe default for GDPR compliance.

The replay module is loaded asynchronously as a separate script — zero bundle cost when disabled.

## Tracking Custom Events

Use the `useAnalytics` hook — never import `@openpanel/web` directly in components:

```tsx
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';

const { trackEvent } = useAnalytics();

// In a click handler:
trackEvent('button_clicked', { label: 'Save' });
```

## Identifying Users

Call `identify` after login to link future events to a user profile. Call `clearIdentity` on logout:

```tsx
import { useAnalytics } from '@frontend/features/analytics/useAnalytics';

const { identify, clearIdentity } = useAnalytics();

// After successful login:
identify(user.id, { name: user.name });

// After logout:
clearIdentity();
```

## Files

| File                    | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `analyticsProvider.tsx` | Initialises OpenPanel; tracks SPA route changes as `screen_view` |
| `useAnalytics.ts`       | Hook exposing `trackEvent`, `identify`, and `clearIdentity`      |
| `../../config.ts`       | Shared env-var wrapper — `config.openpanel.*` read from here     |
