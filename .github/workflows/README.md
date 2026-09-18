# ⚙️ .github/workflows/

CI/CD workflows. Together they implement a two-stage deploy pipeline: RC tag →
test environment, then release PR merged → prod.

| Workflow             | Trigger                     | What it does                        |
| -------------------- | --------------------------- | ----------------------------------- |
| `pr-checks.yml`      | PR → `main`, `test`, `prod` | Lint, type-check, unit tests, build |
| `e2e.yml`            | PR → `test`, `prod`         | Full Playwright suite in Docker     |
| `release-please.yml` | Push to `main`              | Auto-creates / updates a release PR |
| `deploy-test.yml`    | Tag push matching `v*-rc*`  | Triggers Coolify test deployment    |
| `deploy-prod.yml`    | GitHub Release published    | Triggers Coolify prod deployment    |

---

## Release flow

```
bun tag <patch|minor|major>
  → bumps package.json, commits + pushes to main
  → pushes vX.Y.Z-rc1 tag
      → deploy-test.yml fires (Coolify test)
  → release-please opens / updates a release PR

merge the release-please PR
  → release-please publishes a GitHub Release
      → deploy-prod.yml fires (Coolify prod)
```

See `scripts/README.md` for `bun tag` usage and `docs/coolify.md` for Coolify
setup (secrets, UUIDs).

---

## Required secrets

| Secret              | Used by                              |
| ------------------- | ------------------------------------ |
| `COOLIFY_URL`       | `deploy-test.yml`, `deploy-prod.yml` |
| `COOLIFY_API_TOKEN` | `deploy-test.yml`, `deploy-prod.yml` |
| `COOLIFY_TEST_UUID` | `deploy-test.yml`                    |
| `COOLIFY_PROD_UUID` | `deploy-prod.yml`                    |
