---
name: Stale lib declarations fix
description: When @workspace/db exports appear missing in leaf package typechecks, run typecheck:libs first.
---

Run `pnpm run typecheck:libs` before running leaf package typechecks (e.g., `pnpm --filter @workspace/api-server run typecheck`) when the lib schema has changed.

**Why:** Lib declarations are cached in `.tsbuildinfo` files. After editing `lib/db/src/schema/*.ts`, the declarations for table exports are stale until rebuilt.

**How to apply:** `pnpm run typecheck:libs` runs `tsc --build` on all composite lib packages, regenerating their declaration files.
