import { getSupabaseClient } from "@/lib/supabase";
import { defaultContent } from "@/lib/content/defaults";
import type { SectionHeading, SiteContent, SiteSettings } from "@/lib/content/types";

/**
 * Loads every editable content table and merges it over the shipped defaults.
 *
 * Runs on the server, once per render of the page, so the content is in the
 * HTML rather than arriving after hydration. That is the difference between
 * this and the existing projects/testimonials/partners fetches: those are
 * genuinely dynamic collections that may be empty, and a spinner is an honest
 * thing to show for them. Section headings and service names are not — they
 * are the page, and rendering the defaults first and swapping them a moment
 * later would be a visible content flash on every load.
 *
 * ## Fallback, not replacement
 *
 * Each table falls back independently. A missing table, a failed request, no
 * Supabase credentials at all, or a list an editor has emptied by accident all
 * resolve to `defaultContent` for that one key — never to a blank section. A
 * site with no database still renders exactly as it did before this content
 * layer existed, which is the property that makes it safe to move the copy out
 * of the components.
 *
 * `settings` merges per key rather than wholesale: a `site_settings` table
 * holding one overridden row should override that one string and leave the
 * other forty alone.
 */

/** Only published rows reach the site; `sort_order` decides the order. */
async function readTable<T>(
  table: string,
  fallback: T[]
): Promise<T[]> {
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

  // An empty table is treated as "not configured yet" rather than as "the
  // editor wants this section blank". Deliberately: the failure mode of the
  // first reading is a section that looks unfinished on a live site, and the
  // failure mode of the second is an editor having to un-publish rows one by
  // one to clear a section. The first is much worse.
  return data && data.length > 0 ? (data as T[]) : fallback;
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = getSupabaseClient();

  if (!supabase) return defaultContent;

  const [
    settingsRows,
    headingRows,
    serviceGroups,
    services,
    aboutFeatures,
    processSteps,
    stats,
    faqs,
    designCategories,
    designImages,
    beforeAfter,
    serviceOptions,
  ] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("section_headings").select("section, eyebrow, title, subtitle"),
    readTable("service_groups", defaultContent.serviceGroups),
    readTable("services", defaultContent.services),
    readTable("about_features", defaultContent.aboutFeatures),
    readTable("process_steps", defaultContent.processSteps),
    readTable("stats", defaultContent.stats),
    readTable("faqs", defaultContent.faqs),
    readTable("design_categories", defaultContent.designCategories),
    readTable("design_images", defaultContent.designImages),
    readTable("before_after", defaultContent.beforeAfter),
    readTable("service_options", defaultContent.serviceOptions),
  ]);

  return {
    settings: mergeSettings(settingsRows.data, settingsRows.error?.message),
    headings: mergeHeadings(headingRows.data, headingRows.error?.message),
    serviceGroups,
    services,
    aboutFeatures,
    processSteps,
    stats,
    faqs,
    designCategories,
    designImages,
    beforeAfter,
    serviceOptions,
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
    // A row present but blanked out means "use the default", not "render an
    // empty string" — clearing a cell in the table editor is far easier to do
    // by accident than deleting the row.
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
