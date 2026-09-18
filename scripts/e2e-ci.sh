#!/usr/bin/env bash
# Run the full Playwright E2E suite in an isolated Docker environment.
#
# Spins up a fresh postgres + app + test runner, waits for everything to be
# healthy, runs all tests, then tears everything down regardless of outcome.
# The script exits with Playwright's own exit code, so cron / CI picks it up.
#
# Usage:
#   ./scripts/e2e-ci.sh
#
# Override any default env vars inline:
#   POSTGRES_PASSWORD=secret JWT_SECRET=s3cr3t ./scripts/e2e-ci.sh
#
# Cron example (daily at 02:00, logs to /var/log/wise-geoguessr-e2e.log):
#   0 2 * * * cd /path/to/wise-geoguessr && ./scripts/e2e-ci.sh >> /var/log/wise-geoguessr-e2e.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$ROOT_DIR/docker-compose.e2e.yml"

cd "$ROOT_DIR"

echo "🧪 $(date '+%Y-%m-%d %H:%M:%S') — Starting E2E test run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Tear down any leftover containers from a previous interrupted run
docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans --timeout 10 2>/dev/null || true

# Build images and run the suite.
# --exit-code-from e2e  → exit with Playwright's exit code
# --abort-on-container-exit → stop all services once e2e exits
EXIT_CODE=0
docker compose -f "$COMPOSE_FILE" up \
  --build \
  --exit-code-from e2e \
  --abort-on-container-exit \
  || EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Tearing down containers and ephemeral database…"
docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans --timeout 30

echo ""
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "✅ $(date '+%Y-%m-%d %H:%M:%S') — All E2E tests passed"
else
  echo "❌ $(date '+%Y-%m-%d %H:%M:%S') — E2E tests FAILED (exit code: $EXIT_CODE)"
fi

exit "$EXIT_CODE"
