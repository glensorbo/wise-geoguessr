FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build

WORKDIR /app

COPY . .
RUN bun run build

FROM oven/bun:1.3.10-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV BUN_PORT=3000

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3000

CMD ["bun", "run", "start"]
