/*
  # Record where a booking came from

  One form now appears in several places: the contact page, a project page, a
  call-to-action. Which of them produces enquiries is exactly the question this
  refactor is meant to answer, and Google Analytics can only answer it for
  people who accepted analytics. The database should know too.

  `bookings` is left as the single leads table — it already holds name, phone,
  email, service_type, preferred_date and message, and already validates all of
  them in its INSERT policy. A separate contact_leads table would split the
  sales inbox in half for no gain.

  ## Changes

  1. `public.bookings.source` — nullable `text`, e.g. contact_page,
     project_detail. Nullable because every existing row predates it, and
     because the application must keep working if this migration has not run
     yet (lib/leads.ts retries the insert without it).
  2. A length check, since this is a short label chosen by the client, not free
     text a visitor typed.

  ## Security

  No changes to existing policies. `anon_insert_bookings` validates the fields a
  visitor fills in; `source` is set by our own code and is reporting metadata,
  so it is constrained by length here rather than trusted anywhere. It is worth
  being explicit that a client-supplied value is exactly as reliable as the
  client: useful in a report, never an authorisation decision.

  The column-level INSERT grant matters if the table was hardened with
  column-level grants — without it, an anonymous insert naming a column it was
  never granted is refused. Harmless where table-level INSERT is granted.

  ## Notes

  Additive and idempotent.
*/

alter table public.bookings
  add column if not exists source text;

comment on column public.bookings.source is
  'Which page or CTA produced this lead. Reporting only; set by the browser and never trusted.';

alter table public.bookings
  drop constraint if exists bookings_source_length_check;

alter table public.bookings
  add constraint bookings_source_length_check
  check (source is null or char_length(source) <= 60);

grant insert (source) on public.bookings to anon, authenticated;
