---
name: BirrStream auth pattern
description: How sessions/tokens work in the API server after the security audit fixes
---

Token format: 64-char hex string from `crypto.randomBytes(32)` stored in an in-memory `Map<string, { userId, expiresAt }>`. TTL is 30 days.

Old format was `birr_${userId}_${Date.now()}_${Math.random().toString(36)}` — predictable, never expired, logout didn't invalidate. All fixed.

**Token attached to req:** `requireAuth` now sets `(req as any).token = token` so logout handlers can call `revokeToken(token)`.

**Why:** Math.random() is not CSPRNG; old tokens were forgeable given enough samples. Logout was a no-op because the server never removed the token.

**How to apply:** Any new route that changes auth state must call `revokeToken` / `generateToken` from `middlewares/auth.ts`. Never roll your own token logic.

**Caveat:** Sessions are still in-memory — a server restart clears all sessions. For production, replace the Map with a `sessions` DB table.
