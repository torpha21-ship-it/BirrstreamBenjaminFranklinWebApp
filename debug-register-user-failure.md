# Debug Session: register-user-failure

- Status: OPEN
- Started: 2026-07-20
- Scope: Investigate why user registration fails after the Supabase migration.

## Initial Symptom

- Frontend registration does not complete successfully.
- Prior working theory says Render cannot reach Supabase because `pg` resolves IPv6 first.

## Initial Hypotheses

- H1: The backend never reaches the database because the shared DB package fails to initialize or compile in production.
- H2: The backend reaches the DB layer, but the Render environment still uses an invalid or incomplete `DATABASE_URL`.
- H3: The IPv4 fix is ineffective because the installed `pg` version or runtime path does not honor `family: 4`.
- H4: The frontend is calling the wrong API origin or path, so the request never exercises the intended Render registration route.
- H5: Registration fails after the first query because the actual Supabase schema differs from what the backend expects.

## Evidence Log

- `GET https://birrstream-api.onrender.com/api/healthz` returned `{"status":"ok"}`.
- `POST https://birrstream-api.onrender.com/api/auth/register` returned:
  `{"error":"connect ENETUNREACH 2a05:d018:cb7:ae00:d441:68d5:27be:a79b:5432 - Local (:::0)"}`
- `Resolve-DnsName db.joqunhwyetppapgmrcyw.supabase.co` returned only an `AAAA` record.
- `Resolve-DnsName db.joqunhwyetppapgmrcyw.supabase.co -Type A` returned no IPv4 answer.
- Supabase docs confirm:
  - direct host `db.[project-id].supabase.co:5432` is IPv6 by default
  - pooler session mode is the supported option for persistent backends on IPv4-only networks
  - IPv4 add-on is the alternative if direct-host IPv4 is required

## Hypothesis Status

- H1 Rejected: the backend is live and serving `/api/healthz`, so the service itself is running.
- H2 Unconfirmed: credentials may still need validation after connectivity is fixed, but current failure happens before authentication completes.
- H3 Rejected: `family: 4` cannot fix this host because there is no IPv4 record to select.
- H4 Rejected: frontend/client path wiring targets `/api/auth/register`, and the live POST reaches the backend.
- H5 Unconfirmed: schema mismatch is not the first blocker because the connection fails before any query can run successfully.

## Current Conclusion

- Root cause: Render is IPv4-only for this workload, while the configured Supabase direct database hostname is IPv6-only.
- The `family: 4` code change is insufficient because the current hostname does not publish an IPv4 `A` record.
- The fix is to change the deployed `DATABASE_URL` away from the direct host:
  - preferred: Supabase pooler session mode connection string on port `5432`
  - alternative: enable Supabase IPv4 add-on and keep the direct host

## Next Steps

- Update Render `DATABASE_URL` to the Supabase session pooler URI from the dashboard.
- Redeploy Render and retry `POST /api/auth/register`.
- If connectivity succeeds but a new DB/auth error appears, continue with that next concrete error.
