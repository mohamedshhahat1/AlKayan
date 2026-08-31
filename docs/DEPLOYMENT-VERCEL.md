# Deploying AL-KAYAN to Vercel

Written against this repository as it actually is: Next.js `13.5.1`, App
Router, npm, `package-lock.json` committed, no server-side secrets.

---

## 1. Prerequisites

- A GitHub account with push access to `mohamedshhahat1/AlKayan`.
- A Vercel account (the Hobby plan is sufficient).
- A Supabase project, or the decision to deploy without one — the site builds
  and runs either way. See [Supabase setup](../README.md#supabase-setup).
- Node.js 18.17+ locally if you want to reproduce the build before pushing.

You do **not** need the Vercel CLI. Every step below is doable from the
dashboard.

---

## 2. Repository setup

Nothing to change. The repository is already deployable:

| File | Role on Vercel |
| --- | --- |
| `package.json` | `build` = `next build`, `start` = `next start` |
| `package-lock.json` | committed, so installs are reproducible |
| `next.config.js` | image remote patterns and security headers |
| `vercel.json` | pins framework and build command |
| `netlify.toml` | **ignored by Vercel.** Harmless; see §14 |

Push the branch you intend to deploy:

```bash
git push origin new-main
```

---

## 3. Vercel project creation

1. <https://vercel.com/new>
2. **Import Git Repository** → authorise GitHub → pick `AlKayan`.
3. **Root Directory**: leave as `./`. The Next.js app is at the repository root.
4. Do not deploy yet — add the environment variables first (§6). Without
   `NEXT_PUBLIC_SITE_URL` the build falls back to `https://www.alkayan.studio`,
   which is correct for production and wrong for anything else.

---

## 4. Framework detection

Vercel detects **Next.js** from `next` in `dependencies`. `vercel.json` states
it explicitly so it cannot be mis-detected:

```json
{ "framework": "nextjs", "buildCommand": "npm run build" }
```

App Router routes are handled automatically. `app/api/health/route.ts` becomes
a serverless function; the page itself is prerendered.

---

## 5. Build settings

Leave everything on the default. For reference:

| Setting | Value | Where it comes from |
| --- | --- | --- |
| Build Command | `npm run build` | `vercel.json` |
| Output Directory | `.next` | Next.js default |
| Install Command | `npm install` | detected from `package-lock.json` |
| Development Command | `npm run dev` | `vercel.json` |
| Node.js Version | Project Settings → General | see below |

**Node version.** This project pins Next `13.5.1`, which predates current Node
releases. Vercel defaults new projects to its newest supported Node, and the
repository deliberately does not pin one (an `.nvmrc` pinning a version Vercel
has since retired fails the build outright). If the build errors in a way that
looks like a Node incompatibility rather than your code, set **Project
Settings → General → Node.js Version** to the oldest offered LTS and redeploy.

---

## 6. Environment variables

**Project Settings → Environment Variables.** Add each to *Production*,
*Preview* and *Development* unless noted.

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | Supabase → Settings → API → anon public |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Production: your real domain. Preview: leave unset or use the branch URL. |
| `NEXT_PUBLIC_COMPANY_PHONE` | **Yes** | e.g. `+201001234567` |
| `NEXT_PUBLIC_COMPANY_EMAIL` | **Yes** | e.g. `info@al-kayan.com` |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | No | `/brand/hero.mp4` once self-hosted |
| `NEXT_PUBLIC_HERO_POSTER_URL` | No | overrides the default still |
| `NEXT_PUBLIC_FACEBOOK_URL` | No | blank hides the icon |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | blank hides the icon |

Three things worth being clear about:

- **Every one of these is public.** `NEXT_PUBLIC_*` values are compiled into the
  client bundle. That is fine for all of them — nothing here is a secret — but
  never add one that is.
- **Never add `SUPABASE_SERVICE_ROLE_KEY`.** Nothing in this project uses it,
  and it bypasses row-level security completely.
- **They are build-time, not runtime.** Editing a variable does nothing until
  you redeploy (§12). This surprises people who expect a restart to pick it up.

---

## 7. Supabase configuration

The app talks to Supabase only from the browser, with the anon key, through
`lib/supabase.ts`. There is no server-side Supabase client, no auth flow and no
session, so there is nothing to configure in Supabase for Vercel specifically —
no redirect URLs, no callback routes.

What you do need:

1. Apply the migrations in `supabase/migrations/` (filename order).
2. Confirm RLS is enabled on `projects`, `testimonials`, `partners`, `bookings`.
3. Under **Supabase → Settings → API → CORS**, the default `*` is fine; if you
   have restricted it, add your Vercel production and preview domains, or the
   preview deployments will fail to fetch while production works.

Full walkthrough: [README → Supabase Setup](../README.md#supabase-setup).

---

## 8. Production environment

- Production tracks your **Production Branch** (Project Settings → Git).
  Set it to `new-main` if that is the branch you are shipping, otherwise `main`.
- Set `NEXT_PUBLIC_SITE_URL` in the Production scope to your real domain,
  without a trailing slash. `app/sitemap.ts`, `app/robots.ts`, `metadataBase`
  and the canonical tag all derive from it.
- Consider a separate Supabase project for production so preview traffic and
  test bookings never touch live leads. The variables are already per-scope, so
  this costs nothing architecturally.

---

## 9. Preview environment

Every push to a non-production branch, and every pull request, gets its own
URL.

- Leave `NEXT_PUBLIC_SITE_URL` **unset** in the Preview scope. It falls back to
  the production origin, which is the safe wrong answer: a preview whose
  canonical points at production will never compete with production in the
  index. Do **not** set it to `https://$VERCEL_URL` — `lib/site-config.ts`
  rejects every `*.vercel.app` value on purpose and would ignore it anyway.
- Previews are indexable by default only if your `robots.ts` allows it — it
  does. Vercel adds `X-Robots-Tag: noindex` to preview deployments
  automatically, so this is handled, but verify it if you ever serve previews
  from a custom domain.
- Point previews at a staging Supabase project if you have one.

---

## 10. Custom domain

1. **Project Settings → Domains → Add**: add both `alkayan.studio` and
   `www.alkayan.studio`, and mark **`www.alkayan.studio` as the primary** so
   the apex 308s to it. That is the direction the code canonicalises in — see
   `resolveSiteUrl` in `lib/site-config.ts` — and the two must agree.
2. Add the DNS records Vercel shows you at your registrar:
   - apex: `A` → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
   (Use whatever the dashboard displays; these change.)
3. Pick one canonical host and redirect the other. Vercel does this for you
   when you mark a domain as the primary.
4. Wait for the certificate to issue (usually minutes).
5. **Set `NEXT_PUBLIC_SITE_URL` to `https://www.alkayan.studio` and redeploy.**
   Until you do, whatever the variable currently holds is what every canonical
   tag, Open Graph URL and sitemap entry advertises.

### The `alkayan.vercel.app` alias

Vercel gives every project a `*.vercel.app` production alias, and it cannot be
removed. It is harmless as long as nothing ever names it as the canonical —
which is now enforced in code — because the pages served from it carry
canonical tags pointing at `www.alkayan.studio`, and Google consolidates on
those.

Note that `alkayan.vercel.app` currently belongs to a **different** Vercel
project serving an unrelated placeholder page. Nothing in this repository
should reference it.

---

## 11. Deployment

Push, and Vercel builds:

```bash
git push origin new-main
```

Expect roughly: install → `next build` → upload. Watch the build log for the
route table at the end — you should see `/` prerendered as static, plus
`/api/health` as a function, and `/sitemap.xml`, `/robots.txt`, `/icon`,
`/opengraph-image`.

---

## 12. Redeployment

- **After a code change:** push. Automatic.
- **After an environment variable change:** nothing rebuilds on its own.
  Go to **Deployments → ⋯ → Redeploy** and *uncheck* "Use existing Build Cache".
  With the cache on, an inlined `NEXT_PUBLIC_*` value can survive the rebuild.
- **Rollback:** Deployments → pick a known-good one → **Promote to Production**.

---

## 13. Troubleshooting

**The site shows empty project/testimonial sections.** Expected when Supabase
is unset or unreachable. Check the two Supabase variables exist in the right
scope, then confirm you redeployed after adding them.

**The booking form says تعذر إرسال الطلب.** Either Supabase is unset, or the
insert was rejected by row-level security. Open the browser console —
`contact-section.tsx` logs the Postgres message. If it mentions a policy
violation, you are missing
`supabase/migrations/20260815120000_fix_booking_phone_country.sql`, which
corrects a phone pattern that rejected every Egyptian number.

**The hero video never appears.** By design in several cases: reduced-motion,
Save-Data, or a refused autoplay all keep the still. Otherwise check the
Network tab for the Pexels URL — see [BRAND-ASSETS.md](./BRAND-ASSETS.md).

**The logo is a gold monogram tile, not the real logo.** `public/brand/logo.svg`
is missing. That is the fallback working as intended.

**Canonical URLs point at the wrong domain.** `NEXT_PUBLIC_SITE_URL` is unset
or stale in that scope. Set it and redeploy without the build cache.

---

## 14. Common build and runtime errors

**`Module not found: Can't resolve '@/components/...'`**
The `@/*` alias maps to the repository root via `tsconfig.json`. It works on
Vercel. If it fails locally on Linux but not on your Mac, you have a filename
case mismatch — macOS is case-insensitive, Vercel's builders are not.

**`Type error: ...` during build**
`next build` typechecks. Reproduce with `npm run typecheck`.

**ESLint failures fail the build**
Deliberate. `eslint.ignoreDuringBuilds` was removed from `next.config.js` so
lint problems cannot pass as a green build. Fix the rule, or disable that
specific rule in `.eslintrc.json` — do not re-add the global ignore.

**Build is unusually slow, or logs mention WASM SWC**
`@next/swc-wasm-nodejs@13.5.1` is in `dependencies`. It is a leftover from the
StackBlitz/Bolt scaffold this project started life in. Next.js prefers the
native SWC binary and only falls back to WASM if that fails to load, so this is
usually dead weight rather than active harm — but it is ~30MB of install for
nothing. Removing it requires regenerating `package-lock.json`; see the
README's dependency notes.

**`ImageResponse` errors from `/icon` or `/opengraph-image`**
Both import from `next/server`, which is correct for Next 13. If the project is
ever upgraded to Next 14+, those imports must move to `next/og`.

**A `netlify.toml` in a Vercel project**
Ignored entirely. It is left in place because the site may still be deployed to
Netlify. `@netlify/plugin-nextjs` in `devDependencies` is installed during the
Vercel build and never used — wasteful, not harmful.
