#!/bin/sh
# Runs on every container start before the app server.
# Migrations are idempotent — safe to run on every deploy.
set -e

echo "🔄 Running database migrations…"
bunx --bun drizzle-kit migrate

echo "🚀 Starting server…"
exec bun run start
