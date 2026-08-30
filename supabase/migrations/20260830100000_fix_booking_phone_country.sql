/*
  # Booking phone validation: Saudi -> Egyptian

  20260801170000_harden_schema.sql tightened the public insert policy on
  `bookings` and documented the phone rule as "same rule as lib/validation.ts".
  It was not: the policy required a Saudi mobile

    ^(\+?966|00966|0)?5[0-9]{8}$

  while lib/validation.ts (and every other Egypt-facing detail in the project —
  the address, the JSON-LD areaServed, the FAQ copy, the form placeholder
  01XXXXXXXXX) validates an Egyptian mobile. The two never overlap: an Egyptian
  number's subscriber part starts with 1, the Saudi rule demands 5.

  The effect was that every booking which passed client validation was rejected
  by RLS at insert time, so the form could not produce a single lead in
  production while still looking correct in code review.

  This restates the check against Egyptian mobiles: ten digits beginning with 1,
  where the second digit is the network (10 Vodafone, 11 Etisalat, 12 Orange,
  15 WE), optionally prefixed +20 / 0020 / 0. Kept character-for-character in
  step with `egyptianMobile` in lib/validation.ts.

  Safe to re-run.
*/

DROP POLICY IF EXISTS anon_insert_bookings ON public.bookings;

CREATE POLICY anon_insert_bookings
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Name: present and a sane length.
    length(btrim(name)) BETWEEN 3 AND 80

    -- Phone: Egyptian mobile, same rule as lib/validation.ts.
    AND regexp_replace(phone, '[\s-]', '', 'g') ~ '^(\+?20|0020|0)?1[0125][0-9]{8}$'

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
