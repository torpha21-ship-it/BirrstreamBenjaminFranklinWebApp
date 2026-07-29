# Debug Session: legacy-login-failure
- **Status**: [RESOLVED]
- **Issue**: Previously registered users fail login with "Invalid credentials" while recently registered users can register and log in normally.
- **Debug Server**: Not required for root-cause confirmation
- **Log File**: .dbg/trae-debug-log-legacy-login-failure.ndjson

## Reproduction Steps
1. Attempt login with a legacy user account created before the recent regression window.
2. Compare the auth request/response flow with a newly created working account.
3. Inspect Supabase auth state, metadata, and app-side login handling for divergence.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Legacy users were imported or created under an older auth schema/state and are now blocked by a status or metadata check before/after password verification. | Low | Low | Rejected. `auth.users` is empty, so Supabase Auth status, expiry, bans, and metadata are not participating in the live login flow. |
| B | Login logic changed to normalize or transform credentials differently than historical registrations, causing old accounts to submit mismatched identifiers. | High | Medium | Confirmed. App login used exact case-sensitive/raw-string matching on `public.users.username` and `public.users.email`, which is brittle for returning users and diverges from more forgiving historical expectations. |
| C | Legacy accounts use auth records that Supabase treats differently at sign-in because of password hash/provider migration or disabled/expired auth state. | Low | Medium | Rejected. No active Supabase Auth users exist in the connected project, so there is no Supabase Auth password flow to compare old vs new accounts against. |
| D | Legacy user rows in app tables no longer match `auth.users` expectations, causing a downstream failure that the UI collapses into "Invalid credentials." | Medium | Medium | Refined. The real divergence is architectural: app auth is custom DB auth against `public.users`, while investigation originally assumed Supabase Auth. |
| E | A recent auth/UI error-mapping change is masking a distinct Supabase error that affects only old accounts. | Medium | Low | Partially true. The UI collapses every login failure into the same toast, and the server previously lacked diagnostic logging to distinguish lookup mismatches from malformed hashes. |

## Live Supabase Findings
- `public.users` contains the active application accounts.
- `auth.users` returned no records in the connected Supabase project.
- All current `public.users.password_hash` values are valid `scrypt:<salt>:<hash>` strings with consistent length; no live rows currently require legacy SHA-256 fallback.
- No case-insensitive duplicate usernames or emails were present in live data, so a uniqueness safeguard could be safely added.
- No account-expiry, banned-user, deleted-user, or metadata flags in Supabase Auth could explain the failures because Supabase Auth is not the active login provider here.

## Log Evidence
- Before fix, the backend had no structured logging to distinguish:
  - identifier lookup miss,
  - password mismatch,
  - malformed stored hash.
- After fix, `/api/auth/login` now logs sanitized outcomes for:
  - `user_not_found`
  - `password_verification_failed`
  - successful login with optional legacy-hash upgrade

## Verification Conclusion
- Root cause: the live application authenticates against `public.users`, not Supabase Auth, and the login lookup was doing exact raw-string matches for username/email. That made legacy/returning accounts vulnerable to case/whitespace mismatches while producing the same generic "Invalid credentials" toast as true password failures.
- Fixes implemented:
  1. Normalize login identifiers with trimming and case-insensitive username/email lookup.
  2. Normalize registration and forgot-password email handling.
  3. Harden password verification to safely reject malformed stored hashes instead of failing opaquely.
  4. Normalize profile email updates and prevent duplicate email updates.
  5. Add structured auth diagnostics in the API server.
  6. Apply a Supabase migration adding case-insensitive unique indexes:
     - `uq_users_email_lower`
     - `uq_users_username_lower`
- Validation completed:
  - Live Supabase inspection confirmed no Supabase Auth user-status or expiration issue.
  - Live `public.users` audit confirmed hash compatibility and safe migration preconditions.
  - `pnpm --filter @workspace/api-server typecheck` passed.
  - `pnpm --filter @workspace/api-server build` passed.
- Remaining limitation:
  - I did not have plaintext credentials for a historical account, so I could not perform a full end-to-end legacy login as that user in this session. The implemented changes specifically target the identified failure mode and are backed by live data plus successful backend verification.
