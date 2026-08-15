# Deploying AL-KAYAN to Railway

Written against this repository as it actually is: Next.js `13.5.1`, App
Router, npm, `package-lock.json` committed, `railway.json` provided.

Railway runs the app as a **long-lived Node process** (`next start`), not as
serverless functions. That is the main practical difference from Vercel and it
changes what you have to think about: a port, a health check, and a container
that stays up.

---

## 1. Prerequisites

- A GitHub account with access to `mohamedshhahat1/AlKayan`.
- A Railway account. Note the trial plan sleeps services; use Hobby or above
  for anything public.
- A Supabase project, or the decision to run without one.
- Optional: the Railway CLI (`npm i -g @railway/cli`) for log tailing.

---

## 2. Create a Railway project

1. <https://railway.app/new>
2. **Deploy from GitHub repo**.
3. Authorise Railway for the `AlKayan` repository.

This creates a project containing one service. You do not need a Railway
Postgres plugin — the database is Supabase, which lives outside Railway.

---

## 3. Connect the GitHub repository

In the service's **Settings → Source**:

- **Repository**: `mohamedshhahat1/AlKayan`
- **Branch**: `new-main` (or `main` — whichever you are shipping)
- **Root Directory**: `/`
- **Watch Paths**: leave empty so every push rebuilds.

Every push to the selected branch triggers a deployment.

---

## 4. Configure the build

`railway.json` in the repository root already declares this, and it wins over
the dashboard:

```json
{
  "build": { "builder": "NIXPACKS", "buildCommand": "npm run build" }
}
```

Nixpacks detects Node from `package.json`, runs `npm ci` (the lockfile is
committed), then `npm run build` → `next build`.

**Node version.** Nixpacks picks a default Node. This project pins Next
`13.5.1`, which is older than current releases. If the build fails in a way
that looks like a Node incompatibility rather than your code, pin it with a
service variable:

```
NIXPACKS_NODE_VERSION=20
```

The repository deliberately ships no `.nvmrc`, so this stays a per-platform
choice rather than a hardcoded one that could break elsewhere.

---

## 5. Configure the start command

From `railway.json`:

```json
{ "deploy": { "startCommand": "npm run start" } }
```

which is `next start`.

**About `PORT`.** Railway injects a `PORT` environment variable and expects the
process to bind to it. `next start` reads `process.env.PORT` natively, so no
flag is needed and none is passed. If you ever change the start command, keep
that true — hardcoding `-p 3000` is the single most common way to make a
Railway deployment health-check itself to death.

Do **not** use `npm run dev` in production.

---

## 6. Environment variables

**Service → Variables.** Add:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | anon public key |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | your Railway or custom domain, no trailing slash |
| `NEXT_PUBLIC_COMPANY_PHONE` | **Yes** | e.g. `+201001234567` |
| `NEXT_PUBLIC_COMPANY_EMAIL` | **Yes** | e.g. `info@al-kayan.com` |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | No | `/brand/hero.mp4` once self-hosted |
| `NEXT_PUBLIC_HERO_POSTER_URL` | No | overrides the default still |
| `NEXT_PUBLIC_FACEBOOK_URL` | No | blank hides the icon |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | blank hides the icon |
| `PORT` | No | **do not set.** Railway provides it. |

The critical detail on Railway: **`NEXT_PUBLIC_*` variables are baked in at
build time.** Railway makes service variables available to the build, so this
works — but changing one and merely restarting the service will not pick it up.
You must trigger a rebuild (§12).

As on any platform: never add `SUPABASE_SERVICE_ROLE_KEY`. Nothing here uses
one, and it would bypass row-level security.

---

## 7. Supabase configuration

Identical to every other target, because all Supabase access is from the
browser with the anon key:

1. Apply everything in `supabase/migrations/` in filename order.
2. Verify RLS is on for `projects`, `testimonials`, `partners`, `bookings`.
3. If you have restricted CORS in Supabase, add your Railway domain
   (`*.up.railway.app` and any custom domain).

There is no server-side Supabase client and no auth, so there are no redirect
URLs to register.

