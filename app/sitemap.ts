import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getProjects, projectSlug } from "@/lib/projects";

/**
 * Rebuilt hourly. Frequent enough that a new project is discoverable the same
 * day, cheap enough that a crawler cannot turn this into a query per hit.
 */
export const revalidate = 3600;

/**
 * `as const` so the changeFrequency strings stay literal types and satisfy
 * MetadataRoute.Sitemap rather than widening to `string`.
 */
const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    // siteConfig.url has no trailing slash, so "/" would otherwise produce a
    // double one.
    url: route.path === "/" ? siteConfig.url : `${siteConfig.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Failure is silent by design: getProjects logs and returns an empty list, so
  // a Supabase outage costs the project URLs rather than the whole sitemap.
  const { projects } = await getProjects();

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${encodeURIComponent(projectSlug(project))}`,
    // updated_at is only on the row if that column is populated; today's date is
    // a worse answer than the truth but a better one than nothing.
    lastModified: project.updated_at ? new Date(project.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...projectEntries];
}
