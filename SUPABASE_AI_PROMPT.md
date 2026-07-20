# BirrStream — Complete Site Analysis, Database Guide & Supabase AI Prompt

---

# PART 1 — COMPLETE SITE ANALYSIS (STEP BY STEP)

---

## 1.1 — What BirrStream Is

BirrStream is a **financial rewards platform** targeting Ethiopian users. Users deposit real ETB
(Ethiopian Birr), activate investment packages that pay daily returns, complete daily tasks for
small rewards, check in daily for streak bonuses, and earn commissions by referring others in a
3-level referral network. Admins manually approve and reject all deposits and withdrawals through
an admin panel.

---

## 1.2 — Full Project Structure

```
workspace/
├── artifacts/
│   ├── api-server/          ← Express.js REST API (Node.js, TypeScript)
│   └── birrstream/          ← React + Vite frontend (TypeScript)
├── lib/
│   └── db/                  ← Drizzle ORM schema + PostgreSQL client (shared library)
├── scripts/                 ← One-off scripts (seed data)
└── package.json             ← pnpm workspace root
```

**Workspace packages:**
- `@workspace/api-server` — the Express backend
- `@workspace/birrstream` — the React/Vite frontend
- `@workspace/db` — Drizzle ORM schema + pg connection (imported by api-server and scripts)
- `@workspace/api-zod` — Zod validation schemas shared between frontend and backend
- `@workspace/api-client-react` — Orval-generated typed React Query API client
- `@workspace/scripts` — seed script

---

## 1.3 — Database Layer (`lib/db`)

**Engine:** PostgreSQL
**ORM:** Drizzle ORM v0.45 with `node-postgres` (the `pg` package)
**Connection file:** `lib/db/src/index.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export * from "./schema";
```

Every route in the API imports `db` from `@workspace/db`. Changing `DATABASE_URL` to point at
Supabase is the only change needed to migrate the database — zero route files change, zero
schema files change.

**Drizzle config file:** `lib/db/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

**Schema index file:** `lib/db/src/schema/index.ts`

```typescript
export * from "./users";
export * from "./packages";
export * from "./transactions";
export * from "./tasks";
export * from "./referrals";
```

---

## 1.4 — Complete Database Schema — All 11 Tables

### Table 1: `users`
File: `lib/db/src/schema/users.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| full_name | text | NOT NULL | |
| username | text | NOT NULL, UNIQUE | |
| email | text | NOT NULL, UNIQUE | |
| password_hash | text | NOT NULL | Format: `scrypt:<hex-salt>:<hex-hash>` |
| main_balance | numeric(14,2) | NOT NULL, DEFAULT '0' | Current spendable balance |
| total_yield | numeric(14,2) | NOT NULL, DEFAULT '0' | Cumulative yield earned |
| total_deposited | numeric(14,2) | NOT NULL, DEFAULT '0' | Cumulative deposits approved |
| total_withdrawn | numeric(14,2) | NOT NULL, DEFAULT '0' | Cumulative withdrawals |
| referral_code | text | NOT NULL, UNIQUE | 6-char uppercase hex |
| referred_by_user_id | integer | REFERENCES users(id) | NULL if no referrer |
| login_streak | integer | NOT NULL, DEFAULT 0 | Legacy column, not actively used |
| last_login_at | timestamp | | Updated on every login |
| is_admin | boolean | NOT NULL, DEFAULT false | |
| profile_photo | text | | base64 data URL |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 2: `packages`
File: `lib/db/src/schema/packages.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| name | text | NOT NULL | e.g. "VIP 1", "VIP Elite" |
| cost | numeric(14,2) | NOT NULL | ETB cost to activate |
| daily_return | numeric(14,2) | NOT NULL | ETB paid per day |
| total_yield | numeric(14,2) | NOT NULL | Total ETB over full duration |
| duration_days | integer | NOT NULL, DEFAULT 7 | |
| is_locked | boolean | NOT NULL, DEFAULT false | Locked tiers require VIP unlock |
| tier | text | NOT NULL | 'vip1','vip2','vip3','vip4','vip5','elite','apex','titan','alpha' |
| sort_order | integer | NOT NULL, DEFAULT 0 | Display ordering |

### Table 3: `user_packages`
File: `lib/db/src/schema/packages.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | |
| package_id | integer | NOT NULL, REFERENCES packages(id) | |
| purchased_at | timestamp | NOT NULL, DEFAULT NOW() | |
| expires_at | timestamp | NOT NULL | purchased_at + duration_days |
| is_active | boolean | NOT NULL, DEFAULT true | Only one active at a time per user |
| total_earned | numeric(14,2) | NOT NULL, DEFAULT '0' | Not actively updated (computed on-the-fly) |

### Table 4: `transactions`
File: `lib/db/src/schema/transactions.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | |
| type | text | NOT NULL | 'deposit','withdrawal','task_earning','commission','daily_yield','streak_bonus','package_purchase' |
| amount | numeric(14,2) | NOT NULL | |
| description | text | NOT NULL | Human-readable description |
| status | text | NOT NULL, DEFAULT 'completed' | 'pending','completed','rejected' |
| related_id | integer | | Links to deposits.id or withdrawals.id |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 5: `deposits`
File: `lib/db/src/schema/transactions.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | |
| amount | numeric(14,2) | NOT NULL | 500–50,000 ETB |
| sender_name | text | NOT NULL | Name on the receipt |
| receipt_url | text | | Full base64 data URL of receipt image |
| status | text | NOT NULL, DEFAULT 'pending' | 'pending','approved','rejected' |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 6: `withdrawals`
File: `lib/db/src/schema/transactions.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | |
| amount | numeric(14,2) | NOT NULL | |
| bank_name | text | NOT NULL | From saved withdrawal settings |
| account_name | text | NOT NULL | From saved withdrawal settings |
| wallet_id | text | NOT NULL | From saved withdrawal settings |
| status | text | NOT NULL, DEFAULT 'pending' | 'pending','approved','rejected' |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 7: `withdrawal_settings`
File: `lib/db/src/schema/transactions.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, UNIQUE, REFERENCES users(id) | One row per user |
| bank_name | text | | |
| account_name | text | | |
| wallet_id | text | | |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 8: `commissions`
File: `lib/db/src/schema/referrals.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | Who earns the commission |
| from_user_id | integer | NOT NULL, REFERENCES users(id) | Whose deposit triggered it |
| level | integer | NOT NULL | 1, 2, or 3 |
| amount | numeric(14,2) | NOT NULL | |
| description | text | NOT NULL | e.g. "Level 1 referral commission (5% of 1000.00 ETB deposit)" |
| created_at | timestamp | NOT NULL, DEFAULT NOW() | |

### Table 9: `daily_tasks`
File: `lib/db/src/schema/tasks.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| title | text | NOT NULL | |
| description | text | NOT NULL | |
| reward | numeric(8,2) | NOT NULL | ETB reward for completion |
| task_type | text | NOT NULL | 'stream_video','open_page','join_telegram','other' |
| action_url | text | | Optional URL for task action |
| is_active | boolean | NOT NULL, DEFAULT true | |

### Table 10: `user_task_completions`
File: `lib/db/src/schema/tasks.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, REFERENCES users(id) | |
| task_id | integer | NOT NULL, REFERENCES daily_tasks(id) | |
| completed_at | timestamp | NOT NULL, DEFAULT NOW() | |
| date | text | NOT NULL | 'YYYY-MM-DD' in Ethiopia timezone (UTC+3) |

**CRITICAL CONSTRAINT:** `UNIQUE (user_id, task_id, date)` named `uq_task_completion_daily`
This is the final guard against concurrent duplicate task completions. The backend catches
PostgreSQL error code `23505` (unique_violation) and returns HTTP 400.

### Table 11: `login_streaks`
File: `lib/db/src/schema/tasks.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | serial | PRIMARY KEY | |
| user_id | integer | NOT NULL, UNIQUE, REFERENCES users(id) | One row per user |
| current_streak | integer | NOT NULL, DEFAULT 0 | Days in a row |
| last_checkin_date | text | | 'YYYY-MM-DD' in Ethiopia timezone (UTC+3) |
| updated_at | timestamp | NOT NULL, DEFAULT NOW() | |

---

## 1.5 — Backend API (`artifacts/api-server`)

**Framework:** Express 5, TypeScript, bundled via esbuild
**Logging:** Pino + pino-http
**CORS:** Wide open — `cors()` with no origin restriction (security issue — must be fixed)
**Base path:** All routes under `/api`
**Port:** Reads `process.env.PORT`
**Build:** `node ./build.mjs` (esbuild, outputs to `dist/index.mjs`)
**Run:** `node --enable-source-maps ./dist/index.mjs`

**`artifacts/api-server/src/app.ts`:**
```typescript
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app = express();
app.use(pinoHttp({ logger, ... }));
app.use(cors());              // ← wide open, must be restricted for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;
```

**Middleware stack:**
1. pino-http request logger
2. cors (currently unrestricted)
3. express.json() — body parser for JSON
4. express.urlencoded() — body parser for URL-encoded forms
5. Route handler (all under /api)
6. requireAuth — reads `Authorization: Bearer <token>` header, validates against in-memory SESSIONS Map, fetches user from DB, attaches `req.user` and `req.token`
7. requireAdmin — checks `req.user.isAdmin === true`

**Authentication system (`artifacts/api-server/src/middlewares/auth.ts`):**
- Token = `crypto.randomBytes(32).toString("hex")` — 64-char hex string, cryptographically secure
- Stored server-side in `SESSIONS: Map<string, { userId: number, expiresAt: number }>` — **IN-MEMORY, clears on server restart**
- TTL: 30 days from issue time
- `generateToken(userId)` — creates and stores a new token
- `revokeToken(token)` — immediately deletes from Map (used by logout)
- `getUserIdFromToken(token)` — looks up Map, checks expiry, returns userId or null
- `requireAuth` — validates token, fetches fresh user from DB, sets `req.user` and `req.token`

**Password system (`artifacts/api-server/src/routes/auth.ts`):**
- New passwords: `scrypt:<16-byte-hex-salt>:<64-byte-hex-hash>` via Node.js `crypto.scrypt` (no external packages)
- Legacy passwords: flat SHA-256 hex string — detected by absence of `scrypt:` prefix
- Legacy verification: `crypto.createHash("sha256").update(password + "birrstream_salt").digest("hex")` compared with `crypto.timingSafeEqual()`
- On successful login with legacy hash: transparently re-hashes to scrypt and updates DB in the same request

**Ethiopia timezone utility (`artifacts/api-server/src/lib/date.ts`):**
```typescript
export function getEthiopiaToday(): string {
  const eatMs = Date.now() + 3 * 60 * 60 * 1000;  // UTC+3
  return new Date(eatMs).toISOString().split("T")[0];
}

export function getEthiopiaYesterday(): string {
  const eatMs = Date.now() + 3 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000;
  return new Date(eatMs).toISOString().split("T")[0];
}
```
All daily boundaries (yield, tasks, streaks) use these — not UTC.

---

## 1.6 — Complete Route Inventory

