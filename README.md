# الكيان — AL-KAYAN

Marketing site for الكيان, a contracting and luxury interior finishing company.
Arabic-first (RTL), built with Next.js App Router, Tailwind CSS and Supabase.

## Requirements

- Node.js 18.17 or newer
- A Supabase project (optional for local UI work — see below)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

The site runs at <http://localhost:3000>.

## Environment variables

All variables are listed with descriptions in [`.env.example`](./.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute site URL for canonical tags, Open Graph, `sitemap.xml` and `robots.txt` |
| `NEXT_PUBLIC_COMPANY_PHONE` | recommended | Drives the header button, `tel:` and WhatsApp links |
| `NEXT_PUBLIC_COMPANY_EMAIL` | recommended | Drives the `mailto:` links |
| `NEXT_PUBLIC_FACEBOOK_URL` | no | Leave unset to hide the icon |
| `NEXT_PUBLIC_INSTAGRAM_URL` | no | Leave unset to hide the icon |

Without the Supabase variables the app still builds and runs: the projects,
testimonials and partners sections render their empty state and the booking
form is disabled with an explanatory message, rather than crashing.

Contact details fall back to placeholders when unset. **Set the real values
before going live.**

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Database

SQL lives in [`supabase/migrations`](./supabase/migrations) and is applied in
filename order. Apply it with the Supabase CLI:

```bash
supabase db push
```

### Tables

| Table | Purpose |
| --- | --- |
| `projects`, `testimonials`, `partners` | Portfolio collections. Public read. |
| `bookings` | Consultation requests. Public insert only; staff read when signed in. |
| `site_settings` | Key/value strings: contact details, hours, warranty terms, hero and CTA copy. |
| `section_headings` | The eyebrow / title / subtitle above each section. |
| `service_groups`, `services` | The service tabs and what is in them. |
| `about_features` | The differentiator grid in the About section. |
| `process_steps` | The work-process rail. |
| `stats` | The counters on the dark band. |
| `faqs` | The accordion above the contact form. |
| `design_categories`, `design_images` | The designs gallery tabs and their images. |
| `before_after` | The before/after comparison pairs. |
| `service_options` | The booking form's service dropdown. |

Every list table carries `id` (a stable text slug), `sort_order` (seeded in
tens, so a row slots between two others without renumbering) and
`is_published` (take content off the site without deleting it).

All of these are public read and **not** publicly writable. Editing happens in
the Supabase table editor, which authenticates as the service role. The anon
key ships to every browser, so a write policy would let anyone rewrite the
site's copy.

## Editing site content

Everything the site says is in the tables above and is edited from the Supabase
dashboard — no code change, no redeploy. Pages revalidate every 5 minutes
(`export const revalidate` in [`app/layout.tsx`](./app/layout.tsx)), so a change
appears within that window.

Three things are worth knowing before editing:

- **Nothing can break the site.** [`lib/content/fetch.ts`](./lib/content/fetch.ts)
  falls back per table to [`lib/content/defaults.ts`](./lib/content/defaults.ts),
  which is a complete copy of the shipped content. A missing table, a failed
  request, no credentials at all, or a list emptied by accident renders the
  original content rather than a blank section. A setting whose value is blanked
  out falls back the same way, since clearing a cell is easy to do by mistake.
- **Icons are a fixed set.** `services`, `about_features` and `process_steps`
  store an icon *name*, resolved against the allow-list in
  [`lib/content/icons.ts`](./lib/content/icons.ts). A name outside that list
  renders a neutral square. To add one, import it there.
- **The defaults and the seed are the same data.** The seed in
  `20260830110000_editable_content.sql` is generated from `defaults.ts` by
  `node scripts/generate-content-seed.mjs`. After changing the defaults,
  regenerate rather than editing the SQL by hand. Each statement upserts on the
  row's id, so re-running the migration refreshes seeded rows without
  duplicating them or touching rows an editor added.

## Project structure

```
app/                  routes, metadata, sitemap, robots, generated OG image
components/           shared UI
components/sections/  one file per landing-page section
components/ui/        shadcn/ui primitives
components/brand/     the logo — inline SVG mark plus the text lockup
lib/content/          editable content: types, defaults, fetch, React context
lib/site-config.ts    build-time contact details and brand facts
lib/supabase.ts       shared Supabase browser client
lib/validation.ts     Zod schemas
scripts/              build-time codegen
supabase/migrations/  database schema
```

Content flows one way: `app/layout.tsx` (a server component) calls
`getSiteContent()` once, and `ContentProvider` carries the result to the
section components, which are client components and read it through the hooks
in `lib/content/context.tsx`. Nothing fetches copy from the browser — it is in
the server-rendered HTML.

A client component that needs contact details, opening hours or warranty terms
should call `useSiteDetails()` rather than importing `siteConfig`.
`siteConfig` is still correct at build time and is what the page metadata uses,
but it cannot see a value an editor changed in the dashboard.

Anything shown in more than one place — phone number, email, address, working
hours, warranty terms, project timelines — belongs in `site_settings`, with the
shipped value in `lib/content/defaults.ts`.

## Deployment

Configured for Netlify via [`netlify.toml`](./netlify.toml) and
`@netlify/plugin-nextjs`. Set the same environment variables in the Netlify
site settings.

## Known follow-ups

- Hero, about, stats and gallery images are hot-linked from Pexels. They are
  now editable as `site_settings` and `design_images` rows, so replacing them
  with self-hosted assets before launch is a dashboard change rather than a
  code change.
- The section rhythm is half-redesigned. Hero, services and about use the
  charcoal token layer (`text-ink`, `bg-card`, `border-line`); stats,
  work-process, designs, projects, contact and the footer still use the older
  navy treatment (`#0B1F3A`, `text-navy-deep`, `glass`, `gold-gradient-bg`).
- The chat widget is a keyword matcher, not a real support channel. It labels
  itself as automated and hands off to WhatsApp.
