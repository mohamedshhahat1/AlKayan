import { cache } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { defaultContent } from "@/lib/content/defaults";
import type { SectionHeading, SiteContent, SiteSettings } from "@/lib/content/types";

/**
 * Loads every editable content table and merges it over the shipped defaults.
 *
 * Runs on the server, once per render, so the content is in the HTML rather
 * than arriving after hydration. That is the difference between this and the
 * projects/testimonials/partners fetches in lib/projects.ts and the sections:
 * those are genuinely dynamic collections that may legitimately be empty, and
 * a skeleton is an honest thing to show for them. Section headings and service
 * names are not — they are the page, and rendering the defaults first then
 * swapping them a moment later would be a visible content flash on every load.
 *
 * ## Fallback, not replacement
 *
 * Each table falls back independently. A missing table, a failed request, no
 * Supabase credentials at all, or a list an editor emptied by accident all
 * resolve to `defaultContent` for that one key — never to a blank section. A
 * checkout with no database renders exactly as it did before this layer
 * existed, which is the property that makes it safe to move the copy out of
 * the components at all.
 *
 * `settings` merges per key rather than wholesale: a `site_settings` table
 * holding one overridden row should override that one string and leave the
 * rest alone.
 */

/** Reads one list table. Only published rows; `sort_order` decides the order. */
async function readTable<T>(table: string, fallback: T[]): Promise<T[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(`[content] ${table} failed to load, using defaults:`, error.message);
    return fallback;
  }

  // An empty table is read as "not configured yet" rather than "the editor
  // wants this section blank". Deliberately: the cost of being wrong the first
  // way is an editor having to un-publish rows one at a time to clear a
  // section; the cost of being wrong the second way is a live site with an
  // empty hole in it. The first is much cheaper.
  return data && data.length > 0 ? (data as T[]) : fallback;
}

/**
 * How long one read of the content tables is reused across separate renders.
 *
 * React's `cache` below dedupes *within* a request. That is not enough during
 * `next build`: every statically generated page is its own request, so with the
 * layout plus /services plus the three service-group pages plus /about, one
 * build was firing fifteen queries per page — around a hundred round trips to
 * render seven pages. That is what made static generation for /services time
 * out and fail a build, twice.
 *
 * Sixty seconds collapses a whole build to one read while changing nothing an
 * editor can observe: the rendered pages are already held by ISR for five
 * minutes (`revalidate = 300` in the root layout), so this window sits well
 * inside a staleness budget the site had already accepted.
 *
 * Safe to share across requests because this content is global — the same
 * headings, services and FAQs for every visitor. There is no per-user data in
 * any of these tables, so there is nothing here that could leak from one
 * visitor's render into another's.
 */
const MEMO_MS = 60_000;

let memo: { at: number; promise: Promise<SiteContent> } | null = null;

/**
 * Wrapped in React's `cache` so the fifteen queries below run once per request
 * no matter how many server components ask for the content, and backed by the
 * short module-level memo above so separate renders share one read too.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const now = Date.now();

  if (memo && now - memo.at < MEMO_MS) return memo.promise;

  const promise = loadSiteContent();
  memo = { at: now, promise };

  // loadSiteContent resolves to the defaults rather than throwing, so this is
  // belt and braces — but a cached rejected promise would serve the same
  // failure for a full minute, which is the one outcome worth ruling out.
  promise.catch(() => {
    if (memo?.promise === promise) memo = null;
  });

  return promise;
});

async function loadSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseClient();
  if (!supabase) return defaultContent;

  const [
    settingsRows,
    headingRows,
    serviceGroups,
    services,
    aboutFeatures,
    aboutStats,
    processSteps,
    stats,
    faqs,
    designCategories,
    designImages,
    beforeAfter,
    serviceOptions,
    footerServices,
    heroClients,
  ] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("section_headings").select("section, eyebrow, title, subtitle"),
    readTable("service_groups", defaultContent.serviceGroups),
    readTable("services", defaultContent.services),
    readTable("about_features", defaultContent.aboutFeatures),
    readTable("about_stats", defaultContent.aboutStats),
    readTable("process_steps", defaultContent.processSteps),
    readTable("stats", defaultContent.stats),
    readTable("faqs", defaultContent.faqs),
    readTable("design_categories", defaultContent.designCategories),
    readTable("design_images", defaultContent.designImages),
    readTable("before_after", defaultContent.beforeAfter),
    readTable("service_options", defaultContent.serviceOptions),
    readTable("footer_services", defaultContent.footerServices),
    readTable("hero_clients", defaultContent.heroClients),
  ]);

  return {
    settings: mergeSettings(settingsRows.data, settingsRows.error?.message),
    headings: mergeHeadings(headingRows.data, headingRows.error?.message),
    serviceGroups,
    services,
    aboutFeatures,
    aboutStats,
    processSteps,
    stats,
    faqs,
    designCategories,
    designImages,
    beforeAfter,
    serviceOptions,
    footerServices,
    heroClients,
  };
}

function mergeSettings(
  rows: { key: string; value: string }[] | null,
  errorMessage?: string
): SiteSettings {
  if (errorMessage) {
    console.error("[content] site_settings failed to load, using defaults:", errorMessage);
    return defaultContent.settings;
  }

  const merged: SiteSettings = { ...defaultContent.settings };
  for (const row of rows ?? []) {
    // A row that exists but has been blanked means "use the default", not
    // "render an empty string" — clearing a cell in the table editor is far
    // easier to do by accident than deleting the row.
    if (row.value?.trim()) merged[row.key] = row.value;
  }
  return merged;
}

function mergeHeadings(
  rows: SectionHeading[] | null,
  errorMessage?: string
): Record<string, SectionHeading> {
  if (errorMessage) {
    console.error("[content] section_headings failed to load, using defaults:", errorMessage);
    return defaultContent.headings;
  }

  const merged = { ...defaultContent.headings };
  for (const row of rows ?? []) {
    if (!row.section) continue;
    const fallback = merged[row.section];
    merged[row.section] = {
      section: row.section,
      // Field-level fallback, so an editor filling in only the title does not
      // silently wipe the eyebrow above it.
      eyebrow: row.eyebrow?.trim() || fallback?.eyebrow || "",
      title: row.title?.trim() || fallback?.title || "",
      subtitle: row.subtitle?.trim() || fallback?.subtitle || null,
    };
  }
  return merged;
}