Full walkthrough: [README → Supabase Setup](../README.md#supabase-setup).

---

## 8. Production deployment

1. Set the variables in §6.
2. Push to the tracked branch, or hit **Deploy** in the dashboard.
3. Watch **Deployments → Build Logs** for `next build` completing with the
   route table.
4. Watch **Deploy Logs** for Next's `ready - started server on 0.0.0.0:$PORT`.
5. Railway polls `/api/health` before routing traffic (§11). Only once that
   returns 200 does the new deployment go live; otherwise it is rolled back and
   the previous one keeps serving.

---

## 9. Domain configuration

**Settings → Networking.**

- **Generate Domain** gives you `<service>.up.railway.app` immediately. Railway
  terminates TLS for it.
- **Custom Domain**: add `al-kayan.com`, then create the `CNAME` Railway shows
  you at your registrar. Apex domains need a registrar that supports ALIAS /
  ANAME / flattened CNAME; if yours does not, point `www` at Railway and
  redirect the apex at the DNS provider.
- Certificates are issued automatically once DNS resolves.
- **Then update `NEXT_PUBLIC_SITE_URL` to the final domain and rebuild.** Until
  you do, canonical tags, `sitemap.xml` and `robots.txt` all advertise the old
  value.

---

## 10. Logs

- **Dashboard**: service → **Deployments** → pick one → *Build Logs* /
  *Deploy Logs*.
- **CLI**:
  ```bash
  railway login
  railway link
  railway logs
  ```

What is actually logged by this app: `lib/supabase.ts` warns once, in
non-production only, when the Supabase variables are missing. The data sections
and `app/error.tsx` log failures with a `[projects]`, `[testimonials]`,
`[partners]`, `[bookings]` or `[app]` prefix. Those land in the browser console
for client components, not in Railway's logs — Railway sees server-side output
only. Do not expect booking failures to show up here.

---

## 11. Health checks

`railway.json`:

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

`app/api/health/route.ts` returns `{ status, uptime, timestamp }` with
`Cache-Control: no-store` and `dynamic = "force-dynamic"`.

It deliberately does **not** check Supabase. A health check that fails because
a third party is briefly unreachable takes a working deployment down with it,
and this site degrades to its empty states when Supabase is missing rather than
breaking — so Supabase being down is not a reason to refuse traffic.

Verify:

```bash
curl -i https://<your-domain>/api/health
```

---

## 12. Troubleshooting

**Health check fails, deployment rolls back.** Almost always the port. Confirm
the start command is `npm run start` and that nothing hardcodes `-p 3000`.
Confirm `PORT` is *not* set manually in Variables.

**Service builds, then immediately restarts in a loop.** Read Deploy Logs, not
Build Logs. A crash at startup — not a build failure — usually means an
exception during module evaluation.

**Environment variable change had no effect.** `NEXT_PUBLIC_*` is compiled in.
Redeploy rather than restart: **Deployments → ⋯ → Redeploy**.

**Site loads but every data section is empty.** Supabase variables missing at
*build* time. Set them, then rebuild.

**Booking form always fails.** Check the browser console for the Postgres
error. A row-level-security violation means
`supabase/migrations/20260815120000_fix_booking_phone_country.sql` has not been
applied — without it the policy rejects every Egyptian number.

**The logo shows as a gold monogram tile.** `public/brand/logo.svg` is missing;
the fallback is working. See [BRAND-ASSETS.md](./BRAND-ASSETS.md).

---

## 13. Common deployment failures

**`npm ci` fails: lockfile out of sync**
`package.json` and `package-lock.json` disagree. Run `npm install` locally,
commit the updated lockfile, push. Do not "fix" it by switching the build to
`npm install` — that hides the drift.

**Out of memory during `next build`**
Next 13 builds are memory-hungry and Railway's smaller instances are tight.
Raise the service memory limit, or add:
```
NODE_OPTIONS=--max-old-space-size=4096
```

**Build succeeds locally, fails on Railway with a missing module**
Filename case. Railway builds on Linux; macOS is case-insensitive.

**`next: not found` at start**
The build ran with `NODE_ENV=production` and pruned devDependencies before
building. `next` is a regular dependency here so this should not happen — if it
does, check for a `NODE_ENV` variable set manually in the dashboard and remove
it. Let Railway manage it.

**Health check times out on a cold first deploy**
`healthcheckTimeout` is 120s. If the instance is small and the build is slow to
boot, raise it in `railway.json`.

**Static assets 404**
Everything under `public/` is served from the root: `public/brand/logo.svg` is
`/brand/logo.svg`. If a brand asset 404s, confirm the file is actually
committed — at the time of writing, it is not.
