/*
  # Fix the booking phone check: Egypt, not Saudi Arabia

  20260801170000_harden_schema.sql tightened `anon_insert_bookings` with a
  WITH CHECK that validates the submitted phone number. The pattern it shipped
  is a Saudi mobile:

      ^(\+?966|00966|0)?5[0-9]{8}$

  Every other part of this project is Egyptian. lib/validation.ts accepts
  ^(?:\+?20|0020|0)?1[0125]\d{8}$, lib/site-config.ts defaults to +2010...,
  the address is New Cairo, and the JSON-LD sets addressCountry to EG.

  The consequence is not cosmetic. The two rules only overlap on ten-digit
  numbers beginning 05, which no Egyptian mobile is, so in production every
  booking that passed client validation was then rejected by Postgres with a
  row-level security violation. The visitor saw "تعذر إرسال الطلب", and the
  lead was lost. Nothing in the client logs the distinction, which is why it
  could sit unnoticed.

  This migration restates the policy with the Egyptian pattern. Every other
  clause is carried over unchanged.

  Note the pattern is kept deliberately loose about the prefix, exactly as
  lib/validation.ts is: the form strips spaces and hyphens but does not
  normalise to E.164, so the column legitimately receives 01012345678,
  +201012345678 and 00201012345678 from different visitors.

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

    -- Phone: Egyptian mobile. 10 digits starting with 1, second digit
    -- identifying the network (10 Vodafone, 11 Etisalat, 12 Orange, 15 WE),
    -- with an optional +20 / 0020 / 0 prefix. Mirrors lib/validation.ts.
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
