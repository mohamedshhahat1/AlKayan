/**
 * The `projects` table, described once.
 *
 * Before the multi-page refactor this shape lived inside the projects section,
 * because that section was the only thing that read it. It is now needed by the
 * section, the cards, the detail page, generateStaticParams, generateMetadata
 * and the sitemap — so it lives here, and there is one answer to "what is a
 * project" and "what is its URL".
 *
 * The columns below are the columns in supabase/migrations, nothing more. If a
 * field is not in the schema it is not invented here.
 */

import { getSupabaseClient } from "@/lib/supabase";

/**
 * A row of `public.projects`.
 *
 * Almost everything is nullable because almost everything is nullable in the
 * database — only `title`, `category` and `hero_image` are NOT NULL. Rendering
 * code has to cope with a half-filled project, so the type says so.
 */
export type Project = {
  id: string;
  title: string;
  title_en: string | null;
  category: string;
  location: string | null;
  area_sqm: number | null;
  duration_days: number | null;
  execution_date: string | null;
  services_included: string[] | null;
  materials_used: string[] | null;
  client_testimonial: string | null;
  client_name: string | null;
  video_url: string | null;
  hero_image: string;
  gallery_images: string[] | null;
  before_image: string | null;
  after_image: string | null;
  featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  /**
   * Optional and read defensively.
   *
   * `slug` is added by supabase/migrations/20260819090000_add_project_slugs.sql
   * and `description` is not in the schema at all today. Both are declared
   * optional so the site works whether or not that migration has been applied,
   * and so a description added later is rendered rather than ignored. select("*")
   * returns whatever exists; these two are the fields we tolerate missing.
   */
  slug?: string | null;
  description?: string | null;
  updated_at?: string | null;
};

export type ProjectsResult = {
  projects: Project[];
  /**
   * True only when Supabase was configured and the query failed. An
   * unconfigured project returns { projects: [], failed: false } — "nothing to
   * show" and "something is broken" are different states and the UI shows
   * different things for them.
   */
  failed: boolean;
};

/** Arabic labels for the seven values allowed by the projects_category_check constraint. */
export const categoryLabels: Record<string, string> = {
  apartments: "شقق",
  villas: "فيلات",
  offices: "مكاتب",
  clinics: "عيادات",
  restaurants: "مطاعم",
  commercial: "تجاري",
  landscape: "لاند سكيب",
};

/**
 * Label for a category, falling back to the raw value.
 *
 * The CHECK constraint on this column was added NOT VALID, so a row can legally
 * hold a category this map has never heard of. Showing the raw value is better
 * than showing nothing.
 */
export function categoryLabel(category: string | null | undefined): string {
  if (!category) return "";

  return categoryLabels[category] ?? category;
}

const executionDateFormatter = new Intl.DateTimeFormat("ar-EG-u-ca-gregory", {
  year: "numeric",
  month: "long",
});

/** Formats execution_date for display, or "" when absent or unparseable. */
export function formatExecutionDate(value: string | null | undefined): string {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return executionDateFormatter.format(parsed);
}

/**
 * Turns a title into something safe to put in a URL.
 *
 * Arabic letters are kept rather than transliterated — a URL-encoded Arabic
 * slug is ugly in a status bar but correct, and the alternative is inventing
 * Latin names for projects that do not have them. Diacritics and tatweel are
 * dropped first so the same title always produces the same slug.
 *
 * Deliberately no `u` flag or \p{...} classes: this project compiles with
 * target es5, where TypeScript rejects both.
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[^0-9a-z\u0621-\u064A]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * The canonical URL segment for a project.
 *
 * Four sources, in order of preference:
 *
 *   1. the `slug` column, if the migration has been applied and it is filled in
 *      — an editor's explicit choice always wins;
 *   2. the English title, which yields the clean /projects/modern-villa shape;
 *   3. the Arabic title;
 *   4. the id, which always exists.
 *
 * The fallback chain is the point: project URLs work today, on the current
 * schema, with no migration and no data entry. Filling in `slug` later improves
 * them without breaking the ones already indexed, because the id form keeps
 * resolving — see getProjectBySlug.
 */
export function projectSlug(
  project: Pick<Project, "id" | "title" | "title_en"> & { slug?: string | null }
): string {
  const explicit = project.slug?.trim();
  if (explicit) return explicit;

  const fromEnglishTitle = project.title_en ? slugify(project.title_en) : "";
  if (fromEnglishTitle) return fromEnglishTitle;

  const fromArabicTitle = slugify(project.title);
  if (fromArabicTitle) return fromArabicTitle;

  return project.id;
}

/** Hero image first, then the gallery, de-duplicated. What the lightbox is given. */
export function projectGallery(project: Project): string[] {
  const images = [project.hero_image, ...(project.gallery_images ?? [])];
  const seen = new Set<string>();

  return images.filter((image) => {
    if (typeof image !== "string") return false;

    const trimmed = image.trim();
    if (!trimmed || seen.has(trimmed)) return false;

    seen.add(trimmed);
    return true;
  });
}

/** A before/after pair is only worth rendering when both halves exist. */
export function hasBeforeAfter(
  project: Project
): project is Project & { before_image: string; after_image: string } {
  return Boolean(project.before_image && project.after_image);
}

/**
 * Every project, in display order.
 *
 * Ordered by sort_order, then newest first so that rows sharing a sort_order
 * (the default is 0) still come back in a stable, sensible sequence rather than
 * whatever order Postgres happens to return.
 *
 * Errors are logged and swallowed. A portfolio section is not worth a 500: the
 * caller gets `failed` and renders an empty state.
 */
export async function getProjects(): Promise<ProjectsResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { projects: [], failed: false };

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[projects] failed to load projects:", error.message);
    return { projects: [], failed: true };
  }

  return { projects: (data ?? []) as Project[], failed: false };
}

/**
 * The projects to show on the homepage.
 *
 * Falls back to the most recent projects when nobody has ticked `featured`,
 * because an empty homepage section is a worse outcome than a slightly arbitrary
 * one.
 */
export function selectFeatured(projects: Project[], limit?: number): Project[] {
  const featured = projects.filter((project) => project.featured === true);
  const chosen = featured.length > 0 ? featured : projects;

  return typeof limit === "number" ? chosen.slice(0, limit) : chosen;
}

/**
 * Resolves a URL segment back to a project.
 *
 * Reads every row and matches in memory rather than filtering server-side, for
 * two reasons: the `slug` column is optional, so `where slug = $1` cannot be
 * relied on; and most slugs are derived from titles, so the database has nothing
 * to match against. A company portfolio is tens of rows, and the result is
 * cached by the page's revalidate window.
 *
 * Ids are accepted as well as slugs, which keeps links minted before a slug was
 * filled in alive.
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const wanted = slug.trim().toLowerCase();
  if (!wanted) return null;

  const { projects } = await getProjects();

  return (
    projects.find(
      (project) =>
        projectSlug(project).toLowerCase() === wanted || project.id.toLowerCase() === wanted
    ) ?? null
  );
}
