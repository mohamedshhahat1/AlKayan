/*
  # Optional URL slug for projects

  Projects now have their own pages, so they need their own URLs. The app can
  already derive one from `title_en` or `title`, which is why this column is
  nullable and why nothing depends on it being filled in: it exists so an editor
  can override a derived slug when the title makes an ugly URL, or pin a slug
  that has already been shared and indexed.

  ## Changes

  1. `public.projects.slug` — nullable `text`.
  2. Backfill from `title_en` where that produces a usable ASCII slug. Rows
     without an English title are left NULL and keep deriving their slug in the
     application, since a slug built from Arabic text is better computed in one
     place (lib/projects.ts) than in two.
  3. A unique index over non-null slugs, so two projects cannot claim the same
     URL. Partial, because any number of rows may legitimately have no slug.

  ## Security

  No policy changes. `anon_select_projects` is USING (true) over the whole row,
  so the new column is readable by the same visitors that can already read the
  title. The column-level GRANT below is a no-op where table-level SELECT is
  already granted, and the fix where it is not.

  ## Notes

  Additive and idempotent: safe to run against a database that already has the
  column, and safe to deploy before or after the application code.
*/

alter table public.projects
  add column if not exists slug text;

comment on column public.projects.slug is
  'Optional URL segment, e.g. modern-villa. NULL means "derive it from the title" (see lib/projects.ts).';

update public.projects
set slug = trim(both '-' from regexp_replace(lower(title_en), '[^a-z0-9]+', '-', 'g'))
where slug is null
  and title_en is not null
  and trim(both '-' from regexp_replace(lower(title_en), '[^a-z0-9]+', '-', 'g')) <> '';

create unique index if not exists projects_slug_key
  on public.projects (slug)
  where slug is not null;

grant select (slug) on public.projects to anon, authenticated;
