/*
  # Schema hardening

  Follow-up to 20260801120755_create_projects_testimonials_bookings.sql.

  1. Booking write policy
     - The original policy was `FOR INSERT TO anon, authenticated WITH CHECK (true)`.
       The anon key ships to every browser, so that policy allows anyone to
       insert unlimited rows of unlimited size straight into `bookings`.
       Replaced with length and format checks that mirror lib/validation.ts.
  2. Data integrity
     - `projects.category` is free text but the UI only has labels for seven
       values; anything else previously rendered as "undefined".
  3. Performance
     - Indexes for the ordering and filtering the app actually performs.
  4. Auditing
     - `updated_at` on every table, maintained by a trigger.

  Safe to re-run.
*/

-- ---------------------------------------------------------------------------
-- 1. updated_at plumbing
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['projects', 'testimonials', 'bookings', 'partners']
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()',
      target_table
    );

    EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON public.%I', target_table, target_table);

    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      target_table, target_table
    );
  END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. projects.category must be one of the values the UI can label
-- ---------------------------------------------------------------------------

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_category_check;

-- NOT VALID: enforced for new and updated rows, existing rows are left alone.
-- Once any stray categories are cleaned up, run:
--   ALTER TABLE public.projects VALIDATE CONSTRAINT projects_category_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_category_check
  CHECK (
    category IN (
      'apartments',
      'villas',
      'offices',
      'clinics',
      'restaurants',
      'commercial',
      'landscape'
    )
  ) NOT VALID;

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS projects_sort_order_idx ON public.projects (sort_order);
CREATE INDEX IF NOT EXISTS projects_category_idx ON public.projects (category);
CREATE INDEX IF NOT EXISTS projects_featured_idx ON public.projects (featured) WHERE featured;

CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);
CREATE INDEX IF NOT EXISTS partners_sort_order_idx ON public.partners (sort_order);

-- Newest-first triage of incoming leads.
CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON public.bookings (created_at DESC);

-- ---------------------------------------------------------------------------
-- 4. Booking triage status
-- ---------------------------------------------------------------------------

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('new', 'contacted', 'scheduled', 'won', 'lost', 'spam'));

CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);

-- ---------------------------------------------------------------------------
-- 5. Tighten the public insert policy on bookings
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS anon_insert_bookings ON public.bookings;

CREATE POLICY anon_insert_bookings
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Name: present and a sane length.
    length(btrim(name)) BETWEEN 3 AND 80

    -- Phone: Saudi mobile, same rule as lib/validation.ts.
    AND regexp_replace(phone, '[\s-]', '', 'g') ~ '^(\+?966|00966|0)?5[0-9]{8}$'

    -- Optional fields: bounded when supplied.
    AND (email IS NULL OR (length(email) <= 120 AND position('@' in email) > 1))
    AND (service_type IS NULL OR length(service_type) <= 60)
    AND (message IS NULL OR length(message) <= 1000)

    -- No backdating or far-future placeholder dates.
    AND (
      preferred_date IS NULL
      OR preferred_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 years'
    )

    -- Submissions always start as new; the status column is for staff.
    AND status = 'new'
  );

-- Leads are readable by signed-in staff only. The anon role can insert but
-- never select, which is why no anon SELECT policy exists here.
DROP POLICY IF EXISTS authenticated_select_bookings ON public.bookings;

CREATE POLICY authenticated_select_bookings
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);
