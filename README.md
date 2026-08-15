# AL-KAYAN

**الكيان للمقاولات والتشطيبات** — the marketing site for an Egyptian contracting and
finishing company. Arabic-first, right-to-left, single page.

---

## Overview

One long landing page in Arabic, built to do two things: establish that the
company is credible, and get the visitor to phone or submit a booking request.

Content that changes often — the project portfolio, client testimonials,
partner logos — is read from Supabase at runtime from the browser. Everything
else is static. Booking requests are inserted straight into Supabase from the
form; there is no backend of our own, no CMS and no admin panel.

The design language is fixed and deliberate: navy `#0B1F3A` and gold `#D4AF37`,
glassmorphism panels, scroll-triggered reveals, smooth scrolling. If you are
changing this project, work within it.

> **Two things a new developer should know before starting.** The official brand
> SVGs are referenced by the code but **not yet committed** — see
> [Outstanding work](#outstanding-work). And no build has been verified against
> these most recent changes; see [Production Readiness](#production-readiness).

---

## Features

- **Single-page Arabic RTL site**, eight anchored sections plus an FAQ.
- **Hero with a looping video background**, progressively enhanced from a still.
  Never blocks first paint, and degrades to the still on reduced-motion,
  Save-Data, autoplay refusal or any load error.
- **Live project portfolio** from Supabase, filterable by category, with a
  lightbox gallery.
- **Before/after slider** for finishing work.
- **Client testimonials** carousel (Swiper) and an animated partner marquee.
- **Booking form** — react-hook-form + Zod, Egyptian phone validation, a
  honeypot field, inserted directly into Supabase.
- **Click-to-call everywhere**: header (desktop and mobile), footer, contact
  cards, floating WhatsApp button, chat widget — all from one config value.
- **Dark and light themes** via `next-themes`, no flash on load.
- **Smooth scrolling** (Lenis) with correct anchor offsets for the sticky header.
- **Full SEO surface**: metadata, Open Graph, Twitter cards, canonical URLs,
  `sitemap.xml`, `robots.txt`, and LocalBusiness JSON-LD.
- **Motion respects `prefers-reduced-motion`** throughout, enforced in CSS, not
  per-component.
- **Graceful everywhere**: the site builds and runs with no Supabase
  credentials at all, rendering empty states rather than errors.

---

## Tech Stack

| Layer | Choice | Version |
| --- | --- | --- |
| Framework | Next.js, App Router | `13.5.1` |
| UI | React | `18.2.0` |
| Language | TypeScript, `strict` | `5.2.2` |
| Styling | Tailwind CSS | `3.3.3` |
| Components | shadcn/ui (Radix primitives) | — |
| Animation | framer-motion / GSAP | `^12.43.0` / `^3.13.0` |
| Smooth scroll | Lenis | `^1.3.25` |
| Carousel | Swiper | `^14.0.7` |
| Icons | lucide-react | `^0.446.0` |
| Forms | react-hook-form + Zod | `^7.53.0` / `^3.23.8` |
| Theming | next-themes | `^0.3.0` |
| Backend | Supabase (`@supabase/supabase-js`) | `^2.58.0` |
| Fonts | `next/font` — Cairo + Tajawal, Arabic subset | — |

No test framework is installed. There is no `test` script.

---

## Architecture

### Static shell, client-side data

`app/page.tsx` is a Server Component that composes section components. The page
is prerendered at build time. Each data-driven section is a Client Component
that fetches from Supabase in a `useEffect` on mount.

This is a legitimate choice for this site — the shell ships instantly and the
portfolio is not SEO-critical — but be clear about the trade-off: **project and
testimonial content is not in the initial HTML and is not indexed.** If that
matters commercially, the fix is Server Components with `fetch` and a revalidate
window, not a patch.

### One config file

`lib/site-config.ts` is the single source of truth for the company: name, phone,
email, address, socials, brand asset paths, hero media, nav links. Every
consumer reads from it.

It also owns the derived forms — `telHref`, `whatsappHref`, the display-
formatted phone — so no component ever re-derives them. **Do not hardcode
company details in components.** That was the pattern this file exists to
replace.

### Brand rendering

`components/brand.tsx` exports `BrandLogo`, `BrandWordmark` and `BrandLockup`.
Nothing else in the codebase references an asset path, and every logo on the
site comes from here. Each falls back to the previous monogram/text lockup if
its SVG fails to load. See [docs/BRAND-ASSETS.md](./docs/BRAND-ASSETS.md).

### Server/client boundaries

`app/layout.tsx`, `app/page.tsx`, `app/loading.tsx`, `app/not-found.tsx`,
`app/robots.ts`, `app/sitemap.ts` and `app/api/health/route.ts` are server-side.
Everything under `components/` that animates, fetches or holds state is
`"use client"`.

There is no server-side Supabase client. There is no privileged code path at
all — which is why there is no secret in this repository to leak.

### Directory layout

```
app/                      routes, metadata, error boundaries
components/               shared components
components/sections/      the nine page sections
components/ui/            shadcn/ui primitives (largely unused; see notes)
components/icons/         hand-rolled SVG icons
hooks/                    use-toast
lib/                      config, supabase client, validation, helpers
supabase/migrations/      SQL, applied in filename order
docs/                     deployment and brand documentation
public/brand/             logo.svg + company_name.svg (to be added)
```

---

## Requirements

- **Node.js 18.17 or newer.** Next.js 13.5 requires ≥16.14; 18.17+ is the
  realistic floor. There is deliberately no `.nvmrc` — see
  [Dependency notes](#dependency-and-build-notes).
- **npm 9+** (`package-lock.json` is committed; use npm, not yarn or pnpm).
- **A Supabase project** — optional to run, required for real content.
- Git.

---

## Installation

```bash
# 1. Clone
git clone https://github.com/mohamedshhahat1/AlKayan.git
cd AlKayan

# 2. Use the right branch
git checkout new-main

# 3. Install
npm install

# 4. Create your local environment file
cp .env.example .env.local

# 5. Run
npm run dev
```

Open <http://localhost:3000>.

**It will run immediately, before you configure anything.** With an empty
`.env.local` the site renders in full; the projects, testimonials and partners
sections show their empty states and the booking form disables itself with an
explanatory message. That is intended, so you can see the site before you have
credentials.

### Configuring the variables

Open `.env.local` and work through it:

1. **`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`** — from your
   Supabase dashboard, **Project Settings → API**. Copy the *Project URL* and
   the *anon public* key. Not the `service_role` key — never that.
   Follow [Supabase Setup](#supabase-setup) to create the tables first.
2. **`NEXT_PUBLIC_SITE_URL`** — `http://localhost:3000` locally; your real
   domain in production, with no trailing slash.
3. **`NEXT_PUBLIC_COMPANY_PHONE`** — an Egyptian mobile, e.g. `+201001234567`.
   Drives the header call button, the mobile call button, the footer, the
   contact cards, WhatsApp and the JSON-LD.
4. **`NEXT_PUBLIC_COMPANY_EMAIL`** — e.g. `info@al-kayan.com`.
5. **`NEXT_PUBLIC_FACEBOOK_URL` / `NEXT_PUBLIC_INSTAGRAM_URL`** — optional.
   Leave blank and the icon is not rendered at all.
6. **`NEXT_PUBLIC_HERO_VIDEO_URL` / `NEXT_PUBLIC_HERO_POSTER_URL`** — optional,
   both have working defaults. See [docs/BRAND-ASSETS.md](./docs/BRAND-ASSETS.md).

**Restart `npm run dev` after editing `.env.local`.** These values are compiled
in, not read at runtime.

---

## Environment Variables

Every variable is `NEXT_PUBLIC_`, meaning **every one is inlined into the client
bundle and publicly readable**. That is correct here — nothing in this project
is secret — but it means you must never introduce a real secret under a
`NEXT_PUBLIC_` name.

There are **no server-only variables**, and no `SUPABASE_SERVICE_ROLE_KEY`
anywhere. Do not add one.

| Variable | Required? | Environment | Description | Example / format |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | All | Supabase project REST URL. Unset → empty states, form disabled. | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | All | Public anon key. Safe to expose; constrained by RLS. | JWT string, `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** for prod | All | Absolute origin. Drives `metadataBase`, canonical, OG URLs, sitemap, robots. No trailing slash. | `https://al-kayan.com` |
| `NEXT_PUBLIC_COMPANY_PHONE` | **Yes** for prod | All | Egyptian mobile. Used for display, `tel:`, `wa.me` and JSON-LD. Must match `^(\+?20\|0020\|0)?1[0125][0-9]{8}$`. | `+201001234567` |
| `NEXT_PUBLIC_COMPANY_EMAIL` | **Yes** for prod | All | Contact email, footer + contact card + JSON-LD. | `info@al-kayan.com` |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | No | All | Hero video. Local path or absolute URL. Empty string disables video and keeps the still. | `/brand/hero.mp4` |
| `NEXT_PUBLIC_HERO_POSTER_URL` | No | All | Hero still, shown first and as the permanent fallback. | `/brand/hero-poster.jpg` |
| `NEXT_PUBLIC_FACEBOOK_URL` | No | All | Blank → icon hidden entirely. | `https://facebook.com/alkayan` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | All | Blank → icon hidden entirely. | `https://instagram.com/alkayan` |
| `PORT` | No | Railway | Provided by the platform. **Do not set it yourself.** | — |

---

## Supabase Setup

### 1. Create a project

<https://supabase.com/dashboard> → **New project**. Choose a region near your
visitors (Frankfurt or London for Egypt). Save the database password somewhere
safe — you will not need it for this app, but you will for `supabase link`.

### 2. Get the project URL

**Project Settings → API → Project URL** → `NEXT_PUBLIC_SUPABASE_URL`.

### 3. Get the anon key

**Project Settings → API → Project API keys → `anon` `public`** →
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

The **`service_role`** key is on the same page. It bypasses row-level security
entirely. This project never uses it. Do not copy it into anything.

### 4. Configure the variables

Put both into `.env.local` locally, and into your host's environment settings
for deployments. Restart or rebuild afterwards.

### 5. Run the migrations

Three files in `supabase/migrations/`, applied **in filename order**:

| File | What it does |
| --- | --- |
| `20260801120755_create_projects_testimonials_bookings.sql` | Creates `projects`, `testimonials`, `partners`, `bookings`. Enables RLS on all four. Adds anon read policies for the three public tables and an anon insert policy for `bookings`. |
| `20260801170000_harden_schema.sql` | Adds `set_updated_at()` triggers, a category check on `projects`, indexes, a `bookings.status` enum-style check, and tightens the booking insert policy with input validation. |
| `20260815120000_fix_booking_phone_country.sql` | **Required.** Corrects the phone pattern in the booking insert policy — the previous migration shipped a Saudi pattern, which rejected every valid Egyptian number. Without this, no booking can ever be submitted. |

**Option A — dashboard (simplest).** Open **SQL Editor**, paste the contents of
each file in order, run each one. All three are written to be safely re-runnable.

**Option B — CLI.**

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 6. What the tables are

| Table | Read | Write | Purpose |
| --- | --- | --- | --- |
| `projects` | anon `SELECT` | none | Portfolio. `category` is checked against `apartments`, `villas`, `offices`, `clinics`, `restaurants`, `commercial`, `landscape` — the filter UI expects exactly these. Ordered by `sort_order`. |
| `testimonials` | anon `SELECT` | none | Client quotes with a rating. Ordered by `sort_order`. |
| `partners` | anon `SELECT` | none | Logo marquee. Ordered by `sort_order`. |
| `bookings` | `authenticated` `SELECT` | anon `INSERT` | Form submissions. `status` starts at `new`. |

Read the migration files for exact columns; they are the authority.

### 7. Row-level security

RLS is **enabled on all four tables**, and there is no policy anywhere that
allows anonymous `UPDATE` or `DELETE`. Verify after migrating:

**Dashboard → Authentication → Policies** — all four tables should show RLS
enabled, with:

- `projects`, `testimonials`, `partners`: one `SELECT` policy for `anon`.
- `bookings`: one `INSERT` policy for `anon` (with the validation `WITH CHECK`),
  and one `SELECT` policy for `authenticated` only.

The last point is the one that matters most: **`bookings` must not be readable
by `anon`.** It holds customer names and phone numbers. If you ever see an anon
read policy on that table, that is a data breach, not a convenience.

The `anon` insert policy also enforces server-side validation independent of the
browser: name length, phone shape, email shape, message length, a sane
`preferred_date` range, and `status = 'new'`. Client validation in
`lib/validation.ts` is a courtesy to the user; this is the actual boundary.

### 8. Storage

**No storage bucket is required, and none is created by the migrations.**
`projects.hero_image`, `projects.gallery_images`, `testimonials.avatar_url` and
`partners.logo_url` are plain text URLs and currently point at external
imagery.

If you want to host media in Supabase instead:

1. **Storage → New bucket**, name it `project-media`, mark it **public**.
2. Upload, then paste the public URLs into the table rows.
3. A public bucket is world-readable by design. Do not put anything in it that
   is not intended to be public, and do not add an anon `INSERT` policy —
   uploads should happen from the dashboard, not from the site. There is no
   upload UI in this project and no reason to add anon write access.

`next.config.js` already allows `**.supabase.co` in `images.remotePatterns` for
this, though note that images are currently rendered with plain `<img>` tags, so
nothing routes through the Next.js optimiser yet.

### 9. Seed data

There is none, by design — a contracting portfolio full of placeholder projects
is worse than an empty state. Insert real rows via the dashboard's Table Editor.
Set `sort_order` deliberately; it drives display order everywhere.

---

## Local Development

```bash
npm run dev        # dev server, http://localhost:3000
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

No test script exists.

Notes for working on this codebase:

- **Restart after `.env.local` changes.** They are build-time values.
- **Section anchors** (`#hero`, `#about`, …) are declared in
  `siteConfig.navLinks` and consumed by both the header and footer. Adding a
  section means adding it there, once.
- **Scroll offsets** go through `lib/header-offset.ts`. Do not hardcode a pixel
  offset for the sticky header.
- **Smooth scrolling is Lenis**, initialised in `components/smooth-scroll.tsx`.
  If a scroll interaction misbehaves, look there before blaming CSS.

---

## Production Build

```bash
npm run build   # next build
npm run start   # next start — serves the build, reads $PORT if set
```

`next build` runs both TypeScript and ESLint. Neither is suppressed: an earlier
version of `next.config.js` set `eslint.ignoreDuringBuilds: true`, which let
lint failures through a green build. That has been removed. If a rule is
genuinely wrong for this project, disable that rule in `.eslintrc.json` — do not
reinstate the blanket ignore.

---

## Vercel Deployment

Full guide: **[docs/DEPLOYMENT-VERCEL.md](./docs/DEPLOYMENT-VERCEL.md)**

Short version:

1. <https://vercel.com/new> → import `AlKayan` → root directory `./`.
2. **Add the environment variables before the first deploy.** A build without
   `NEXT_PUBLIC_SITE_URL` produces canonical URLs and a sitemap pointing at the
   wrong domain.
3. Framework is detected as Next.js; `vercel.json` pins it and the build command.
4. Deploy. Then add your custom domain, update `NEXT_PUBLIC_SITE_URL` to match,
   and **redeploy with the build cache disabled**.

`netlify.toml` is ignored by Vercel and is left in place because the site may
still be deployed to Netlify.

---

## Railway Deployment

Full guide: **[docs/DEPLOYMENT-RAILWAY.md](./docs/DEPLOYMENT-RAILWAY.md)**

Short version:

1. <https://railway.app/new> → **Deploy from GitHub repo** → `AlKayan`.
2. `railway.json` supplies the build command, start command and health check
   (`/api/health`). You should not need to configure any of them.
3. Add the environment variables. **Do not set `PORT`** — Railway provides it
   and `next start` reads it.
4. **Generate Domain**, or attach a custom one, then update
   `NEXT_PUBLIC_SITE_URL` and rebuild.

Railway runs a persistent Node process rather than serverless functions, which
is why the health check exists here and not on Vercel.

---

## Supabase Production Configuration

- **Use a separate Supabase project for production.** Preview deployments and
  local development should not be writing test bookings into the table holding
  real leads. Environment variables are already per-scope on both Vercel and
  Railway, so this costs nothing structurally.
- **Apply all three migrations**, including
  `20260815120000_fix_booking_phone_country.sql`. Skipping it means the booking
  form fails for every visitor.
- **Verify RLS in the production project specifically.** It is not inherited
  from anywhere.
- **Confirm `bookings` is not anon-readable** before pointing traffic at it.
- **Enable Point-in-Time Recovery**, or at minimum confirm daily backups. The
  bookings table is the only irreplaceable data in the system — everything else
  can be re-entered.
- **Watch for spam.** The form has a honeypot field and length limits, but no
  rate limiting and no CAPTCHA. The anon role can insert unlimited rows. If it
  becomes a problem, the right fix is a Supabase Edge Function in front of the
  insert, or Cloudflare Turnstile — not tightening the RLS policy further.
- **CORS**: Supabase's default (`*`) works. If you have restricted it, add every
  production and preview domain, or previews will silently fail to fetch.

---

## Security

**What is public, and why that is fine.** Every environment variable here is
`NEXT_PUBLIC_` and therefore compiled into the JavaScript bundle. The Supabase
anon key is *designed* to be public; it is a claim of "anonymous visitor",
nothing more. Its capabilities are exactly what your RLS policies permit.

**Row-level security is the actual security boundary.** Not the form
validation, not the UI. Anyone can read the anon key out of the bundle and call
the REST API directly. So:

- RLS is enabled on all four tables.
- `bookings` allows anon `INSERT` only. Reads are `authenticated`-only, which
  keeps customer names and phone numbers out of public reach.
- Nothing anywhere permits anon `UPDATE` or `DELETE`.
- The insert policy re-validates every field server-side.

**Service-role keys.** There are none in this repository and there is no code
path that could use one. Do not introduce one. If you ever need privileged
access, it belongs in a Supabase Edge Function or a Next.js Route Handler with a
non-`NEXT_PUBLIC_` variable — never in a Client Component.

**Client/server boundaries.** No server-side data access exists at all, so there
is nothing to accidentally leak across the boundary. `lib/supabase.ts` creates a
lazy browser-only singleton and returns `null` when unconfigured, so a missing
variable produces an empty state rather than a crash. `persistSession: false` —
there is no auth, so no token is stored.

**XSS.** No `dangerouslySetInnerHTML` anywhere except the JSON-LD script in
`app/layout.tsx`, which serialises a static object literal with no user or
database input. React escapes everything else by default. Note that **database
content is rendered as text, not HTML** — keep it that way; the moment someone
renders `projects.description` as HTML, the anon-writable surface becomes an XSS
vector.

**External URLs.** All outbound links use `rel="noopener noreferrer"`. Image and
video URLs come from the database and config; they are used as `src`, not
evaluated.

**Response headers** are set in `next.config.js` so all three deploy targets get
them identically: `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, HSTS, and `X-Powered-By` removed.

**No Content-Security-Policy yet.** This is a known gap, stated rather than
hidden. framer-motion writes inline styles, `next/font` injects a style tag, and
the JSON-LD is an inline script — a real CSP needs nonces and middleware to
issue them. Adding it blind would break rendering in ways only visible in
production.

**HSTS is deliberately `max-age` only**, without `includeSubDomains` or
`preload`. Both are effectively irreversible and this repository cannot know
what else is served from the apex domain. Add them once you have confirmed that.

---

## Performance

**What is done:**

- The page shell is static and prerendered. Supabase is never on the critical
  path.
- **The hero video never blocks first paint.** The poster still is the LCP
  element and always renders first; the `<video>` element is not mounted until
  `requestIdleCallback` fires (2.5s timeout, `setTimeout` fallback), then
  cross-fades in only on the `playing` event. It is skipped entirely under
  reduced-motion or `navigator.connection.saveData`, and any error falls back
  permanently to the still. One element, one `src`, requested once.
- Fonts via `next/font` with the Arabic subset — self-hosted, preloaded, no
  layout shift, no request to Google.
- Scroll reveals use a shared `IntersectionObserver` wrapper (`components/reveal.tsx`)
  that unobserves after firing, rather than scroll listeners.
- Image optimisation is enabled in `next.config.js` (`unoptimized: true` was
  removed) with explicit remote patterns.
- The reduced-motion media query disables the animation work wholesale in CSS,
  which is both correct and cheap.

**Known costs, honestly:**

- **Images are plain `<img>` tags, not `next/image`.** So nothing actually
  routes through the optimiser yet: no automatic WebP/AVIF, no responsive
  `srcset`, no intrinsic sizing. This is the single largest remaining
  performance win, particularly for the project gallery on mobile. The config is
  ready; the components are not converted.
- **Every section is a Client Component**, so the animation libraries all ship
  to the browser. framer-motion, GSAP, Lenis, Swiper and Recharts together are a
  substantial bundle for a marketing page. Recharts in particular is heavy —
  audit whether it is still used at all.
- **`components/ui/` contains 48 shadcn primitives**, most unused. Tree-shaking
  handles unimported files, so this is repository weight rather than bundle
  weight, but it makes the codebase harder to navigate.
- **No caching layer for Supabase reads.** Each visitor refetches on mount.
  Fine at current traffic; move to Server Components with `revalidate` if that
  changes.

---

## SEO

| Item | Where | Status |
| --- | --- | --- |
| Title, description, keywords | `app/layout.tsx` | Arabic, with a `%s \| الكيان` template |
| `metadataBase` / canonical | `app/layout.tsx`, from `NEXT_PUBLIC_SITE_URL` | Correct **only if that variable is set** |
| Open Graph | `app/layout.tsx` + `app/opengraph-image.tsx` | Generated card, currently text-only |
| Twitter/X card | `app/layout.tsx` | `summary_large_image` |
| `robots.txt` | `app/robots.ts` | Allows all, points at the sitemap |
| `sitemap.xml` | `app/sitemap.ts` | Single entry — correct for a one-page site |
| JSON-LD | `app/layout.tsx` | `LocalBusiness`, `addressCountry: EG` |
| `lang` / `dir` | `app/layout.tsx` | `lang="ar"`, `dir="rtl"` |
| Semantic HTML | sections | `<section>` + one `<h1>`, descending headings |
| Image alt text | throughout | Present; decorative images correctly `alt=""` |
| 404 | `app/not-found.tsx` | `noindex, follow` |

**The one thing that will bite you:** `NEXT_PUBLIC_SITE_URL` defaults to
`https://al-kayan.com`. Deploy anywhere without setting it and every canonical
tag, OG URL and sitemap entry advertises that domain instead of yours.

**Also worth knowing:** project and testimonial content is fetched client-side
and is therefore **not in the crawled HTML**. For a portfolio you want indexed,
move those reads to Server Components.

---

## Troubleshooting

**Projects / testimonials / partners sections are empty.**
Supabase is unset or unreachable, or the tables are empty. Check the browser
console for `[projects]` / `[testimonials]` / `[partners]` errors. Confirm both
Supabase variables are set, and that you restarted or rebuilt afterwards.

**The booking form shows تعذر إرسال الطلب.**
Open the console — `contact-section.tsx` logs the Postgres error. If it mentions
a row-level security violation, you have not applied
`supabase/migrations/20260815120000_fix_booking_phone_country.sql`. Without it
the policy validates against a Saudi phone pattern and rejects every Egyptian
number.

**The form is disabled with a message about configuration.**
Expected when Supabase is unset. Not a bug.

**The logo is a gold monogram tile with Arabic letters.**
`public/brand/logo.svg` is missing and the fallback is doing its job. See
[Outstanding work](#outstanding-work).

**The hero video never plays.**
By design under reduced-motion, Save-Data, or when the browser refuses
autoplay. Otherwise check the Network tab for the Pexels URL — it is an external
download endpoint, not a CDN. See [docs/BRAND-ASSETS.md](./docs/BRAND-ASSETS.md).

**Environment variable change had no effect.**
`NEXT_PUBLIC_*` values are compiled in. Restart `dev`, or redeploy — on Vercel,
with the build cache disabled.

**Canonical URLs point at the wrong domain.**
`NEXT_PUBLIC_SITE_URL`. Set it, rebuild.

**Build fails with a type error.**
`next build` typechecks. Reproduce with `npm run typecheck`.

**Anchor links land in the wrong place.**
`lib/header-offset.ts` and `components/smooth-scroll.tsx`. Note `#faq` is nested
inside the contact section rather than being its own section element.

---

## Project Structure

```
app/
  layout.tsx              root layout: fonts, theme, metadata, JSON-LD, header/footer
  page.tsx                composes the sections (Server Component)
  globals.css             design tokens + every custom utility (glass, gold-gradient, ken-burns...)
  loading.tsx             branded route loading state
  error.tsx               route error boundary
  global-error.tsx        root error boundary (inline-styled; no CSS available here)
  not-found.tsx           branded 404
  icon.tsx                favicon, currently an "AK" text approximation
  opengraph-image.tsx     social card, currently text-only
  robots.ts               robots.txt
  sitemap.ts              sitemap.xml
  api/health/route.ts     liveness endpoint for Railway

components/
  brand.tsx               BrandLogo / BrandWordmark / BrandLockup + fallbacks
  call-cta.tsx            the one call button, in "full" and "icon" variants
  site-header.tsx         sticky nav, desktop + mobile, theme toggle, call CTA
  site-footer.tsx         nav, contact, socials
  smooth-scroll.tsx       Lenis
  reveal.tsx              shared IntersectionObserver wrapper
  lightbox.tsx            gallery lightbox
  before-after-slider.tsx finishing comparison
  chat-widget.tsx         floating contact widget
  whatsapp-button.tsx     floating WhatsApp CTA
  back-to-top.tsx         floating scroll-to-top
  theme-provider.tsx      next-themes wrapper
  theme-toggle.tsx        dark/light switch
  sections/               hero, about, services, work-process, stats,
                          projects, designs, testimonials, contact (+ FAQ)
  icons/                  hand-rolled SVGs (WhatsApp, arrow-up)
  ui/                     48 shadcn/ui primitives, most unused

lib/
  site-config.ts          SINGLE SOURCE OF TRUTH — company, branding, hero, nav
  supabase.ts             lazy browser-only client, null when unconfigured
  validation.ts           Zod schemas incl. the Egyptian phone rule
  header-offset.ts        sticky-header scroll offset
  lenis.ts                smooth scroll instance
  utils.ts                cn()

supabase/migrations/      three SQL files, applied in filename order
docs/                     BRAND-ASSETS, DEPLOYMENT-VERCEL, DEPLOYMENT-RAILWAY
public/brand/             logo.svg + company_name.svg — TO BE ADDED

next.config.js            images + security headers
vercel.json               Vercel build config
railway.json              Railway build, start and health check
netlify.toml              legacy Netlify config, still present
tailwind.config.ts        navy/gold palette, fonts, animations
tsconfig.json             strict, @/* → repository root
.eslintrc.json            next/core-web-vitals
```

---

## Dependency and build notes

- **`@next/swc-wasm-nodejs@13.5.1` is in `dependencies`** — a leftover from the
  StackBlitz/Bolt environment this project was scaffolded in. Next.js prefers
  the native SWC binary and only falls back to WASM if that fails to load, so
  it is ~30MB of dead install weight rather than active harm. Removing it
  requires regenerating `package-lock.json`, which should be done and verified
  deliberately, not as a drive-by change.
- **No `.nvmrc`, on purpose.** Pinning a Node version that a host later retires
  fails the build outright, which is worse than letting the platform choose. If
  you hit a Node incompatibility, pin it in the platform's settings — see the
  deployment guides.
- **`recharts` is a dependency** but no chart is visibly used. Worth confirming
  and removing.
- **`netlify.toml` and `@netlify/plugin-nextjs` remain** because the site may
  still be deployed to Netlify. They are inert on Vercel and Railway.
- **`app/icon.tsx` and `app/opengraph-image.tsx` import `ImageResponse` from
  `next/server`** — correct for Next 13. If this is ever upgraded to Next 14+,
  those imports must move to `next/og`.

---

## Outstanding work

Stated plainly so nobody discovers it in production.

1. **The two brand SVGs are not in the repository.** `public/brand/logo.svg` and
   `public/brand/company_name.svg` are referenced by `lib/site-config.ts` and
   rendered by `components/brand.tsx`, but the files do not exist in any branch.
   Every brand surface currently shows the monogram/text fallback. Adding the
   two files is the only step required; no code changes.
   See [docs/BRAND-ASSETS.md](./docs/BRAND-ASSETS.md).
2. **The hero video is served from an external Pexels URL.** Legally fine under
   the Pexels licence, but it is a download endpoint with no availability
   guarantee. Self-host before launch — one environment variable.
3. **`npm run build`, `lint` and `typecheck` have not been run** against the
   most recent changes; the environment they were authored in had no network
   access, so dependencies could not be installed. Run all three before
   deploying.
4. **Images are not using `next/image`.** Largest remaining performance win.
5. **No Content-Security-Policy.** Requires nonces and middleware.
6. **No rate limiting on the booking form.** Honeypot and length limits only.
7. **Portfolio content is not server-rendered**, so it is not indexed.
8. **No test suite at all.**

---

## Production Readiness

Unchecked items are unchecked because they have **not been verified**, not
because they are known to fail.

- [x] Environment variables documented and matching the code
- [x] `.env.example` complete, with placeholders only
- [x] No secrets in the repository; no service-role key anywhere
- [x] Supabase client initialises safely when unconfigured
- [x] RLS enabled on all tables; `bookings` not anon-readable
- [x] Server-side input validation on booking inserts
- [x] Error boundaries, 404 and loading states in place
- [x] Security response headers configured
- [x] SEO metadata, OG, Twitter, canonical, sitemap, robots, JSON-LD in place
- [x] Reduced-motion respected
- [x] Mobile navbar call CTA, 44×44px, no overflow at 320–430px
- [x] Hero video degrades safely on every failure path
- [x] Vercel configuration present and documented
- [x] Railway configuration present and documented, with a health check
- [ ] **Supabase project created and all three migrations applied**
- [ ] **RLS verified in the production project**
- [ ] **`npm run lint` passes**
- [ ] **`npm run typecheck` passes**
- [ ] **`npm run build` passes**
- [ ] **Official brand SVGs committed**
- [ ] Hero video self-hosted
- [ ] Real content in `projects`, `testimonials`, `partners`
- [ ] Production domain set in `NEXT_PUBLIC_SITE_URL`
- [ ] Deployed and smoke-tested on a real device
- [ ] Accessibility verified with a screen reader
- [ ] Lighthouse run on the deployed site
- [ ] Content-Security-Policy added
- [ ] Booking-form spam protection