| Method | Path | Auth | What It Does |
|--------|------|------|--------------|
| GET | `/api/` | No | Health check — returns `{status:"ok"}` |
| POST | `/api/auth/register` | No | Creates user, scrypt-hashes password, generates collision-safe referral code, returns `{user, token}` |
| POST | `/api/auth/login` | No | Verifies password (scrypt + legacy SHA-256 upgrade), updates `last_login_at`, returns `{user, token}` |
| POST | `/api/auth/logout` | ✅ | Calls `revokeToken(req.token)` — immediate server-side invalidation |
| POST | `/api/auth/forgot-password` | No | **STUB ONLY** — acknowledges but sends no email |
| GET | `/api/auth/me` | ✅ | Returns `req.user` as formatted user object |
| GET | `/api/dashboard/summary` | ✅ | Fetches fresh balance from DB, active package, reserve floor, tier progress |
| GET | `/api/dashboard/streak` | ✅ | Returns streak count + 7-day EAT calendar |
| POST | `/api/dashboard/streak/checkin` | ✅ | `SELECT FOR UPDATE` on streak row, credits +5 ETB atomically |
| GET | `/api/packages` | ✅ | Lists all packages ordered by `sort_order` |
| POST | `/api/packages/:id/purchase` | ✅ | Atomic deduct, deactivates old package, creates new `user_packages` row, logs as `package_purchase` |
| GET | `/api/packages/active` | ✅ | Returns active package with `daysRemaining`, `totalEarnedSoFar`, `dailyEarningsToday` |
| GET | `/api/tasks` | ✅ | Lists active tasks with today's completion status (EAT date) |
| POST | `/api/tasks/:id/complete` | ✅ | Inserts completion (DB unique constraint guards), credits reward atomically |
| POST | `/api/deposits` | ✅ | Submits deposit (500–50,000 ETB), stores base64 receipt in `receipt_url` |
| GET | `/api/deposits/history` | ✅ | Lists user's deposit history (returns `"receipt_uploaded"` string, not the actual base64) |
| GET | `/api/withdrawals/settings` | ✅ | Gets saved bank/wallet settings |
| PUT | `/api/withdrawals/settings` | ✅ | Upserts bank/wallet settings |
| POST | `/api/withdrawals` | ✅ | Atomically deducts balance with 40% reserve floor, creates pending withdrawal |
| GET | `/api/withdrawals/history` | ✅ | Lists user's withdrawal history |
| GET | `/api/referrals/info` | ✅ | Referral code, link, network counts (all 3 levels), total commissions earned |
| GET | `/api/referrals/network` | ✅ | Full 3-level tree using batch `inArray()` queries (9 DB queries total regardless of network size) |
| GET | `/api/referrals/vip-upgrades` | ✅ | VIP unlock goal progress (direct referrals + downline volume) |
| GET | `/api/transactions` | ✅ | Transaction history with optional `?type=` SQL filter via `inArray()` |
| GET | `/api/user/profile` | ✅ | Full user profile including `profilePhoto` |
| PATCH | `/api/user/profile` | ✅ | Updates `fullName` and/or `email` |
| PATCH | `/api/user/profile-photo` | ✅ | Updates `profilePhoto` (base64 data URL stored in DB) |
| DELETE | `/api/user/delete` | ✅ | Deletes account after confirmation text `"DELETE MY ACCOUNT"` |
| POST | `/api/yields/credit-daily` | ✅ | Idempotent yield credit: `SELECT FOR UPDATE` + SQL date filter + atomic credit |
| GET | `/api/admin/stats` | ✅ Admin | Platform totals via SQL `SUM()` aggregation (never fetches all rows) |
| GET | `/api/admin/deposits/pending` | ✅ Admin | Pending deposits with full `receiptUrl` base64 for admin image verification |
| POST | `/api/admin/deposits/:id/approve` | ✅ Admin | Atomic claim + balance credit + 3-level commission crediting, all in one transaction |
| POST | `/api/admin/deposits/:id/reject` | ✅ Admin | Atomic claim, no balance changes |
| GET | `/api/admin/withdrawals/pending` | ✅ Admin | Pending withdrawals with user info |
| POST | `/api/admin/withdrawals/:id/approve` | ✅ Admin | Atomic claim, marks transaction completed (balance already deducted at submission) |
| POST | `/api/admin/withdrawals/:id/reject` | ✅ Admin | Atomic claim, refunds balance atomically, marks transaction rejected |

**Transaction type filter map:**
```typescript
const TYPE_MAP: Record<string, string[]> = {
  deposits:      ["deposit"],
  withdrawals:   ["withdrawal"],
  task_earnings: ["task_earning"],
  commissions:   ["commission"],
  packages:      ["package_purchase"],
  yields:        ["daily_yield"],
  streaks:       ["streak_bonus"],
};
```

---

## 1.7 — Key Business Logic Rules

**40% Reserve Rule (withdrawals):**
- User must maintain 40% of their active package cost in their balance at all times
- Available for withdrawal = `main_balance - (active_package_cost × 0.4)`
- Enforced atomically: `WHERE main_balance - $reserveFloor >= $amount`

