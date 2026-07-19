# BirrStream

A full-stack habit/task tracking web app built on a pnpm monorepo.

## Stack

- **Frontend** — React 19 + Vite + Tailwind CSS v4 + shadcn/ui (`artifacts/birrstream`)
- **API** — Express 5 + Pino logging (`artifacts/api-server`)
- **Database** — PostgreSQL via Drizzle ORM (`lib/db`)
- **Shared libs** — `lib/api-spec` (OpenAPI/orval), `lib/api-zod` (Zod schemas), `lib/api-client-react` (React Query hooks)

## How to run

Workflows are configured and start automatically. The app runs at the root preview path (`/`); the API server is at `/api`.

### First-time setup (already done)

```bash
pnpm install
pnpm run typecheck:libs          # build shared lib declarations
pnpm --filter @workspace/db run push   # push DB schema
pnpm --filter @workspace/scripts run seed  # seed packages + daily_tasks tables
```

### After any `db push`

Always re-run the seed script:

```bash
pnpm --filter @workspace/scripts run seed
```

## Auth

Sessions are stored in-memory (token format: `birr_userId_timestamp_random`). Restarting the API server clears all active sessions.

## User preferences
