import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Per-route metadata.
 *
 * A single page needed none of this — the root layout said everything there was
 * to say. Six routes need six titles, six descriptions and six canonicals, and
 * the way that goes wrong is five pages copying the sixth's object and one of
 * them forgetting to change the canonical.
 *
 * Deliberately thin: it fills in the parts that are mechanical (canonical,
 * OpenGraph, Twitter) and leaves the parts that are editorial (title,
 * description) to the caller, because generated marketing copy is worse than
 * none.
 */
export type PageMetadataInput = {
  /** Page title, without the site name — the root layout's template appends it. */
  title: string;
  description: string;
  /** Route path, beginning with a slash: "/about", "/projects/modern-villa". */
  path: string;
  /** Absolute image URL for sharing cards. Omit to fall back to the site default. */
  image?: string | null;
};

export function pageMetadata({ title, description, path, image }: PageMetadataInput): Metadata {
  // The template in app/layout.tsx only applies to `title`. Social cards read
  // openGraph.title verbatim, so the site name is added by hand there — which
  // is also what produces requirement 18's "Project Name | Company Name".
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    // Relative, resolved against metadataBase in the root layout. One source of
    // truth for the origin, so a staging deployment cannot advertise production
    // canonicals.
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}
