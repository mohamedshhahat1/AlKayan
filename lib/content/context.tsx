"use client";

import { createContext, useContext, useMemo } from "react";
import { defaultContent } from "@/lib/content/defaults";
import { resolveSiteDetails, type SiteDetails } from "@/lib/content/site-details";
import type { SectionHeading, SiteContent } from "@/lib/content/types";

/**
 * Carries server-loaded content down to the components that render it.
 *
 * The sections are client components — they own tabs, sliders, accordions,
 * modals and scroll effects, and none of that survives being made a server
 * component. But the content they render has to come from the server so it is
 * in the HTML. A context seeded by the root layout is the join between the
 * two: one read per render, no prop-drilling through five routes, and no
 * client-side request for copy that is identical for every visitor.
 *
 * The default value is `defaultContent` rather than `null`, so a component
 * rendered outside the provider — a test, a story, a section mounted on a new
 * route before its layout is wired — renders real content instead of crashing.
 */
const ContentContext = createContext<SiteContent>(defaultContent);

export function ContentProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent(): SiteContent {
  return useContext(ContentContext);
}

/**
 * One setting by key.
 *
 * `fallback` is a second line of defence behind lib/content/fetch.ts, which
 * has already merged the database over `defaultContent`. It only comes into
 * play for a key defined in neither — a key a component asks for that nobody
 * has written. Returning the key itself would print "hero.clients_label" into
 * the page, so the fallback is required at the call site and the type system
 * enforces it.
 */
export function useSetting(key: string, fallback: string): string {
  const { settings } = useContent();
  return settings[key] ?? fallback;
}

/**
 * Company facts — contact links, hours, warranty terms, timelines — with the
 * Supabase settings layered over the build-time config.
 *
 * Client components should read these through this hook rather than importing
 * `siteConfig` directly. `siteConfig` is still correct at build time and is
 * what the metadata and JSON-LD are built from, but it cannot see a value an
 * editor changed in the dashboard.
 */
export function useSiteDetails(): SiteDetails {
  const { settings } = useContent();
  return useMemo(() => resolveSiteDetails(settings), [settings]);
}

/** The eyebrow / title / subtitle triple for one section. */
export function useHeading(section: string): SectionHeading {
  const { headings } = useContent();
  return (
    headings[section] ??
    defaultContent.headings[section] ?? {
      section,
      eyebrow: "",
      title: "",
      subtitle: null,
    }
  );
}

/** Services in one group, in `sort_order`. */
export function useServicesInGroup(groupSlug: string) {
  const { services } = useContent();
  return useMemo(
    () => services.filter((service) => service.group_slug === groupSlug),
    [services, groupSlug]
  );
}

/** Design images in one category, in `sort_order`. */
export function useDesignImages(categorySlug: string) {
  const { designImages } = useContent();
  return useMemo(
    () => designImages.filter((image) => image.category_slug === categorySlug),
    [designImages, categorySlug]
  );
}
