# 🛠️ scripts/

Standalone utility scripts — run directly, not imported by the app.

| File        | Purpose                                                    |
| ----------- | ---------------------------------------------------------- |
| `tag.ts`    | Bump version, commit to main, push a release-candidate tag |
| `e2e-ci.sh` | Run the full Playwright suite in an isolated Docker stack  |

---

## `tag.ts`

Reads the latest stable git tag (`vX.Y.Z`), computes the next version, writes
it to `package.json`, commits and pushes to `main`, then creates and pushes a
`vX.Y.Z-rcN` tag.

```bash
bun tag <patch|minor|major>

# Examples
bun tag patch    # v1.2.3 → v1.2.4-rc1
bun tag minor    # v1.2.3 → v1.3.0-rc1
bun tag major    # v1.2.3 → v2.0.0-rc1
```

If an RC already exists for the target version, the counter increments
(`-rc2`, `-rc3`, …).

**Rules:**

- Must run from the repo root on a clean, up-to-date `main` branch
- Pushing an RC tag triggers the Coolify test deployment (see `.github/workflows/deploy-test.yml`)
- Stable tags (`vX.Y.Z`) are created by release-please when the release PR is merged — do not push them manually

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
