---
name: BirrStream DB seed
description: packages and daily_tasks tables require manual seeding after schema push.
---

Run `pnpm --filter @workspace/scripts run seed` after every `pnpm --filter @workspace/db run push`.

**Why:** Packages (9 VIP tiers) and daily tasks (6 tasks) are not auto-created by migrations; the seed script populates them.

**How to apply:** Script is at `scripts/src/seed.ts`. It deletes and re-inserts all packages and daily tasks — safe to re-run.
