# ---- Builder stage ----
# Installs all deps and builds the frontend into dist/
FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build

WORKDIR /app

COPY . .
RUN bun run build

# ---- Runner stage ----
FROM oven/bun:1.3.10-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV BUN_PORT=3000

COPY package.json bun.lock ./
# Full install (not --production) so drizzle-kit is available for migrations
# at startup. The size cost is small compared to the reliability benefit.
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["sh", "docker/entrypoint.sh"]

# vim: set filetype=dockerfile :
