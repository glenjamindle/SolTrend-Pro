# Deployment notes

## What this commit fixes

The app was broken because of several gaps left mid-build by a previous session:

1. `prisma/schema.prisma` was set to `provider = "sqlite"` instead of `"postgresql"` — this alone would make any Postgres `DATABASE_URL` fail immediately on Railway.
2. `package.json` never ran `prisma generate`, so the Prisma client was never generated on build.
3. `src/app/login/page.tsx` didn't exist even though `auth.ts` points NextAuth's sign-in page at `/login` — that route 404'd.
4. There was no `middleware.ts`, so nothing actually gated the app behind login.
5. The frontend called `/api/seed`, `/api/inspections`, and `/api/refusals`, none of which existed as route files — QC inspections and refusal logging silently failed.
6. `src/app/page.tsx.backup` and `src/app/page.tsx.new` were stale, half-written leftovers from an interrupted edit — removed.
7. The logged-in user was never wired into the app UI (always showed a hardcoded demo name) and there was no sign-out control — both fixed.

## What YOU need to check on Railway before this deploys cleanly

Go to your Railway project → the SolTrend Pro service → **Variables**, and confirm:

- **`DATABASE_URL`** — must be a Postgres connection string. If you haven't already, add a Postgres database to this Railway project (New → Database → PostgreSQL) and reference its `DATABASE_URL` in this service's variables (Railway can do this automatically via variable reference: `${{Postgres.DATABASE_URL}}`).
- **`NEXTAUTH_SECRET`** — any long random string (e.g. generate one with `openssl rand -base64 32`). Required for NextAuth to sign session tokens; without it, login/middleware will fail.
- **`NEXTAUTH_URL`** — set to your Railway app's public URL, e.g. `https://soltrend-pro-production.up.railway.app`.

## First deploy after this fix

On first boot, the database will be empty. Either:

- Visit the app, log in with one of the demo accounts below (the `/api/settings` route self-seeds a default company/project on first load), **or**
- Manually call `POST /api/seed` once (e.g. `curl -X POST https://your-app.up.railway.app/api/seed`) to create the default company, demo users, crews, subcontractors, racking profiles, and a demo project in one shot.

## Demo credentials (all password `demo123`)

| Role | Email |
|---|---|
| Admin | admin@apexsolar.com |
| Project Manager | pm@apexsolar.com |
| Supervisor | supervisor@apexsolar.com |
| Crew | crew@apexsolar.com |
| Inspector | inspector@apexsolar.com |

## Known simplification (flagging, not fixing right now)

There are no Prisma migration files (`prisma/migrations/`) — `npm start` runs `prisma db push` to sync the schema straight to the database instead of using versioned migrations. That's fine for now while the schema is still moving, but once it stabilizes it's worth switching to `prisma migrate deploy` with real migration files so schema changes are tracked and reversible.
