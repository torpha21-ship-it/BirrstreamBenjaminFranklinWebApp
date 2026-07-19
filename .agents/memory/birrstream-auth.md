---
name: BirrStream auth pattern
description: Token-based auth with in-memory Map session store — no DB persistence.
---

Auth uses a module-level `Map<string, number>` in `artifacts/api-server/src/middlewares/auth.ts`. Token format: `birr_{userId}_{timestamp}_{random}`.

**Why:** Simple MVP approach; avoids schema complexity for session management.

**How to apply:** If session persistence across restarts is needed, migrate SESSIONS to a `sessions` DB table. The `generateToken` and `getUserIdFromToken` functions are the only two places to change.
