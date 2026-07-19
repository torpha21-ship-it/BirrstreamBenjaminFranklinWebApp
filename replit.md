# BirrStream

A full-stack task/reward streaming platform with a React frontend, Express API, and PostgreSQL database.

## Stack

- **Frontend**: React + Vite (`artifacts/birrstream`) — served at `/`
- **API**: Express (`artifacts/api-server`) — served at `/api`
- **Database**: Replit built-in PostgreSQL via Drizzle ORM (`lib/db`)
- **Package manager**: pnpm (workspace monorepo)

## How to run

All services start automatically via Replit workflows. To start manually:

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Push DB schema
pnpm --filter @workspace/db run push

# Seed database (packages + daily_tasks)
pnpm --filter @workspace/scripts run seed

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port 21707)
pnpm --filter @workspace/birrstream run dev
```

## Environment

- `DATABASE_URL` — managed automatically by Replit (do not set manually)
- `SESSION_SECRET` — set as a Replit secret

## Database notes

- After every `db push`, run the seed script to populate `packages` and `daily_tasks` tables.
- Sessions are stored in-memory; restarting the API server clears all active sessions.
- Auth tokens use the format `birr_<userId>_<timestamp>_<random>`.

## Project structure

```
artifacts/
  birrstream/        # React + Vite frontend
  api-server/        # Express API
  mockup-sandbox/    # Design/canvas preview server
lib/
  db/                # Drizzle ORM schema + client
  api-spec/          # OpenAPI spec (orval-generated client)
  api-client-react/  # Generated React Query hooks
  api-zod/           # Generated Zod validators
scripts/
  src/seed.ts        # DB seed script
```

## User preferences
