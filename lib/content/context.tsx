"use client";

import { createContext, useContext, useMemo } from "react";
import { defaultContent } from "@/lib/content/defaults";
import { resolveSiteDetails, type SiteDetails } from "@/lib/content/site-details";
import type { SectionHeading, SiteContent } from "@/lib/content/types";

/**
 * Carries server-loaded content down to the section components.
 *
 * The sections are client components — they own tabs, sliders, modals and
 * scroll effects, and none of that survives being made a server component. But
 * the content they render has to come from the server so it is in the HTML.
 * A context seeded by a server component is the join between the two: one
 * fetch in the layout, no prop-drilling through nine sections, and no
 * client-side request for copy that never changes between visitors.
 *
 * The default value is `defaultContent` rather than `null`, so a component
 * rendered outside the provider (a test, a Storybook story, a section someone
 * mounts on a new route) renders real content instead of crashing.
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
 * play for a key that exists in neither — that is, a key a component asks for
 * but nobody has defined. Returning the key itself would print
 * "hero.tagline" into the page, so an explicit fallback is required at the
 * call site and the type system enforces it.
 */
export function useSetting(key: string, fallback: string): string {
  const { settings } = useContent();
  return settings[key] ?? fallback;
}

/**
 * Company facts — contact links, hours, warranty terms, timelines — with the
 * Supabase settings layered over the build-time config.
 *
 * Every client component should read these through this hook rather than
 * importing `siteConfig` directly. `siteConfig` is still correct at build time
 * and is what the metadata and JSON-LD use, but it cannot see a value an
 * editor changed in the dashboard; this can.
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

/** Services for one group, in `sort_order`. */
export function useServicesInGroup(groupSlug: string) {
  const { services } = useContent();
  return useMemo(
    () => services.filter((service) => service.group_slug === groupSlug),
    [services, groupSlug]
  );
}

/** Design images for one category, in `sort_order`. */
export function useDesignImages(categorySlug: string) {
  const { designImages } = useContent();
  return useMemo(
    () => designImages.filter((image) => image.category_slug === categorySlug),
    [designImages, categorySlug]
  );
}