**Referral Commission Rates:**
- Level 1 (direct referrer): 5% of deposit amount
- Level 2 (referrer's referrer): 3% of deposit amount
- Level 3: 2% of deposit amount
- Credited inside the same DB transaction as deposit approval

**VIP Unlock Goals:**
- VIP Elite: 5 direct referrals + 15,000 ETB downline volume
- VIP Apex: 10 direct referrals + 50,000 ETB downline volume
- VIP Titan: 20 direct referrals + 150,000 ETB downline volume
- VIP Alpha: 50 direct referrals + 500,000 ETB downline volume
- Downline volume = sum of active package costs of level-1 referrals

**Streak Bonus:** +5 ETB per daily check-in, streak increments if yesterday checked in else resets to 1

**Withdrawal flow — balance deducted on SUBMISSION not on APPROVAL:**
- On submit: balance deducted immediately → status = pending
- On admin approve: status → approved, transaction → completed, NO balance change
- On admin reject: balance refunded atomically → status = rejected

---

## 1.8 — Frontend (`artifacts/birrstream`)

**Framework:** React 18, Vite, TypeScript, Tailwind CSS
**Router:** Wouter (lightweight, not React Router)
**State:** TanStack React Query (server state) + React Context (auth state)
**UI Library:** Radix UI primitives + shadcn/ui components (~80 components)
**Animations:** Framer Motion
**Build output:** `artifacts/birrstream/dist/public`

**`artifacts/birrstream/vite.config.ts` key settings:**
- `base: process.env.BASE_PATH` — configures the URL base path
- `server.port` — reads from `process.env.PORT`
- `server.allowedHosts: true` — required for Replit proxied iframe
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` — loaded only when `NODE_ENV !== "production"` AND `REPL_ID !== undefined` — automatically skipped on Vercel

**All frontend pages and routes:**

| Route | Guard | Component | Description |
|-------|-------|-----------|-------------|
| `/` | — | Redirect → `/dashboard` | |
| `/login` | Public | Login | Username/email + password form, calls POST /api/auth/login |
| `/register` | Public | Register | Full registration form, auto-fills referral code from `?ref=` URL param |
| `/forgot-password` | Public | ForgotPassword | Email input, calls POST /api/auth/forgot-password (stub) |
| `/dashboard` | Protected | Dashboard | Balance cards, active package, streak 7-day calendar, quick action buttons |
| `/packages` | Protected | Packages | 9 investment tiers grid with purchase flow and balance shortfall handling |
| `/tasks` | Protected | Tasks | Daily task list with completion status and reward amounts |
| `/deposit` | Protected | Deposit | Amount input (500–50,000), sender name, receipt photo upload (base64) |
| `/withdraw` | Protected | Withdraw | Amount input, shows available balance after reserve floor deduction |
| `/withdrawal-settings` | Protected | WithdrawalSettings | Bank name, account name, wallet ID form |
| `/referral` | Protected | Referral | Referral link copy, stats, commission totals |
| `/affiliate-network` | Protected | AffiliateNetwork | 3-level expandable referral tree |
| `/vip-upgrades` | Protected | VipUpgrades | 4 VIP goal progress cards |
| `/transactions` | Protected | Transactions | Tabbed transaction history (all/deposits/withdrawals/tasks/commissions/packages/yields/streaks) |
| `/support` | Protected | Support | Support/contact page |
| `/delete-account` | Protected | DeleteAccount | Confirmation text input "DELETE MY ACCOUNT" |
| `/profile` | Protected | Profile | Profile photo upload + name/email edit |
| `/admin` | Protected | Admin | Platform stats, pending deposits with receipt images, pending withdrawals, approve/reject |
| `/*` | — | NotFound | 404 page |

**`ProtectedRoute`:** Redirects to `/login` if `user === null` after loading
**`PublicRoute`:** Redirects to `/dashboard` if `user !== null` after loading

**Auth context (`artifacts/birrstream/src/lib/auth.tsx`):**
- `AuthProvider` wraps entire app
- Token stored in `localStorage["token"]` on login
- On mount: reads token from localStorage, calls `GET /api/auth/me` via React Query
- On 401 from `/api/auth/me`: clears localStorage token, resets user to null
- DEV only: `?devtoken=<token>` URL param writes to `sessionStorage` (not localStorage — cleared on tab close)
- `setAuthTokenGetter()` configures the API client to inject the token into every request

**`useDepositWatcher` hook (`artifacts/birrstream/src/hooks/use-deposit-watcher.ts`):**
- Runs inside AppLayout — active on every page for logged-in users
- Polls `GET /api/deposits/history` every 30 seconds
- Polls `GET /api/withdrawals/history` every 30 seconds
- On status change `pending → approved`: shows in-app earning alert toast
- On status change `pending → rejected`: shows in-app rejection alert toast

**React Query config:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 30 * 1000,  // 30 seconds
    },
  },
});
```

---

## 1.9 — Seed Data (Exact Values)

**9 Packages (file: `scripts/src/seed.ts`):**

| Name | Cost (ETB) | Daily Return | Total Yield | Duration | Tier | Locked | Sort |
|------|-----------|--------------|-------------|----------|------|--------|------|
| VIP 1 | 500 | 35 | 245 | 7 days | vip1 | No | 1 |
| VIP 2 | 1,000 | 80 | 560 | 7 days | vip2 | No | 2 |
| VIP 3 | 2,000 | 180 | 1,260 | 7 days | vip3 | No | 3 |
| VIP 4 | 5,000 | 500 | 3,500 | 7 days | vip4 | No | 4 |
| VIP 5 | 10,000 | 1,100 | 7,700 | 7 days | vip5 | No | 5 |
| VIP Elite | 25,000 | 3,000 | 21,000 | 7 days | elite | **Yes** | 6 |
| VIP Apex | 50,000 | 7,000 | 49,000 | 7 days | apex | **Yes** | 7 |
| VIP Titan | 100,000 | 16,000 | 112,000 | 7 days | titan | **Yes** | 8 |
| VIP Alpha | 250,000 | 45,000 | 315,000 | 7 days | alpha | **Yes** | 9 |

**6 Daily Tasks:**

| Title | Reward | Type | Action URL |
|-------|--------|------|------------|
| Watch a BirrStream video | 15 ETB | stream_video | null |
| Visit the BirrStream homepage | 10 ETB | open_page | null |
| Join BirrStream Telegram | 20 ETB | join_telegram | https://t.me/birrstream |
| Share your referral link | 25 ETB | other | null |
| Complete your profile | 10 ETB | other | null |
| Watch 2 more videos | 20 ETB | stream_video | null |

---

## 1.10 — Backend Dependencies

**`artifacts/api-server/package.json` dependencies:**
```json
{
  "dependencies": {
    "@workspace/api-zod": "workspace:*",
    "@workspace/db": "workspace:*",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "drizzle-orm": "catalog:",
    "express": "^5.2.1",
    "pino": "^9.14.0",
    "pino-http": "^10.5.0"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "catalog:",
    "esbuild": "0.27.3",
    "esbuild-plugin-pino": "^2.3.3",
    "pino-pretty": "^13.1.3",
    "thread-stream": "3.1.0"
  }
}
```

**`artifacts/birrstream/package.json` key dependencies:**
- `react` + `react-dom` — React 18
- `vite` + `@vitejs/plugin-react` — build tooling
- `@tailwindcss/vite` + `tailwindcss` — styling
- `wouter` — client-side routing
- `@tanstack/react-query` — server state management
- `@radix-ui/*` — UI primitives (accordion, dialog, select, tabs, toast, etc.)
- `framer-motion` — animations
- `lucide-react` — icons
- `react-hook-form` + `@hookform/resolvers` — forms
- `zod` — validation
- `recharts` — charts
- `sonner` — toast notifications
- `date-fns` — date utilities
- `@workspace/api-client-react` — generated API client

---

# PART 2 — THE DATABASE

**The database is PostgreSQL**, currently hosted and managed automatically by Replit.

Replit provisions a PostgreSQL instance when the project is set up and injects the connection
string as `DATABASE_URL` at runtime. The app never sees a hostname, username, or password
directly — it only reads `process.env.DATABASE_URL`.

The database layer (`lib/db`) uses:
- **Drizzle ORM v0.45** — TypeScript-first query builder
- **node-postgres (`pg`)** — the underlying PostgreSQL client
- **drizzle-kit** — schema migration tool (run `drizzle-kit push` to apply schema)

**This is the critical fact:** The only thing tying the database to Replit is the value of
`DATABASE_URL`. Point it at Supabase and every single query, transaction, and schema operation
works identically with zero code changes.

---

# PART 3 — HOW TO USE SUPABASE AS YOUR DATABASE

### Step 1 — Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign up or log in → **New Project**
2. Name it `birrstream`, set a strong database password (save it), choose **Africa (East)** region
3. Wait ~2 minutes for provisioning

### Step 2 — Get Your Direct Connection String
1. Dashboard sidebar → **Project Settings → Database**
2. Scroll to **Connection string** → select **URI** tab
3. Copy the string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. **CRITICAL: Use port 5432 (direct connection) ONLY — NOT port 6543 (Supavisor pooler)**
   This codebase uses `SELECT ... FOR UPDATE` row locks which are incompatible with the
   pooler's transaction mode. Using port 6543 will cause runtime errors on yield credits,
   streak check-ins, and deposit approvals.

### Step 3 — Update DATABASE_URL in Replit
1. In Replit → Secrets panel
2. Edit the existing `DATABASE_URL` secret — replace the Replit PostgreSQL URL with your Supabase URI from Step 2

### Step 4 — Push Schema to Supabase
```bash
pnpm --filter @workspace/db run push
```
This runs `drizzle-kit push` which reads all schema files and creates all 11 tables in your
Supabase database with all columns, foreign keys, and the unique constraint on
`user_task_completions`.

### Step 5 — Seed the Database
```bash
pnpm --filter @workspace/scripts run seed
```
This deletes and re-inserts all 9 packages and 6 daily tasks.

### Step 6 — Restart the API Server
In Replit, restart the `artifacts/api-server: API Server` workflow. It reconnects to Supabase.

### Step 7 — Verify
In Supabase dashboard → **Table Editor** — you should see all 11 tables and the seeded package
and task data. The app is now fully running on Supabase.

### What Does NOT Change
- Zero changes to any route files
- Zero changes to `lib/db/src/index.ts`
- Zero changes to any Drizzle schema files
- Zero changes to the frontend

### Optional Supabase Features (for later)
- **Realtime:** Push deposit approval notifications to the frontend without polling
- **Storage:** Replace base64 receipt images stored in `receipt_url` text column with proper
  image files in a Supabase Storage bucket
- **Row Level Security (RLS):** Not needed since the app uses its own auth system

---

# PART 4 — THE COMPLETE AI PROMPT

Copy everything from the START PROMPT marker to the END PROMPT marker below and
paste it into any capable AI (Claude Opus 4, GPT-4o, Gemini 1.5 Pro, etc.).

---

<!-- START PROMPT -->

You are a senior full-stack engineer. Your mission is to take a fully audited,
production-grade codebase and complete three things simultaneously:

  1. Build the Supabase database from scratch (complete SQL + seed)
  2. Update the Replit backend to connect to Supabase and be production-ready
  3. Configure the React/Vite frontend to deploy on Vercel

The final architecture must be:
  Frontend  → Vercel          (static React/Vite SPA)
  Backend   → Replit          (Express.js REST API, stays on Replit)
  Database  → Supabase        (PostgreSQL, replaces Replit-managed DB)

This is a REAL production app for Ethiopian users. Every deliverable must be
complete, precise, and immediately usable. No TODOs. No placeholders. No mocks.
Skipping any detail, any column, any route, or any constraint is unacceptable.

══════════════════════════════════════════════════════════════════════════════
SECTION A — WHAT THE APP IS
══════════════════════════════════════════════════════════════════════════════

BirrStream is a financial rewards platform. Users deposit ETB (Ethiopian Birr),
activate investment packages that pay daily returns, complete daily tasks,
check in daily for streak bonuses, and earn multi-level referral commissions.
Admins approve/reject deposits and withdrawals manually.

Tech stack:
  - Frontend:  React 18, Vite, TypeScript, Tailwind CSS, Wouter router,
               TanStack React Query, Radix UI + shadcn/ui, Framer Motion
  - Backend:   Express 5, TypeScript, Drizzle ORM 0.45, node-postgres (pg),
               Pino logging, esbuild bundler
  - Auth:      Custom Bearer token system — in-memory Map (NOT Supabase Auth — keep this)
  - Monorepo:  pnpm workspaces
      artifacts/birrstream             ← React/Vite frontend
      artifacts/api-server             ← Express backend
      lib/db                           ← shared Drizzle ORM schema + pg client
      lib/api-spec/zod/client-react    ← Orval-generated typed API client (@workspace/api-client-react)
      scripts/                         ← seed script

══════════════════════════════════════════════════════════════════════════════
SECTION B — COMPLETE DATABASE SCHEMA
══════════════════════════════════════════════════════════════════════════════

These are the exact Drizzle TypeScript definitions. Your SQL must match these
column names (snake_case), types, and constraints exactly.

─── TABLE: users ─────────────────────────────────────────────────────────────
  id                  serial PRIMARY KEY
  full_name           text NOT NULL
  username            text NOT NULL UNIQUE
  email               text NOT NULL UNIQUE
  password_hash       text NOT NULL
    -- format: "scrypt:<16-byte-hex-salt>:<64-byte-hex-hash>"
    -- legacy format: flat SHA-256 hex string (no "scrypt:" prefix)
  main_balance        numeric(14,2) NOT NULL DEFAULT '0'
  total_yield         numeric(14,2) NOT NULL DEFAULT '0'
  total_deposited     numeric(14,2) NOT NULL DEFAULT '0'
  total_withdrawn     numeric(14,2) NOT NULL DEFAULT '0'
  referral_code       text NOT NULL UNIQUE
  referred_by_user_id integer REFERENCES users(id)
  login_streak        integer NOT NULL DEFAULT 0  -- legacy dead column, keep it
  last_login_at       timestamp
  is_admin            boolean NOT NULL DEFAULT false
  profile_photo       text    -- base64 data URL
  created_at          timestamp NOT NULL DEFAULT NOW()

─── TABLE: packages ──────────────────────────────────────────────────────────
  id            serial PRIMARY KEY
  name          text NOT NULL
  cost          numeric(14,2) NOT NULL
  daily_return  numeric(14,2) NOT NULL
  total_yield   numeric(14,2) NOT NULL
  duration_days integer NOT NULL DEFAULT 7
  is_locked     boolean NOT NULL DEFAULT false
  tier          text NOT NULL
  sort_order    integer NOT NULL DEFAULT 0

─── TABLE: user_packages ─────────────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL REFERENCES users(id)
  package_id   integer NOT NULL REFERENCES packages(id)
  purchased_at timestamp NOT NULL DEFAULT NOW()
  expires_at   timestamp NOT NULL
  is_active    boolean NOT NULL DEFAULT true
  total_earned numeric(14,2) NOT NULL DEFAULT '0'

─── TABLE: transactions ──────────────────────────────────────────────────────
  id          serial PRIMARY KEY
  user_id     integer NOT NULL REFERENCES users(id)
  type        text NOT NULL
    -- allowed values: 'deposit', 'withdrawal', 'task_earning', 'commission',
    --                 'daily_yield', 'streak_bonus', 'package_purchase'
  amount      numeric(14,2) NOT NULL
  description text NOT NULL
  status      text NOT NULL DEFAULT 'completed'
    -- allowed values: 'pending', 'completed', 'rejected'
  related_id  integer   -- foreign reference to deposits.id or withdrawals.id (not enforced by FK)
  created_at  timestamp NOT NULL DEFAULT NOW()

─── TABLE: deposits ──────────────────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL REFERENCES users(id)
  amount       numeric(14,2) NOT NULL
  sender_name  text NOT NULL
  receipt_url  text    -- stores full base64 data URL of the receipt image
  status       text NOT NULL DEFAULT 'pending'
    -- allowed values: 'pending', 'approved', 'rejected'
  created_at   timestamp NOT NULL DEFAULT NOW()

─── TABLE: withdrawals ───────────────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL REFERENCES users(id)
  amount       numeric(14,2) NOT NULL
  bank_name    text NOT NULL
  account_name text NOT NULL
  wallet_id    text NOT NULL
  status       text NOT NULL DEFAULT 'pending'
    -- allowed values: 'pending', 'approved', 'rejected'
  created_at   timestamp NOT NULL DEFAULT NOW()

─── TABLE: withdrawal_settings ───────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL UNIQUE REFERENCES users(id)
  bank_name    text
  account_name text
  wallet_id    text
  updated_at   timestamp NOT NULL DEFAULT NOW()

─── TABLE: commissions ───────────────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL REFERENCES users(id)   -- who earns
  from_user_id integer NOT NULL REFERENCES users(id)   -- whose deposit triggered it
  level        integer NOT NULL                         -- 1, 2, or 3
  amount       numeric(14,2) NOT NULL
  description  text NOT NULL
  created_at   timestamp NOT NULL DEFAULT NOW()

─── TABLE: daily_tasks ───────────────────────────────────────────────────────
  id          serial PRIMARY KEY
  title       text NOT NULL
  description text NOT NULL
  reward      numeric(8,2) NOT NULL
  task_type   text NOT NULL   -- 'stream_video', 'open_page', 'join_telegram', 'other'
  action_url  text
  is_active   boolean NOT NULL DEFAULT true

─── TABLE: user_task_completions ─────────────────────────────────────────────
  id           serial PRIMARY KEY
  user_id      integer NOT NULL REFERENCES users(id)
  task_id      integer NOT NULL REFERENCES daily_tasks(id)
  completed_at timestamp NOT NULL DEFAULT NOW()
  date         text NOT NULL   -- 'YYYY-MM-DD' in Ethiopia timezone (UTC+3, EAT)

  CONSTRAINT uq_task_completion_daily UNIQUE (user_id, task_id, date)
  -- CRITICAL: This constraint must be named exactly "uq_task_completion_daily".
  -- The backend catches PostgreSQL error code '23505' (unique_violation) and returns 400.
  -- Without this constraint, concurrent duplicate completions will double-credit users.

─── TABLE: login_streaks ─────────────────────────────────────────────────────
  id                serial PRIMARY KEY
  user_id           integer NOT NULL UNIQUE REFERENCES users(id)
  current_streak    integer NOT NULL DEFAULT 0
  last_checkin_date text    -- 'YYYY-MM-DD' in Ethiopia timezone (UTC+3, EAT)
  updated_at        timestamp NOT NULL DEFAULT NOW()

══════════════════════════════════════════════════════════════════════════════
SECTION C — COMPLETE BUSINESS LOGIC
══════════════════════════════════════════════════════════════════════════════

REGISTRATION:
  - Hash password with scrypt: "scrypt:<16-byte-hex-salt>:<64-byte-hex-hash>"
    Node.js: const scryptAsync = promisify(crypto.scrypt);
             const salt = crypto.randomBytes(16).toString("hex");
             const hash = (await scryptAsync(password, salt, 64)) as Buffer;
             return `scrypt:${salt}:${hash.toString("hex")}`;
  - Generate unique 6-char uppercase hex referral code:
    crypto.randomBytes(3).toString("hex").toUpperCase()
    With retry loop (up to 10 attempts) checking DB for collisions
  - If referralCode provided in request body:
    Look up user by referralCode → set referred_by_user_id

LOGIN:
  - Verify password. Check if stored hash starts with "scrypt:":
    * YES (scrypt): split by ":", use salt and hash, call scryptAsync, timingSafeEqual
    * NO (legacy SHA-256): crypto.createHash("sha256").update(password + "birrstream_salt").digest("hex")
      Compare: crypto.timingSafeEqual(Buffer.from(sha256,"hex"), Buffer.from(stored,"hex"))
    On successful login with legacy hash: re-hash to scrypt and UPDATE users SET password_hash in same request
  - Always UPDATE users SET last_login_at = NOW() on successful login
  - Generate token: crypto.randomBytes(32).toString("hex")
  - Store in SESSIONS Map: SESSIONS.set(token, { userId, expiresAt: Date.now() + 30*24*60*60*1000 })
  - Return { user, token }

TOKENS / AUTH MIDDLEWARE:
  - Token format: 64-char hex string from crypto.randomBytes(32)
  - Stored server-side in SESSIONS: Map<string, { userId: number, expiresAt: number }>
  - In-memory — clears on server restart (known limitation)
  - TTL: 30 days
  - requireAuth: reads "Authorization: Bearer <token>", validates Map, fetches user from DB
    Sets req.user (full user row) and req.token (the raw token string)
  - requireAdmin: checks req.user.isAdmin === true
  - revokeToken(token): SESSIONS.delete(token) — called by logout

DEPOSIT FLOW:
  - User submits: amount (500–50,000 ETB), senderName, receiptBase64 (base64 image string)
  - Store full base64 as receipt_url in deposits table
  - When returning response to depositing user: return "receipt_uploaded" string, NOT the base64
  - Status starts as "pending"
  
  Admin APPROVE (must be inside db.transaction()):
    Step 1: Atomic claim (compare-and-swap to prevent double-approval):
      UPDATE deposits SET status='approved'
      WHERE id=$depositId AND status='pending'
      RETURNING *
      → If 0 rows returned: throw { httpStatus: 400, clientMessage: "Deposit not found or already processed." }
    Step 2: Atomic credit user balance:
      UPDATE users SET
        main_balance = main_balance + $amount::numeric,
        total_deposited = total_deposited + $amount::numeric
      WHERE id = $userId
    Step 3: Insert transaction record:
      type='deposit', amount=$amount, status='completed', related_id=$depositId
    Step 4: Credit referral commissions up to 3 levels (see COMMISSIONS section)
  
  Admin REJECT (must be inside db.transaction()):
    Step 1: Same atomic claim, set status='rejected'
    Step 2: NO balance changes at all

WITHDRAWAL FLOW:
  40% RESERVE RULE: user must keep 40% of active package cost in balance
  reserveFloor = activePackageCost × 0.4  (0 if no active package)
  Available for withdrawal = main_balance - reserveFloor
  
  User SUBMIT (must be inside db.transaction()):
    Step 1: Verify withdrawal settings exist (bank_name, account_name, wallet_id all non-null)
      If missing: throw { httpStatus: 400, clientMessage: "Please configure withdrawal settings first." }
    Step 2: Get active package to compute reserveFloor
    Step 3: Atomic deduct with reserve floor and balance check:
      UPDATE users SET
        main_balance = main_balance - $amount::numeric,
        total_withdrawn = total_withdrawn + $amount::numeric
      WHERE id=$userId AND (main_balance - $reserveFloor::numeric) >= $amount::numeric
      RETURNING main_balance
      → If 0 rows: fetch fresh balance, compute available, throw detailed error message
    Step 4: Insert withdrawals row (status='pending', bank_name/account_name/wallet_id from settings)
    Step 5: Insert transaction: type='withdrawal', status='pending', related_id=withdrawal.id
  
  Admin APPROVE (must be inside db.transaction()):
    Step 1: Atomic claim: UPDATE withdrawals SET status='approved' WHERE id=$id AND status='pending' RETURNING *
      → If 0 rows: throw conflict error
    Step 2: UPDATE transactions SET status='completed' WHERE related_id=$id AND type='withdrawal'
    Step 3: NO balance change (already deducted at submission)
  
  Admin REJECT (must be inside db.transaction()):
    Step 1: Atomic claim: UPDATE withdrawals SET status='rejected' WHERE id=$id AND status='pending' RETURNING *
      → If 0 rows: throw conflict error
    Step 2: Atomic REFUND:
      UPDATE users SET
        main_balance = main_balance + $amount::numeric,
        total_withdrawn = GREATEST(total_withdrawn - $amount::numeric, 0)
      WHERE id = $userId
    Step 3: UPDATE transactions SET status='rejected' WHERE related_id=$id AND type='withdrawal'

PACKAGE PURCHASE (must be inside db.transaction()):
  Step 1: SELECT package WHERE id=$packageId
    → If not found: throw { httpStatus: 404 }
    → If is_locked=true: throw { httpStatus: 400, clientMessage: "Package is locked. Unlock through VIP upgrades." }
  Step 2: Atomic deduct:
    UPDATE users SET main_balance = main_balance - $cost::numeric
    WHERE id=$userId AND main_balance >= $cost::numeric
    RETURNING main_balance
    → If 0 rows: fetch fresh balance, compute shortfall, throw insufficient funds error
  Step 3: Deactivate existing active packages:
    UPDATE user_packages SET is_active=false WHERE user_id=$userId AND is_active=true
  Step 4: Insert new user_packages row:
    expires_at = NOW() + interval '$durationDays days'
    is_active = true
  Step 5: Insert transaction:
    type='package_purchase' (NOT 'deposit' — this was a historical bug that has been fixed)

DAILY YIELD CREDIT (idempotent — must be inside db.transaction()):
  Step 1: Acquire exclusive row-lock to serialize concurrent calls:
    SELECT id FROM users WHERE id = $userId FOR UPDATE
  Step 2: Check idempotency — has today's yield already been credited?
    SELECT id FROM transactions
    WHERE user_id=$userId AND type='daily_yield'
    AND created_at >= $today::date  (EAT timezone date)
    AND created_at < ($today::date + interval '1 day')
    LIMIT 1
    → If found: return { credited: false, reason: "Already credited today", yieldAmount: 0 }
  Step 3: Get active unexpired package:
    SELECT from user_packages JOIN packages WHERE user_id=$userId AND is_active=true LIMIT 1
    → If none: return { credited: false, reason: "No active package", yieldAmount: 0 }
  Step 4: Check expiry — if NOW() > expires_at:
    UPDATE user_packages SET is_active=false WHERE id=$userPackageId
    return { credited: false, reason: "Package expired", yieldAmount: 0 }
  Step 5: Atomic credit:
    UPDATE users SET
      main_balance = main_balance + $dailyReturn::numeric,
      total_yield = total_yield + $dailyReturn::numeric
    WHERE id=$userId
  Step 6: Insert transaction: type='daily_yield', amount=$dailyReturn
  Called automatically by the frontend when the dashboard loads (POST /api/yields/credit-daily)

TASK COMPLETION (must be inside db.transaction()):
  Step 1: SELECT task WHERE id=$taskId — if not found: 404
  Step 2: INSERT into user_task_completions:
    { user_id, task_id, date: getEthiopiaToday(), completed_at: NOW() }
    → Catch PostgreSQL error code '23505' (unique_violation) → return 400 "Task already completed today"
    The DB UNIQUE constraint is the final guard — no application-level pre-check is sufficient
  Step 3: Atomic credit:
    UPDATE users SET
      main_balance = main_balance + $reward::numeric,
      total_yield = total_yield + $reward::numeric
    WHERE id=$userId
  Step 4: Insert transaction: type='task_earning', amount=$reward

STREAK CHECK-IN (must be inside db.transaction()):
  Step 1: SELECT from login_streaks WHERE user_id=$userId FOR UPDATE
    If no row exists: INSERT { user_id, current_streak:0, last_checkin_date:null }
  Step 2: If last_checkin_date = getEthiopiaToday():
    throw { httpStatus: 400, clientMessage: "Already checked in today" }
  Step 3: Compute new streak:
    if last_checkin_date = getEthiopiaYesterday(): newStreak = currentStreak + 1
    else: newStreak = 1
  Step 4: UPDATE login_streaks SET current_streak=newStreak, last_checkin_date=today, updated_at=NOW()
  Step 5: Atomic credit +5 ETB:
    UPDATE users SET main_balance = main_balance + 5::numeric WHERE id=$userId
  Step 6: Insert transaction: type='streak_bonus', amount=5

COMMISSIONS (called inside deposit approval transaction, no separate tx needed):
  Walk referral chain using referred_by_user_id, up to 3 levels:
  
  Level 1 (direct referrer of depositing user): 5% of deposit amount
  Level 2 (referrer of level 1): 3% of deposit amount
  Level 3 (referrer of level 2): 2% of deposit amount
  
  For each level where a referrer exists:
    commission = (depositAmount × rate).toFixed(2)
    1. UPDATE users SET main_balance = main_balance + $commission::numeric WHERE id=$referrerId
    2. INSERT into commissions: { userId:referrerId, fromUserId:depositingUserId, level, amount, description }
    3. INSERT into transactions: { userId:referrerId, type:'commission', amount, description }
    Move up: currentUserId = referrerId (to find next level)
    Stop if referred_by_user_id is null

REFERRAL NETWORK QUERIES (batch SQL — critical):
  getChildIds(parentIds: number[]): number[]
    SELECT id FROM users WHERE referred_by_user_id IN (...parentIds)
    Returns array of user IDs
  
  getBatchAffiliateEntries(userIds, viewerUserId):
    Run 3 queries in parallel (Promise.all):
    1. SELECT * FROM users WHERE id IN (...userIds)
    2. SELECT from user_packages JOIN packages WHERE user_id IN (...userIds) AND is_active=true
    3. SELECT from commissions WHERE user_id=$viewerUserId AND from_user_id IN (...userIds)
    Assemble result in memory — 3 queries regardless of network size
  
  GET /api/referrals/network:
    level1Ids = getChildIds([userId])
    level2Ids = getChildIds(level1Ids)
    level3Ids = getChildIds(level2Ids)
    [level1, level2, level3] = await Promise.all([
      getBatchAffiliateEntries(level1Ids, userId),
      getBatchAffiliateEntries(level2Ids, userId),
      getBatchAffiliateEntries(level3Ids, userId),
    ])
    Total: 3 (getChildIds) + 9 (getBatchAffiliateEntries) = 12 DB queries max, regardless of network size

VIP UPGRADE GOALS:
  VIP Elite: 5 direct referrals + 15,000 ETB downline volume
  VIP Apex:  10 direct referrals + 50,000 ETB downline volume
  VIP Titan: 20 direct referrals + 150,000 ETB downline volume
  VIP Alpha: 50 direct referrals + 500,000 ETB downline volume
  downlineVolume = SUM of active package costs of level-1 referrals
  progressPercent = round(((refProgress + volProgress) / 2) × 100)

TIMEZONE — ETHIOPIA (EAT = UTC+3, no DST, year-round):
  function getEthiopiaToday(): string {
    const eatMs = Date.now() + 3 * 60 * 60 * 1000;
    return new Date(eatMs).toISOString().split("T")[0];  // "YYYY-MM-DD"
  }
  function getEthiopiaYesterday(): string {
    const eatMs = Date.now() + 3 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000;
    return new Date(eatMs).toISOString().split("T")[0];
  }
  Used for: yield idempotency, task daily reset, streak dates.
  Never use new Date().toISOString() directly — that is UTC which is wrong for Ethiopian users.

══════════════════════════════════════════════════════════════════════════════
SECTION D — COMPLETE API ROUTES
══════════════════════════════════════════════════════════════════════════════

All routes are under /api prefix. Express 5, TypeScript.
requireAuth = middleware that validates Bearer token and attaches req.user
requireAdmin = middleware that checks req.user.isAdmin === true

GET  /api/
  → { status: "ok" }

POST /api/auth/register
  Body: { fullName: string, username: string, email: string,
          password: string, confirmPassword: string, referralCode?: string }
  Validates: password === confirmPassword
  Checks: username + email not already taken
  Creates user, generates token
  → 201 { user: FormattedUser, token: string }

POST /api/auth/login
  Body: { usernameOrEmail: string, password: string }
  Looks up by username OR email
  Verifies password (scrypt + legacy SHA-256 upgrade path)
  Updates last_login_at
  → 200 { user: FormattedUser, token: string }

POST /api/auth/logout          [requireAuth]
  Calls revokeToken(req.token)
  → 200 { message: "Logged out successfully" }

POST /api/auth/forgot-password
  Body: { email: string }
  → 200 { message: "If that email is registered, a reset link has been sent." }
  CURRENTLY A STUB — implement fully in Task H4e below

GET  /api/auth/me              [requireAuth]
  → 200 FormattedUser

  FormattedUser shape:
  {
    id: number, fullName: string, username: string, email: string,
    mainBalance: number, totalYield: number, totalDeposited: number, totalWithdrawn: number,
    referralCode: string, isAdmin: boolean, createdAt: string (ISO),
    profilePhoto?: string | null
  }

GET  /api/dashboard/summary    [requireAuth]
  Fetches FRESH balance from DB (NOT req.user.mainBalance — that is stale)
  Fetches active user_package JOIN packages
  Computes: reserveFloor = activePkg.cost × 0.4
  → {
      mainBalance: number, totalYield: number,
      totalDeposited: number, totalWithdrawn: number,
      activePackageName: string | null, activePackageDailyReturn: number | null,
      packageExpiresAt: string | null (ISO), daysUntilExpiry: number | null,
      progressToNextTier: number (0–100), nextTierName: string | null,
      reserveFloor: number
    }

GET  /api/dashboard/streak     [requireAuth]
  Upserts login_streaks row if it doesn't exist
  Builds 7-day calendar using EAT timezone
  → {
      currentStreak: number,
      days: Array<{ dayNumber: number, date: string, checkedIn: boolean, bonus: number }>,
      todayCheckedIn: boolean,
      bonusPerDay: number  (always 5)
    }

POST /api/dashboard/streak/checkin  [requireAuth]
  → { success: true, bonusEarned: 5, newStreak: number, newBalance: number }

GET  /api/packages             [requireAuth]
  → Package[] ordered by sort_order
  Package: { id, name, cost, dailyReturn, totalYield, durationDays, isLocked, tier }

POST /api/packages/:id/purchase  [requireAuth]
  → { success: true, package: Package, newBalance: number, message: string, shortfallAmount: null }
  OR on insufficient funds:
  → { success: false, message: string, shortfallAmount: number }

GET  /api/packages/active      [requireAuth]
  → {
      package: Package,
      purchasedAt: string (ISO), expiresAt: string (ISO),
      daysRemaining: number,
      totalEarnedSoFar: number,   (daysElapsed × dailyReturn, computed not stored)
      dailyEarningsToday: number
    }
  OR 404 if no active package

GET  /api/tasks                [requireAuth]
  → Array<{
      id, title, description,
      reward: number, taskType, actionUrl,
      isCompleted: boolean, completedAt: string | null
    }>
  Uses EAT timezone for "today" comparison

POST /api/tasks/:id/complete   [requireAuth]
  → { success: true, rewardEarned: number, newBalance: number, message: string }

POST /api/deposits             [requireAuth]
  Body: { amount: number, senderName: string, receiptBase64?: string }
  Validates: 500 <= amount <= 50000
  Stores receiptBase64 as receipt_url in DB
  → 201 {
      id, amount, senderName,
      receiptUrl: "receipt_uploaded" | null,  (never echo base64 back)
      status: "pending", createdAt: string
    }

GET  /api/deposits/history     [requireAuth]
  → Array<{ id, amount, senderName, receiptUrl: "receipt_uploaded"|null, status, createdAt }>

GET  /api/withdrawals/settings  [requireAuth]
  → { bankName, accountName, walletId, isConfigured: boolean }

PUT  /api/withdrawals/settings  [requireAuth]
  Body: { bankName: string, accountName: string, walletId: string }
  → { bankName, accountName, walletId, isConfigured: true }

POST /api/withdrawals          [requireAuth]
  Body: { amount: number }
  → 201 { id, amount, status: "pending", bankName, accountName, walletId, createdAt }

GET  /api/withdrawals/history  [requireAuth]
  → Array<{ id, amount, status, bankName, accountName, walletId, createdAt }>

GET  /api/referrals/info       [requireAuth]
  → {
      referralCode, referralLink,
      totalDirectReferrals, totalNetworkSize, totalCommissionsEarned,
      level1Count, level2Count, level3Count
    }

GET  /api/referrals/network    [requireAuth]
  → {
      level1: AffiliateEntry[],
      level2: AffiliateEntry[],
      level3: AffiliateEntry[]
    }
  AffiliateEntry: { id, username, joinedAt, activeDepositAmount, commissionPaid, hasActivePackage }

GET  /api/referrals/vip-upgrades  [requireAuth]
  → Array<{
      id, packageName,
      requiredDirectReferrals, requiredDownlineVolume,
      currentDirectReferrals, currentDownlineVolume,
      isUnlocked: boolean, progressPercent: number
    }>

GET  /api/transactions         [requireAuth]
  Query param: ?type=all|deposits|withdrawals|task_earnings|commissions|packages|yields|streaks
  TYPE_MAP:
    deposits      → ["deposit"]
    withdrawals   → ["withdrawal"]
    task_earnings → ["task_earning"]
    commissions   → ["commission"]
    packages      → ["package_purchase"]
    yields        → ["daily_yield"]
    streaks       → ["streak_bonus"]
  Filter applied in SQL using WHERE type IN (...) — never in JS
  Unknown type → return []
  → Array<{ id, type, amount, description, status, createdAt }>

GET  /api/user/profile         [requireAuth]
  → FormattedUser (including profilePhoto)

PATCH /api/user/profile        [requireAuth]
  Body: { fullName?: string, email?: string }
  → Updated FormattedUser

PATCH /api/user/profile-photo  [requireAuth]
  Body: { photoBase64: string }  — must start with "data:image/"
  → Updated FormattedUser

DELETE /api/user/delete        [requireAuth]
  Body: { confirmationText: "DELETE MY ACCOUNT" }
  → { message: "Account successfully deleted." }

POST /api/yields/credit-daily  [requireAuth]
  → { credited: boolean, reason?: string, yieldAmount: number, packageName?: string, newBalance?: number }

GET  /api/admin/stats          [requireAuth + requireAdmin]
  Uses SQL SUM() aggregation — never fetches all rows and reduces in JS
  → {
      totalUsers: number,
      totalDeposited: number, totalWithdrawn: number,
      pendingDepositsCount: number, pendingDepositsAmount: number,
      pendingWithdrawalsCount: number, pendingWithdrawalsAmount: number,
      totalActivePackages: number
    }

GET  /api/admin/deposits/pending  [requireAuth + requireAdmin]
  Joins deposits with users
  → Array<{
      id, userId, username, fullName, amount, senderName,
      receiptUrl: string | null,  ← FULL base64 here for admin image display
      status, createdAt
    }>

POST /api/admin/deposits/:id/approve  [requireAuth + requireAdmin]
  → { message: "Deposit approved and credited" }

POST /api/admin/deposits/:id/reject   [requireAuth + requireAdmin]
  → { message: "Deposit rejected" }

GET  /api/admin/withdrawals/pending  [requireAuth + requireAdmin]
  Joins withdrawals with users
  → Array<{ id, userId, username, fullName, amount, bankName, accountName, walletId, status, createdAt }>

POST /api/admin/withdrawals/:id/approve  [requireAuth + requireAdmin]
  → { message: "Withdrawal approved" }

POST /api/admin/withdrawals/:id/reject   [requireAuth + requireAdmin]
  → { message: "Withdrawal rejected and refunded" }

══════════════════════════════════════════════════════════════════════════════
SECTION E — FRONTEND PAGES & ROUTING
══════════════════════════════════════════════════════════════════════════════

Router: Wouter (NOT React Router). Base path: import.meta.env.BASE_URL

Route guards:
  ProtectedRoute: if user===null after loading → redirect to /login
  PublicRoute:    if user!==null after loading → redirect to /dashboard

PUBLIC ROUTES:
  /login           Login page — usernameOrEmail + password, calls POST /api/auth/login
  /register        Register form — fullName, username, email, password, confirmPassword,
                   optional referralCode (auto-filled from ?ref= URL query param)
  /forgot-password Email input form (currently a stub)

PROTECTED ROUTES:
  /                 → Redirect to /dashboard
  /dashboard        Balance cards (mainBalance, totalYield, totalDeposited, totalWithdrawn),
                    active package info (name, daily return, days remaining),
                    streak 7-day calendar with check-in button,
                    quick action buttons: Deposit, Withdraw, Tasks, Referral
  /packages         9 investment tier cards ordered by sort_order,
                    purchase flow with insufficient balance handling (shows shortfall)
  /tasks            Daily task list with "Complete" buttons,
                    shows reward amount, completion status, completed timestamp
  /deposit          Amount input (slider + number field, 500–50,000 ETB),
                    sender name field, receipt photo upload (camera capture or file select,
                    converts to base64)
  /withdraw         Amount input, shows current balance + available after reserve floor,
                    confirmation with bank details from settings
  /withdrawal-settings  Bank name, account name, wallet ID form
  /referral         Referral link with copy button,
                    network stats (level 1/2/3 counts), total commissions earned
  /affiliate-network  3-level expandable referral tree
                      Each entry: username, joined date, active package amount, commission paid
  /vip-upgrades     4 VIP goal cards (Elite, Apex, Titan, Alpha),
                    progress bars for direct referrals + downline volume
  /transactions     Tabbed transaction history:
                    All | Deposits | Withdrawals | Tasks | Commissions | Packages | Yields | Streaks
  /support          Support/contact page
  /delete-account   Single input: must type "DELETE MY ACCOUNT" exactly, then confirm
  /profile          Profile photo upload (camera/file → base64),
                    fullName and email edit form
  /admin            Admin panel (only visible if user.isAdmin === true):
                    Platform stats at top,
                    Pending deposits table with receipt image display (img src=receiptUrl),
                    Approve/Reject buttons,
                    Pending withdrawals table with Approve/Reject buttons

AUTH FLOW:
  AuthProvider wraps entire app tree
  Token stored in localStorage["token"] on login
  On mount: reads token from localStorage, calls GET /api/auth/me (React Query)
  If GET /api/auth/me returns 401: clear localStorage token, reset user to null
  Dev shortcut: ?devtoken=<token> in URL writes to sessionStorage (clears on tab close)
  setAuthTokenGetter(() => localStorage.getItem("token") ?? sessionStorage.getItem("token"))
    — configures the API client to inject token into every request header

POLLING:
  useDepositWatcher (runs in AppLayout — active on every authenticated page):
  - GET /api/deposits/history every 30,000ms
  - GET /api/withdrawals/history every 30,000ms
  - pending→approved: show deposit approved toast
  - pending→rejected: show withdrawal rejected toast

API CLIENT:
  @workspace/api-client-react — Orval-generated typed React Query hooks
  Every API call goes through this client, not raw fetch
  Base URL must be VITE_API_URL environment variable
  Token is injected via setAuthTokenGetter

══════════════════════════════════════════════════════════════════════════════
SECTION F — SEED DATA (exact values)
══════════════════════════════════════════════════════════════════════════════

PACKAGES — delete all then insert (9 rows):
  ('VIP 1',     500,    35,    245,    7, false, 'vip1',  1)
  ('VIP 2',     1000,   80,    560,    7, false, 'vip2',  2)
  ('VIP 3',     2000,   180,   1260,   7, false, 'vip3',  3)
  ('VIP 4',     5000,   500,   3500,   7, false, 'vip4',  4)
  ('VIP 5',     10000,  1100,  7700,   7, false, 'vip5',  5)
  ('VIP Elite', 25000,  3000,  21000,  7, true,  'elite', 6)
  ('VIP Apex',  50000,  7000,  49000,  7, true,  'apex',  7)
  ('VIP Titan', 100000, 16000, 112000, 7, true,  'titan', 8)
  ('VIP Alpha', 250000, 45000, 315000, 7, true,  'alpha', 9)
  Columns: (name, cost, daily_return, total_yield, duration_days, is_locked, tier, sort_order)

DAILY TASKS — delete all then insert (6 rows):
  ('Watch a BirrStream video',      'Watch any video on our streaming platform for 5 minutes',                15, 'stream_video', null,                        true)
  ('Visit the BirrStream homepage', 'Open and browse the BirrStream main page for 2 minutes',                10, 'open_page',    null,                        true)
  ('Join BirrStream Telegram',      'Join our official Telegram channel for updates and bonuses',            20, 'join_telegram','https://t.me/birrstream',   true)
  ('Share your referral link',      'Share your unique referral link with at least one person today',        25, 'other',        null,                        true)
  ('Complete your profile',         'Ensure your full name and email are up to date in your profile',        10, 'other',        null,                        true)
  ('Watch 2 more videos',           'Watch 2 additional streaming videos on BirrStream',                    20, 'stream_video', null,                        true)
  Columns: (title, description, reward, task_type, action_url, is_active)

══════════════════════════════════════════════════════════════════════════════
SECTION G — TASK 1: BUILD THE SUPABASE DATABASE
══════════════════════════════════════════════════════════════════════════════

Deliver a single complete SQL file named `supabase_setup.sql` that can be
pasted into the Supabase SQL Editor and run in one click. Requirements:

G1. All 11 tables with exact column names (snake_case), types, and constraints
G2. All foreign keys:
    users.referred_by_user_id → users(id) -- self-referential, nullable
    user_packages.user_id → users(id) ON DELETE RESTRICT
    user_packages.package_id → packages(id) ON DELETE RESTRICT
    transactions.user_id → users(id) ON DELETE RESTRICT
    deposits.user_id → users(id) ON DELETE RESTRICT
    withdrawals.user_id → users(id) ON DELETE RESTRICT
    withdrawal_settings.user_id → users(id) ON DELETE RESTRICT
    commissions.user_id → users(id) ON DELETE RESTRICT
    commissions.from_user_id → users(id) ON DELETE RESTRICT
    daily_tasks (no FK)
    user_task_completions.user_id → users(id) ON DELETE RESTRICT
    user_task_completions.task_id → daily_tasks(id) ON DELETE RESTRICT
    login_streaks.user_id → users(id) ON DELETE RESTRICT

G3. All indexes (create after tables):
    CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
    CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(user_id, type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_deposits_user_status ON deposits(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status ON withdrawals(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
    CREATE INDEX IF NOT EXISTS idx_user_packages_user_active ON user_packages(user_id, is_active);
    CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_commissions_from_user_id ON commissions(from_user_id);

G4. Check constraints:
    ALTER TABLE deposits ADD CONSTRAINT chk_deposits_status
      CHECK (status IN ('pending','approved','rejected'));
    ALTER TABLE withdrawals ADD CONSTRAINT chk_withdrawals_status
      CHECK (status IN ('pending','approved','rejected'));
    ALTER TABLE transactions ADD CONSTRAINT chk_transactions_status
      CHECK (status IN ('pending','completed','rejected'));
    ALTER TABLE transactions ADD CONSTRAINT chk_transactions_type
      CHECK (type IN ('deposit','withdrawal','task_earning','commission',
                      'daily_yield','streak_bonus','package_purchase'));
    ALTER TABLE commissions ADD CONSTRAINT chk_commissions_level
      CHECK (level IN (1,2,3));

G5. The unique constraint on user_task_completions MUST be named exactly:
    CONSTRAINT uq_task_completion_daily UNIQUE (user_id, task_id, date)

G6. Insert all seed data from SECTION F using INSERT ... ON CONFLICT DO NOTHING

G7. Entire script must be idempotent:
    Use CREATE TABLE IF NOT EXISTS
    Use CREATE INDEX IF NOT EXISTS
    Use ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS (wrap in DO $$ block if needed)

CRITICAL REMINDER: Use port 5432 (direct connection), NOT port 6543 (Supavisor pooler).
The app uses SELECT ... FOR UPDATE which fails in pooler transaction mode.

══════════════════════════════════════════════════════════════════════════════
SECTION H — TASK 2: UPDATE THE REPLIT BACKEND
══════════════════════════════════════════════════════════════════════════════

H1. RESTRICT CORS (update artifacts/api-server/src/app.ts)
  Replace: app.use(cors())
  With:
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
    ].filter(Boolean) as string[];

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }));

H2. ENVIRONMENT VARIABLES REQUIRED ON REPLIT (add to Replit Secrets):
    DATABASE_URL  = postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
    PORT          = (automatically injected by Replit — do not set manually)
    SESSION_SECRET = (already exists — reserved for future use)
    FRONTEND_URL  = https://your-app.vercel.app   (set after Vercel deploy)
    SMTP_HOST     = smtp.gmail.com
    SMTP_PORT     = 587
    SMTP_USER     = your@gmail.com
    SMTP_PASS     = your-gmail-app-password
    (SMTP vars needed for H4e — forgot password email)

H3. ADD PACKAGE EXPIRY DAEMON (update artifacts/api-server/src/index.ts)
  After app.listen(), add:
    import { db } from "@workspace/db";
    import { userPackagesTable } from "@workspace/db";
    import { eq, sql } from "drizzle-orm";

    // Mark expired packages as inactive — runs every hour
    setInterval(async () => {
      try {
        const result = await db
          .update(userPackagesTable)
          .set({ isActive: false })
          .where(
            and(
              eq(userPackagesTable.isActive, true),
              sql`expires_at < NOW()`
            )
          );
        if (result.rowCount && result.rowCount > 0) {
          logger.info({ count: result.rowCount }, "Expired packages deactivated");
        }
      } catch (err) {
        logger.error({ err }, "Package expiry daemon error");
      }
    }, 60 * 60 * 1000);

H4. ADD RATE LIMITING
  Install: pnpm --filter @workspace/api-server add express-rate-limit
  
  Create artifacts/api-server/src/middlewares/rate-limit.ts:
    import rateLimit from "express-rate-limit";

    export const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,  // 15 minutes
      max: 5,
      message: { error: "Too many login attempts. Please try again in 15 minutes." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    export const registerLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 3,
      message: { error: "Too many registration attempts. Please try again later." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    export const yieldLimiter = rateLimit({
      windowMs: 24 * 60 * 60 * 1000,  // 24 hours
      max: 3,
      keyGenerator: (req) => String((req as any).user?.id ?? req.ip),
      message: { error: "Daily yield already credited. Come back tomorrow." },
      standardHeaders: true,
      legacyHeaders: false,
    });

    export const taskLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,  // 1 hour
      max: 20,
      keyGenerator: (req) => String((req as any).user?.id ?? req.ip),
      message: { error: "Too many task completions. Please slow down." },
      standardHeaders: true,
      legacyHeaders: false,
    });
  
  Apply in routes:
    POST /api/auth/login      → loginLimiter before handler
    POST /api/auth/register   → registerLimiter before handler
    POST /api/yields/credit-daily → requireAuth, then yieldLimiter
    POST /api/tasks/:id/complete  → requireAuth, then taskLimiter

H5. IMPLEMENT FORGOT PASSWORD FULLY
  Add to Supabase SQL (add to supabase_setup.sql or run separately):
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id         serial PRIMARY KEY,
      user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL UNIQUE,
      expires_at timestamptz NOT NULL,
      used       boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

  Add to Drizzle schema (lib/db/src/schema/auth.ts — new file):
    import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
    import { usersTable } from "./users";

    export const passwordResetTokensTable = pgTable("password_reset_tokens", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
      tokenHash: text("token_hash").notNull().unique(),
      expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
      used: boolean("used").notNull().default(false),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    });

  Export from lib/db/src/schema/index.ts:
    export * from "./auth";

  Install nodemailer: pnpm --filter @workspace/api-server add nodemailer
                      pnpm --filter @workspace/api-server add -D @types/nodemailer

  Update POST /api/auth/forgot-password in artifacts/api-server/src/routes/auth.ts:
    import nodemailer from "nodemailer";
    import { passwordResetTokensTable } from "@workspace/db";
    import { createHash } from "crypto";

    router.post("/auth/forgot-password", async (req, res) => {
      const parsed = ForgotPasswordBody.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input" });
        return;
      }
      const { email } = parsed.data;

      // Always return 200 — do not reveal whether email exists
      const [user] = await db.select({ id: usersTable.id })
        .from(usersTable).where(eq(usersTable.email, email)).limit(1);

      if (user) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate any existing unused tokens for this user
        await db.update(passwordResetTokensTable)
          .set({ used: true })
          .where(and(
            eq(passwordResetTokensTable.userId, user.id),
            eq(passwordResetTokensTable.used, false)
          ));

        await db.insert(passwordResetTokensTable).values({
          userId: user.id,
          tokenHash,
          expiresAt,
        });

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
        await transporter.sendMail({
          from: `"BirrStream" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "BirrStream — Reset Your Password",
          text: `Click the link below to reset your password (valid for 1 hour):\n\n${resetLink}`,
          html: `<p>Click the link below to reset your password (valid for 1 hour):</p>
                 <p><a href="${resetLink}">${resetLink}</a></p>`,
        });
      }

      res.json({ message: "If that email is registered, a reset link has been sent." });
    });

  Add POST /api/auth/reset-password to artifacts/api-server/src/routes/auth.ts:
    router.post("/auth/reset-password", async (req, res) => {
      const { token, newPassword } = req.body ?? {};
      if (typeof token !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
        res.status(400).json({ error: "Invalid input. Password must be at least 8 characters." });
        return;
      }

      const tokenHash = createHash("sha256").update(token).digest("hex");
      const [tokenRow] = await db.select().from(passwordResetTokensTable)
        .where(eq(passwordResetTokensTable.tokenHash, tokenHash)).limit(1);

      if (!tokenRow || tokenRow.used || new Date(tokenRow.expiresAt) < new Date()) {
        res.status(400).json({ error: "Invalid or expired reset link. Please request a new one." });
        return;
      }

      const newHash = await hashPassword(newPassword);

      await db.transaction(async (tx) => {
        await tx.update(usersTable)
          .set({ passwordHash: newHash })
          .where(eq(usersTable.id, tokenRow.userId));
        await tx.update(passwordResetTokensTable)
          .set({ used: true })
          .where(eq(passwordResetTokensTable.id, tokenRow.id));
      });

      res.json({ message: "Password updated successfully. You can now log in." });
    });

H6. ADD ADMIN USER MANAGEMENT ENDPOINTS
  Create artifacts/api-server/src/routes/admin-users.ts:

    import { Router } from "express";
    import { db } from "@workspace/db";
    import { usersTable, userPackagesTable, packagesTable, transactionsTable } from "@workspace/db";
    import { eq, desc, sql } from "drizzle-orm";
    import { requireAuth } from "../middlewares/auth";
    import { requireAdmin } from "../middlewares/admin";

    const router = Router();

    // GET /api/admin/users — list all users (paginated, 50 per page)
    router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
      const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
      const limit = 50;
      const offset = (page - 1) * limit;

      const users = await db.select({
        id: usersTable.id,
        username: usersTable.username,
        fullName: usersTable.fullName,
        email: usersTable.email,
        mainBalance: usersTable.mainBalance,
        isAdmin: usersTable.isAdmin,
        createdAt: usersTable.createdAt,
      }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);

      res.json({
        users: users.map(u => ({ ...u, mainBalance: parseFloat(u.mainBalance) })),
        total: Number(count),
        page,
        totalPages: Math.ceil(Number(count) / limit),
      });
    });

    // GET /api/admin/users/:id — full user detail
    router.get("/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
      const userId = parseInt(String(req.params.id), 10);
      if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!user) { res.status(404).json({ error: "User not found" }); return; }

      const [activePackage] = await db.select().from(userPackagesTable)
        .innerJoin(packagesTable, eq(userPackagesTable.packageId, packagesTable.id))
        .where(and(eq(userPackagesTable.userId, userId), eq(userPackagesTable.isActive, true)))
        .limit(1);

      const recentTransactions = await db.select().from(transactionsTable)
        .where(eq(transactionsTable.userId, userId))
        .orderBy(desc(transactionsTable.createdAt)).limit(10);

      const [commissionTotal] = await db.select({
        total: sql<string>`coalesce(sum(amount), '0')`
      }).from(transactionsTable).where(
        and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, 'commission'))
      );

      res.json({
        id: user.id, username: user.username, fullName: user.fullName, email: user.email,
        mainBalance: parseFloat(user.mainBalance),
        totalYield: parseFloat(user.totalYield),
        totalDeposited: parseFloat(user.totalDeposited),
        totalWithdrawn: parseFloat(user.totalWithdrawn),
        referralCode: user.referralCode, isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
        activePackage: activePackage ? activePackage.packages.name : null,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id, type: t.type, amount: parseFloat(t.amount),
          description: t.description, status: t.status, createdAt: t.createdAt.toISOString()
        })),
        totalCommissionsEarned: parseFloat(commissionTotal.total),
      });
    });

    // POST /api/admin/users/:id/adjust-balance — manually credit or debit balance
    router.post("/admin/users/:id/adjust-balance", requireAuth, requireAdmin, async (req, res) => {
      const userId = parseInt(String(req.params.id), 10);
      if (isNaN(userId)) { res.status(400).json({ error: "Invalid user id" }); return; }

      const { amount, reason } = req.body ?? {};
      if (typeof amount !== "number" || amount === 0 || typeof reason !== "string" || !reason.trim()) {
        res.status(400).json({ error: "amount (non-zero number) and reason (string) are required" });
        return;
      }

      try {
        const result = await db.transaction(async (tx) => {
          const [updated] = await tx.update(usersTable)
            .set({ mainBalance: sql`main_balance + ${String(amount)}::numeric` })
            .where(
              amount < 0
                ? and(eq(usersTable.id, userId), sql`main_balance + ${String(amount)}::numeric >= 0`)
                : eq(usersTable.id, userId)
            )
            .returning({ mainBalance: usersTable.mainBalance });

          if (!updated) {
            throw Object.assign(new Error("INSUFFICIENT"), {
              httpStatus: 400,
              clientMessage: "Cannot reduce balance below zero.",
            });
          }

          await tx.insert(transactionsTable).values({
            userId,
            type: "admin_adjustment" as any,
            amount: String(Math.abs(amount)),
            description: `Admin balance adjustment: ${reason}`,
            status: "completed",
          });

          return { newBalance: parseFloat(updated.mainBalance) };
        });

        res.json({ message: "Balance adjusted", newBalance: result.newBalance });
      } catch (err: any) {
        if (err.httpStatus === 400) res.status(400).json({ error: err.clientMessage });
        else throw err;
      }
    });

    export default router;

  Register in artifacts/api-server/src/routes/index.ts:
    import adminUsersRouter from "./admin-users";
    // ... add: router.use(adminUsersRouter);

H7. ADD COMMISSION HISTORY ENDPOINT
  Add to artifacts/api-server/src/routes/referrals.ts:

    router.get("/referrals/commissions", requireAuth, async (req, res) => {
      const user = (req as any).user;

      const rows = await db.select({
        id: commissionsTable.id,
        fromUserId: commissionsTable.fromUserId,
        fromUsername: usersTable.username,
        level: commissionsTable.level,
        amount: commissionsTable.amount,
        description: commissionsTable.description,
        createdAt: commissionsTable.createdAt,
      })
      .from(commissionsTable)
      .innerJoin(usersTable, eq(commissionsTable.fromUserId, usersTable.id))
      .where(eq(commissionsTable.userId, user.id))
      .orderBy(desc(commissionsTable.createdAt));

      res.json(rows.map(r => ({
        id: r.id,
        fromUsername: r.fromUsername,
        level: r.level,
        amount: parseFloat(r.amount),
        description: r.description,
        createdAt: r.createdAt.toISOString(),
      })));
    });

══════════════════════════════════════════════════════════════════════════════
SECTION I — TASK 3: DEPLOY FRONTEND TO VERCEL
══════════════════════════════════════════════════════════════════════════════

I1. FIX VITE CONFIG FOR VERCEL (update artifacts/birrstream/vite.config.ts)

  The current vite.config.ts throws if PORT or BASE_PATH are missing.
  On Vercel these env vars do not exist. Change the error-throwing lines to graceful fallbacks:

  Change this block:
    const rawPort = process.env.PORT;
    if (!rawPort) {
      throw new Error("PORT environment variable is required but was not provided.");
    }
    const port = Number(rawPort);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid PORT value: "${rawPort}"`);
    }
    const basePath = process.env.BASE_PATH;
    if (!basePath) {
      throw new Error("BASE_PATH environment variable is required but was not provided.");
    }

  To this:
    const port = Number(process.env.PORT ?? "3000");
    const basePath = process.env.BASE_PATH ?? "/";

  Keep everything else in vite.config.ts exactly the same.
  The Replit-specific plugins are already gated by:
    process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
  So they will NOT run on Vercel (REPL_ID is undefined there). No changes needed there.

I2. CONFIGURE API BASE URL

  The @workspace/api-client-react package must read the API base URL from
  an environment variable. Find where the base URL is set in:
    lib/api-spec/zod/client-react/
  
  It likely has a file like `client.ts` or `custom-instance.ts` that configures Axios or fetch.
  Ensure the base URL is:
    const API_BASE = import.meta.env.VITE_API_URL ?? "";
  
  If it is currently hardcoded, update it to read from VITE_API_URL.
  The generated client typically has a mutator or Axios instance configuration file.

I3. CREATE SPA REWRITE CONFIG (create artifacts/birrstream/vercel.json)

  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      },
      {
        "source": "/assets/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      }
    ]
  }

  The rewrites array is CRITICAL for a SPA deployed on Vercel. Without it,
  navigating directly to /dashboard or any non-root route returns a 404 from
  Vercel's CDN because there is no physical /dashboard/index.html file.
  The rewrite sends all requests to index.html and lets Wouter handle routing client-side.

I4. CREATE MONOREPO ROOT VERCEL CONFIG (create vercel.json at workspace root)

  Because this is a pnpm monorepo and the frontend is inside artifacts/birrstream/,
  Vercel needs to know where to build from and where the output is:

  {
    "buildCommand": "pnpm --filter @workspace/birrstream run build",
    "outputDirectory": "artifacts/birrstream/dist/public",
    "installCommand": "pnpm install",
    "framework": null
  }

  If Vercel struggles with pnpm in a monorepo, also add to the Vercel project settings UI:
    Install Command: npm install -g pnpm && pnpm install
    Build Command:   pnpm --filter @workspace/birrstream run build
    Output Dir:      artifacts/birrstream/dist/public

I5. VERCEL ENVIRONMENT VARIABLES (set in Vercel project dashboard → Settings → Environment Variables)

  VITE_API_URL = https://your-replit-api-name.replit.app
    (your deployed Replit backend URL — get this after deploying the backend)
  BASE_PATH    = /
    (optional, vite.config.ts now falls back to "/" if missing)
  NODE_ENV     = production
    (Vercel sets this automatically — just confirming)

  NOTE: VITE_ prefix is required for Vite to expose the variable to the browser bundle.
  Without the prefix, import.meta.env.VITE_API_URL will be undefined at runtime.

I6. CUSTOM DOMAIN ON VERCEL (optional)

  In Vercel project → Settings → Domains → Add Domain
  Enter your domain (e.g. birrstream.com)
  Add the DNS CNAME record Vercel provides in your domain registrar's DNS panel:
    Type:  CNAME
    Name:  @ (or www)
    Value: cname.vercel-dns.com
  Vercel issues the SSL certificate automatically via Let's Encrypt.
  Once live, update FRONTEND_URL on Replit: FRONTEND_URL = https://birrstream.com

══════════════════════════════════════════════════════════════════════════════
SECTION J — TASK 4: DEPLOY BACKEND ON REPLIT
══════════════════════════════════════════════════════════════════════════════

J1. Click Deploy button in Replit for the api-server artifact.
    This creates a permanent production URL:
    https://api-server.[your-username].replit.app

J2. After deploying, copy the production URL and:
    a. Set it as VITE_API_URL in Vercel project environment variables
    b. Redeploy the Vercel frontend so the new env var takes effect
    c. Set FRONTEND_URL on Replit Secrets to your Vercel domain

J3. The deployed Replit backend uses the same Secrets as development.
    Verify these Secrets are set in Replit:
    DATABASE_URL  → your Supabase connection string (port 5432)
    SESSION_SECRET → your secret key
    FRONTEND_URL  → your Vercel domain
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS → for forgot password emails

J4. The production flow after full deployment:
    User browser → Vercel CDN (serves React SPA)
      ↓ API calls
    Replit backend (Express API)
      ↓ SQL queries
    Supabase PostgreSQL (database)

══════════════════════════════════════════════════════════════════════════════
SECTION K — COMPLETE LIST OF DELIVERABLES
══════════════════════════════════════════════════════════════════════════════

Deliver ALL of the following files completely. No stubs. No placeholders.

K1. supabase_setup.sql
    Complete idempotent SQL: all 11 tables + password_reset_tokens + indexes
    + check constraints + named unique constraint + all seed data.

K2. artifacts/api-server/src/app.ts (updated)
    CORS restricted to FRONTEND_URL + localhost origins.

K3. artifacts/api-server/src/index.ts (updated)
    Package expiry setInterval daemon added after app.listen().

K4. artifacts/api-server/src/middlewares/rate-limit.ts (new file)
    loginLimiter, registerLimiter, yieldLimiter, taskLimiter.

K5. artifacts/api-server/src/routes/auth.ts (updated)
    Forgot password fully implemented with nodemailer.
    Reset password endpoint added.
    Rate limiters applied to login and register routes.

K6. artifacts/api-server/src/routes/yields.ts (updated)
    yieldLimiter applied after requireAuth.

K7. artifacts/api-server/src/routes/tasks.ts (updated)
    taskLimiter applied after requireAuth on the complete endpoint.

K8. artifacts/api-server/src/routes/admin-users.ts (new file)
    GET /api/admin/users (paginated)
    GET /api/admin/users/:id (full detail)
    POST /api/admin/users/:id/adjust-balance (atomic, creates transaction record)

K9. artifacts/api-server/src/routes/referrals.ts (updated)
    GET /api/referrals/commissions endpoint added.

K10. artifacts/api-server/src/routes/index.ts (updated)
     Import and register adminUsersRouter.

K11. lib/db/src/schema/auth.ts (new file)
     passwordResetTokensTable Drizzle schema.

K12. lib/db/src/schema/index.ts (updated)
     Export new auth schema: export * from "./auth";

K13. artifacts/birrstream/vite.config.ts (updated)
     PORT and BASE_PATH use graceful fallbacks instead of throwing.

K14. artifacts/birrstream/vercel.json (new file)
     SPA rewrites + security headers + asset caching headers.

K15. vercel.json at workspace ROOT (new file)
     buildCommand, outputDirectory, installCommand for pnpm monorepo Vercel build.

K16. artifacts/birrstream/src/pages/reset-password.tsx (new file)
     Page with token (from ?token= URL param), new password input, confirm password input.
     On submit: POST /api/auth/reset-password with { token, newPassword }.
     On success: redirect to /login with success message.
     On error: display error message.

K17. artifacts/birrstream/src/App.tsx (updated)
     Add /reset-password as PublicRoute component.

K18. .env.example for api-server
     DATABASE_URL=postgresql://postgres:[PASS]@db.[REF].supabase.co:5432/postgres
     PORT=8080
     SESSION_SECRET=change-this-to-a-random-string
     FRONTEND_URL=https://your-app.vercel.app
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your@gmail.com
     SMTP_PASS=your-gmail-app-password

K19. .env.example for birrstream frontend
     VITE_API_URL=https://your-api.replit.app
     BASE_PATH=/

K20. PACKAGE INSTALL COMMANDS
     pnpm --filter @workspace/api-server add express-rate-limit
     pnpm --filter @workspace/api-server add nodemailer
     pnpm --filter @workspace/api-server add -D @types/nodemailer

K21. STEP-BY-STEP DEPLOYMENT CHECKLIST (ordered, nothing skipped)

  PHASE 1 — SUPABASE DATABASE
  ────────────────────────────
  1.  Go to supabase.com → New Project → name "birrstream" → Africa (East) region
  2.  Wait ~2 minutes for provisioning
  3.  Go to Project Settings → Database → Connection string → URI tab
  4.  Copy the URI. Replace [YOUR-PASSWORD] with your actual password.
      VERIFY it uses port 5432 (direct) NOT 6543 (pooler).
  5.  In Supabase SQL Editor: paste and run supabase_setup.sql
  6.  Verify in Table Editor: 12 tables visible, packages table has 9 rows, daily_tasks has 6 rows
  7.  Check indexes: run SELECT indexname FROM pg_indexes WHERE tablename IN ('users','transactions');

  PHASE 2 — UPDATE REPLIT BACKEND
  ────────────────────────────────
  8.  In Replit Secrets: update DATABASE_URL to your Supabase URI (port 5432)
  9.  Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to Replit Secrets
  10. Apply all code changes: K2 through K12 (app.ts, index.ts, all route files, schema)
  11. Install new packages:
      pnpm --filter @workspace/api-server add express-rate-limit nodemailer
      pnpm --filter @workspace/api-server add -D @types/nodemailer
  12. Run: pnpm --filter @workspace/db run push
      (applies passwordResetTokensTable to Supabase — other tables already exist from SQL script)
  13. Restart the "artifacts/api-server: API Server" workflow in Replit
  14. Check logs: verify "Server listening" appears with no errors
  15. Test with curl: curl https://[your-replit-dev-url]/api/ → should return {"status":"ok"}
  16. Deploy backend: click Deploy button in Replit → wait for deployment
  17. Copy the production URL: https://api-server.[username].replit.app
  18. In Replit Secrets: set FRONTEND_URL = https://your-chosen-domain.vercel.app
      (use a placeholder domain for now if Vercel not set up yet)

  PHASE 3 — DEPLOY FRONTEND TO VERCEL
  ─────────────────────────────────────
  19. Apply frontend code changes: K13 through K17 (vite.config.ts, vercel.json files,
      reset-password page, App.tsx route)
  20. Push code to GitHub (or connect Replit to GitHub if not done)
  21. Go to vercel.com → New Project → Import from GitHub
  22. In Vercel project settings configure:
      Framework:      Other (or Vite)
      Root Directory: . (monorepo root — the root vercel.json handles the build)
      (OR set Framework: Vite, Root: artifacts/birrstream if root vercel.json approach fails)
  23. In Vercel Environment Variables:
      VITE_API_URL = https://api-server.[username].replit.app   (your Replit production URL)
      BASE_PATH    = /
      NODE_ENV     = production
  24. Click Deploy in Vercel → wait for build to complete (~2–3 minutes)
  25. Note your Vercel URL: https://your-project.vercel.app
  26. In Replit Secrets: update FRONTEND_URL = https://your-project.vercel.app
  27. Redeploy the Replit backend (or just restart — env var change takes effect on next start)

  PHASE 4 — END-TO-END TESTING
  ─────────────────────────────
  28. Open https://your-project.vercel.app in a browser
  29. Register a new account → verify success
  30. Log in with new account → verify dashboard loads
  31. Submit a deposit → go to /admin → approve it → verify balance increases
  32. Purchase a package → verify balance deducted
  33. Complete a daily task → verify reward credited
  34. Do streak check-in → verify +5 ETB
  35. Test forgot password: enter your email, check inbox, click reset link, set new password
  36. Log out → verify token is invalidated (try /api/auth/me → should return 401)
  37. Register a second account using first account's referral code
  38. First account deposits and gets it approved → verify commission credited to both accounts

  PHASE 5 — CUSTOM DOMAIN (optional)
  ───────────────────────────────────
  39. Buy domain from Cloudflare, Namecheap, or Porkbun
  40. In Vercel project → Settings → Domains → Add Domain → enter your domain
  41. Copy the CNAME record Vercel provides
  42. In your domain registrar DNS settings: add the CNAME record
  43. Wait for DNS propagation (usually 5–30 minutes)
  44. Vercel issues SSL certificate automatically
  45. Update FRONTEND_URL in Replit Secrets to https://yourdomain.com
  46. Redeploy Replit backend (or restart workflow)
  47. For API subdomain (api.yourdomain.com):
      In Replit deployment settings → add custom domain: api.yourdomain.com
      In your DNS: add CNAME for api → your-replit-deploy-url.replit.app
  48. Update VITE_API_URL in Vercel to https://api.yourdomain.com
  49. Redeploy Vercel frontend

══════════════════════════════════════════════════════════════════════════════
SECTION L — CRITICAL IMPLEMENTATION RULES (must follow without exception)
══════════════════════════════════════════════════════════════════════════════

RULE 1 — ALL balance mutations MUST be inside db.transaction() and use atomic SQL:
  CORRECT:   SET main_balance = main_balance + $amount::numeric
  FORBIDDEN: const newBal = parseFloat(user.mainBalance) + amount; UPDATE SET main_balance = $newBal

RULE 2 — Admin approve/reject MUST use status-conditional atomic UPDATE:
  UPDATE ... SET status='approved' WHERE id=$id AND status='pending' RETURNING *
  If RETURNING returns 0 rows → already processed → return HTTP 400, do not proceed

RULE 3 — Daily yield MUST use SELECT ... FOR UPDATE FIRST (before the idempotency check):
  await tx.execute(sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`)
  This serializes concurrent yield credit requests for the same user.

RULE 4 — Task completion MUST rely on the DB unique constraint as the final guard:
  Catch PostgreSQL error code '23505' (unique_violation) → return 400
  Never rely solely on an application-level pre-check — it is not atomic.

RULE 5 — All "today" comparisons use Ethiopia timezone (UTC+3, EAT, no DST):
  const eatMs = Date.now() + 3 * 60 * 60 * 1000;
  const today = new Date(eatMs).toISOString().split("T")[0];
  NEVER use new Date().toISOString().split("T")[0] — that is UTC, wrong for Ethiopia.

RULE 6 — Streak check-in MUST use SELECT ... FOR UPDATE on the streak row:
  await tx.select().from(loginStreakTable).where(...).for("update")
  This prevents concurrent double check-in from two browser tabs.

RULE 7 — Referral network MUST use inArray() batch SQL — absolutely NO N+1 loops:
  Wrong: for (const userId of userIds) { await db.select(...).where(eq(..., userId)); }
  Correct: await db.select(...).where(inArray(usersTable.id, userIds))

RULE 8 — The 40% reserve floor MUST be enforced in the atomic WHERE clause:
  WHERE id=$userId AND (main_balance - $reserveFloor::numeric) >= $amount::numeric
  Never check this in JavaScript before the UPDATE — it is not atomic.

RULE 9 — Passwords use scrypt via Node.js crypto ONLY:
  const scryptAsync = promisify(crypto.scrypt);
  Format: "scrypt:<16-byte-hex-salt>:<64-byte-hex-hash>"
  No bcrypt. No argon2. No external hashing packages.

RULE 10 — Tokens use crypto.randomBytes(32).toString("hex") ONLY:
  Never Math.random(). Never Date.now(). Never uuid without crypto.randomUUID().

RULE 11 — Receipt base64 stored in full in receipt_url column in DB:
  When echoing back to the DEPOSITING USER: return "receipt_uploaded" string (NOT the base64)
  When returning to ADMIN (GET /api/admin/deposits/pending): return full base64 for img tag display

RULE 12 — Error pattern inside transactions:
  throw Object.assign(new Error("CODE"), { httpStatus: 400, clientMessage: "User-facing message" })
  Catch outside the transaction:
    } catch (err: any) {
      if (err.httpStatus) return res.status(err.httpStatus).json({ error: err.clientMessage });
      throw err;  // re-throw unexpected errors
    }

RULE 13 — Drizzle ORM 0.45 .for("update") syntax on pg SELECT queries:
  await tx.select().from(loginStreakTable).where(eq(...)).for("update")
  OR the raw SQL form: await tx.execute(sql`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`)
  Both are valid. Use whichever fits the query structure.

RULE 14 — esbuild does NOT type-check:
  The api-server builds with esbuild — TypeScript type errors will NOT stop the build.
  Always run: pnpm --filter @workspace/api-server run typecheck
  after changes to verify type correctness separately.

RULE 15 — Never use Supabase Auth, Supabase Realtime, or Supabase client SDK in the backend:
  The backend connects to Supabase as a plain PostgreSQL database via pg Pool + Drizzle.
  DATABASE_URL is the only Supabase-related config. No @supabase/supabase-js in the backend.

RULE 16 — Supabase connection MUST use port 5432 (direct) NOT 6543 (pooler):
  SELECT ... FOR UPDATE and other advisory locks fail in Supavisor transaction mode.
  The connection string in DATABASE_URL must end with :5432/postgres, not :6543/postgres.

RULE 17 — Frontend VITE_ env var prefix is required:
  import.meta.env.VITE_API_URL — correct
  import.meta.env.API_URL — undefined at runtime (Vite strips non-VITE_ vars from bundle)

RULE 18 — The pnpm monorepo build for Vercel:
  Build command: pnpm --filter @workspace/birrstream run build
  Output directory: artifacts/birrstream/dist/public
  The frontend package.json build script is: "build": "vite build --config vite.config.ts"
  Ensure the root vercel.json points to the correct output directory.

RULE 19 — The SPA rewrite in artifacts/birrstream/vercel.json is mandatory:
  Without { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  any direct navigation to /dashboard, /login, etc. returns 404 from Vercel.

RULE 20 — admin_adjustment transaction type:
  When admin manually adjusts a balance, the transaction type is "admin_adjustment".
  This is NOT in the original TYPE_MAP for the /api/transactions filter endpoint.
  Add it: admin_adjustments: ["admin_adjustment"] in the TYPE_MAP in transactions.ts.
  Also update the check constraint in Supabase to include 'admin_adjustment'.

<!-- END PROMPT -->

---

*End of document. Total coverage: full site analysis, complete database schema,
all 35 API routes, all 18 frontend pages, all business logic, Supabase migration
guide, and the complete AI prompt with 20 implementation rules and 49-step
deployment checklist.*
