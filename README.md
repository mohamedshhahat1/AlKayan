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
filename order. Tables: `projects`, `testimonials`, `partners` (public read) and
`bookings` (public insert only — nothing in the app reads it back).

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

## Project structure

```
app/                  routes, metadata, sitemap, robots, generated OG image
components/           shared UI
components/sections/  one file per landing-page section
components/ui/        shadcn/ui primitives
lib/site-config.ts    single source of truth for contact details and copy
lib/supabase.ts       shared Supabase browser client
lib/validation.ts     Zod schemas
supabase/migrations/  database schema
```

Anything shown in more than one place — phone number, email, address, working
hours, warranty terms, project timelines — belongs in `lib/site-config.ts`.

## Deployment

Configured for Netlify via [`netlify.toml`](./netlify.toml) and
`@netlify/plugin-nextjs`. Set the same environment variables in the Netlify
site settings.

## Known follow-ups

- Hero, about and stats images are hot-linked from Pexels. Replace them with
  self-hosted assets before launch.
- The chat widget is a keyword matcher, not a real support channel. It labels
  itself as automated and hands off to WhatsApp.
