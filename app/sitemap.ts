import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getProjects, projectSlug } from "@/lib/projects";
import { getServiceGroupSlugs } from "@/lib/service-groups";

/**
 * Rebuilt hourly. Frequent enough that a new project is discoverable the same
 * day, cheap enough that a crawler cannot turn this into a query per hit.
 */
export const revalidate = 3600;

/**
 * When this build started.
 *
 * Used as `lastModified` for the five static routes, and evaluated once at
 * module load rather than per request. The previous version used `new Date()`
 * inside the handler, which meant every hourly regeneration told crawlers all
 * five pages had just changed. A lastmod that is always "now" is not a signal,
 * it is noise, and a crawler that learns to distrust it stops reading the
 * accurate ones on the project URLs too.
 *
 * This is honest: these pages are code, so the last time they could have
 * changed is the last time the code was deployed.
 */
const BUILD_TIME = new Date();

/**
 * `as const` so the changeFrequency strings stay literal types and satisfy
 * MetadataRoute.Sitemap rather than widening to `string`.
 *
 * The homepage path is "/" and is emitted with its trailing slash, because
 * that is exactly the URL its own canonical tag names. A sitemap listing
 * https://www.alkayan.studio while the page canonicalises to
 * https://www.alkayan.studio/ is two spellings of one page handed to a crawler
 * in the same breath.
 */
const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: BUILD_TIME,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  /**
   * The service-group pages, read from the same table that renders them.
   *
   * Nothing here is hardcoded: publish a fourth group in Supabase and it turns
   * up in the sitemap on the next revalidation, exactly as a new project does.
   * The content layer falls back to the shipped defaults if Supabase is
   * unreachable, so this list is never empty.
   */
  const serviceGroupEntries: MetadataRoute.Sitemap = (await getServiceGroupSlugs()).map(
    (slug) => ({
      url: `${siteConfig.url}/services/${encodeURIComponent(slug)}`,
      lastModified: BUILD_TIME,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // Failure is silent by design: getProjects logs and returns an empty list, so
  // a Supabase outage costs the project URLs rather than the whole sitemap.
  const { projects } = await getProjects();

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${encodeURIComponent(projectSlug(project))}`,
    // updated_at is only on the row if that column is populated; the build time
    // is a worse answer than the truth but a better one than nothing.
    lastModified: project.updated_at ? new Date(project.updated_at) : BUILD_TIME,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...serviceGroupEntries, ...projectEntries];
}
