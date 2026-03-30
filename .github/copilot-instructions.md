# Copilot Instructions

This is a full-stack Bun app: React 19 frontend + layered backend (Controller → Service → Repository) → Drizzle ORM → PostgreSQL.

## ⚡ Runtime — Bun Only

- Use `bun` everywhere — never `node`, `npm`, `npx`, `ts-node`, or `yarn`
- Bun auto-loads `.env` — never use `dotenv`
- Use `Bun.file` instead of `fs.readFile`/`fs.writeFile`
- Use `Bun.$\`cmd\``instead of`execa`

## 🎨 Style

- Use emojis where appropriate in terminal output, commit messages, and docs
- Only comment code that genuinely needs clarification — no redundant comments

## 📚 READMEs

Every major directory has a README. **Read it before working in that layer.**

## ✅ After Every Change

Always run as the final step:

```sh
bun run cc   # test + lint + compiler check + format check + knip
```

If formatting fails: `bun run format`. Fix all other errors at source.

## 🔑 Key Commands

```sh
bun dev              # Dev server with HMR
bun run build        # Bundle frontend to dist/
bun test             # Run all unit tests
bun run cc           # Full check suite
bun run db:generate  # Generate Drizzle migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
```

## 🔗 Path Aliases

Use these when crossing layer boundaries — never use `../../` relative imports:

- `@backend/*` → `./backend/*`
- `@frontend/*` → `./frontend/*`
- `@type/*` → `./types/*`

## 🔐 Env Vars

Whenever an env var is added, removed, or renamed — update **both** `.env.example` and `bun-env.d.ts`.

## 🌐 Routes

Whenever a route or controller is added, changed, or removed — update the corresponding file in `rest/` and `rest/README.md` if the file table changes.

## 🤖 Agent Workflow

After making code changes, always invoke the appropriate agents **in this order** before committing:

### 1. Always — `docs` agent

Run the `docs` agent to review and update any READMEs affected by your changes.

- Root `README.md` → advertisement style (why, not how)
- Sub-level READMEs → reference style (what, rules, tables)

### 2. Conditionally — specialised agents

| Changed files   | Run agent                                                                |
| --------------- | ------------------------------------------------------------------------ |
| `frontend/**`   | `rybbit` — verify analytics integration is documented and correct        |
| `backend/**`    | `otel` — verify telemetry instrumentation and docs are up to date        |
| `backend/db/**` | `backend-feature` — verify schema, migration, and repository conventions |
| `e2e/**`        | `e2e-playwright` — verify tests follow project Playwright conventions    |

### 3. Always last — quality gate

```sh
bun run cc   # test + lint + compiler check + format check + knip
```

If `bun run cc` fails, fix the errors at source before committing. Run `bun run format` first if it's a formatting failure.

**Never commit with a failing `bun run cc`.**
