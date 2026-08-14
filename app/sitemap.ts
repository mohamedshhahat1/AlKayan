import type { MetadataRoute } from "next";
import { locationPages, servicePages } from "@/lib/seo-data";
import { getProjectIds } from "@/lib/projects-server";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectIds = await getProjectIds();
  const now = new Date();

  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...servicePages.map((service) => ({ url: `${siteConfig.url}/services/${service.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 })),
    { url: `${siteConfig.url}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...projectIds.map((id) => ({ url: `${siteConfig.url}/projects/${id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...locationPages.map((location) => ({ url: `${siteConfig.url}/locations/${location.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
