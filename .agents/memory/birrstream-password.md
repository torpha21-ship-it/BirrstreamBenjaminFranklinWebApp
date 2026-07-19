---
name: BirrStream password hashing
description: How passwords are hashed and verified; legacy upgrade path
---

**Current algorithm:** scrypt via Node.js `crypto.scrypt` (built-in, no npm deps needed).

Hash format: `scrypt:<16-byte-hex-salt>:<64-byte-hex-hash>`

**Legacy path:** Old hashes used `SHA-256(password + "birrstream_salt")` — a flat hex string with no "scrypt:" prefix. `verifyPassword()` detects this by the absence of the prefix and verifies via SHA-256. On successful login with a legacy hash, the route immediately re-hashes with scrypt and updates the DB row. This means the migration is automatic and transparent.

**Why:** SHA-256 with a static salt is not a password hash. GPUs can brute-force it in hours after a DB dump. scrypt is memory-hard by design.

**How to apply:** Always use `hashPassword()` and `verifyPassword()` from `routes/auth.ts`. Never call `crypto.createHash("sha256")` for passwords. The `timingSafeEqual` call in `verifyPassword` prevents timing attacks — do not replace it with `===`.
