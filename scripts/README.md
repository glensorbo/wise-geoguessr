# 🛠️ scripts/

Standalone utility scripts — run directly, not imported by the app.

| File         | Purpose                                                   |
| ------------ | --------------------------------------------------------- |
| `tag.ts`     | Bump version, push a release-candidate tag → test deploys |
| `release.ts` | Promote latest RC to a GitHub Release → prod deploys      |
| `e2e-ci.sh`  | Run the full Playwright suite in an isolated Docker stack |

---

## `tag.ts`

Reads the latest stable git tag (`vX.Y.Z`), computes the next version, then creates and pushes a `vX.Y.Z-rcN` tag.

```bash
bun tag <patch|minor|major>

# Examples
bun tag patch    # v1.2.3 → v1.2.4-rc1
bun tag minor    # v1.2.3 → v1.3.0-rc1
bun tag major    # v1.2.3 → v2.0.0-rc1
```

If an RC already exists for the target version, the counter increments (`-rc2`, `-rc3`, …).

Pushing an RC tag triggers `.github/workflows/deploy-test.yml`, which deploys to the test environment via Coolify.

## `release.ts`

Finds the latest RC tag, promotes it to a stable GitHub Release, and triggers a prod deploy.

```bash
bun run release   # v1.2.0-rc3 → GitHub Release v1.2.0 → prod deploys
```

The script errors if no RC tags exist or if a release for that version already exists. Requires `gh` CLI authenticated with repo write access.

The published GitHub Release triggers `.github/workflows/deploy-prod.yml`, which deploys to the prod environment via Coolify.

## Release workflow

```
bun tag patch       # → v1.2.0-rc1 pushed → test deploys
# iterate as needed:
bun tag patch       # → v1.2.0-rc2 pushed → test deploys again
bun run release     # → GitHub Release v1.2.0 → prod deploys
```

---

## `e2e-ci.sh`

Spins up a fresh Postgres + app stack via `docker-compose.e2e.yml`, runs the
full Playwright suite, then tears everything down — exits with Playwright's own
exit code.

```bash
./scripts/e2e-ci.sh

# Override env vars inline
POSTGRES_PASSWORD=secret JWT_SECRET=s3cr3t ./scripts/e2e-ci.sh
```

Intended for scheduled cron on the Coolify server. See `docs/coolify.md` for
the full cron setup.
