/**
 * Writing a lead to Supabase.
 *
 * `bookings` already is the leads table — it has name, phone, email,
 * service_type, preferred_date, message, status and created_at, plus an anon
 * INSERT policy that validates all of them. So no contact_leads table is
 * created here: a second table holding the same rows would split the sales
 * inbox in two, and every existing booking would be invisible from one of them.
 *
 * What was missing is provenance. Now that the same form can be reached from
 * the contact page, a project page or a CTA, `source` records which — see
 * supabase/migrations/20260819090100_add_booking_source.sql.
 *
 * Everything here runs in the browser with the anon key. That is deliberate and
 * safe: row-level security decides what an anonymous insert may contain, and
 * the service-role key is never part of this project.
 */

import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * The fields a lead form collects.
 *
 * Structural on purpose: the contact form's validated values satisfy it without
 * this module depending on the zod schema, and a future form can reuse it
 * without pretending to be a booking.
 */
export type LeadInput = {
  name: string;
  phone: string;
  email?: string | null;
  service_type?: string | null;
  preferred_date?: string | null;
  message?: string | null;
};

/**
 * Where a lead came from. Reporting only — never trusted, never a permission.
 *
 * One member per place a CTA or form can be reached from, so the value on the
 * row and the value on the analytics event are the same vocabulary.
 */
export type LeadSource =
  | "contact_page"
  | "home_cta"
  | "about_page"
  | "services_page"
  | "projects_page"
  | "project_detail";

export type LeadResult =
  | { ok: true }
  | {
      ok: false;
      /**
       * `not_configured` means this deployment has no Supabase credentials, so
       * the form should say so instead of pretending to fail. `insert_failed`
       * is a real error and earns the retry-or-call-us state.
       */
      reason: "not_configured" | "insert_failed";
    };

type BookingRow = {
  name: string;
  phone: string;
  email: string | null;
  service_type: string | null;
  preferred_date: string | null;
  message: string | null;
};

/** Empty strings become NULL: an empty optional column should be absent, not blank. */
function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";

  return trimmed === "" ? null : trimmed;
}

/**
 * Is this failure about the `source` column specifically?
 *
 * PostgREST answers PGRST204 for a column missing from its schema cache, and
 * Postgres answers 42703 for an undefined column or 42501 when a column-level
 * grant is missing. All three mean the same thing here: the migration has not
 * been applied to this database yet.
 */
function isSourceColumnProblem(error: PostgrestError): boolean {
  const code = error.code ?? "";
  if (code === "PGRST204" || code === "42703" || code === "42501") return true;

  return /source/i.test(`${error.message} ${error.details ?? ""}`);
}

/**
 * Stores a lead, and reports honestly whether it landed.
 *
 * The retry is the interesting part. Adding `source` to the insert would
 * otherwise mean that deploying this code before running the migration silently
 * rejects every enquiry. Instead the first attempt carries `source`, and if the
 * column is not there the row is written without it. A lead is worth more than
 * its provenance.
 */
export async function submitLead(input: LeadInput, source: LeadSource): Promise<LeadResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, reason: "not_configured" };

  const row: BookingRow = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: trimOrNull(input.email),
    service_type: trimOrNull(input.service_type),
    preferred_date: trimOrNull(input.preferred_date),
    message: trimOrNull(input.message),
  };

  const attempt = await supabase.from("bookings").insert({ ...row, source });
  if (!attempt.error) return { ok: true };

  if (isSourceColumnProblem(attempt.error)) {
    const retry = await supabase.from("bookings").insert(row);
    if (!retry.error) return { ok: true };

    console.error("[leads] booking insert failed:", retry.error.message);
    return { ok: false, reason: "insert_failed" };
  }

  console.error("[leads] booking insert failed:", attempt.error.message);
  return { ok: false, reason: "insert_failed" };
}
