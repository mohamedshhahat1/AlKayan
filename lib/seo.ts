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
  const socialTitle = `${title} | ${siteConfig.seoName}`;

  /**
   * The sharing card, always set.
   *
   * A route that exports its own `openGraph` object does not inherit the
   * generated card from app/opengraph-image.tsx — Next takes the presence of
   * the object as the route having decided the matter. Every page here exports
   * one, so /about, /services and /projects shipped with no og:image at all
   * while the homepage, which exports no openGraph of its own, had one. Three
   * of the site's five pages produced a bare grey link when shared.
   *
   * So the fallback is named explicitly: the same /opengraph-image route the
   * homepage gets, minus the cache-busting query Next appends to its own
   * reference. Project pages still override it with their own photograph.
   */
  const card = image ?? "/opengraph-image";

  /**
   * Dimensions only for the generated card, whose size we actually know
   * (app/opengraph-image.tsx exports `size` as 1200x630).
   *
   * A project's own hero photograph is whatever an editor uploaded — declaring
   * it 1200x630 would be a guess, and a wrong og:image:width is worse than an
   * absent one: it tells the crawler not to bother measuring.
   */
  const cardSize = image ? {} : { width: 1200, height: 630 };

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
      images: [{ url: card, alt: socialTitle, ...cardSize }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [card],
    },
  };
}


/* -------------------------------------------------------------------------- */
/*  Absolute URLs                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A site-relative path as an absolute URL on the canonical origin.
 *
 * Next resolves `alternates.canonical` and `openGraph.url` against
 * metadataBase for us, so this is not needed there. JSON-LD is raw JSON that
 * Next never touches, and a relative "@id" or "url" in structured data is
 * simply invalid — so everything below goes through here.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/* -------------------------------------------------------------------------- */
/*  Structured data                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Stable node identifiers.
 *
 * Every schema graph on the site points at the same two nodes by @id rather
 * than restating the company on each page. That is what tells Google the
 * Organization on /about and the Organization on /contact are one company and
 * not two, and it is why these strings must never be built ad hoc at a call
 * site.
 */
export const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/**
 * The company.
 *
 * `GeneralContractor` rather than the generic `Organization`: it is a subtype
 * of LocalBusiness, which is what this business actually is, and it is the
 * most specific type the site's own content supports.
 *
 * Every value here already existed in siteConfig — nothing is invented for
 * the markup. Optional facts are omitted rather than guessed: an unset social
 * profile drops out of `sameAs` instead of shipping a dead URL, and there is
 * no street address in `address` because the site does not publish one.
 */
export function organizationJsonLd() {
  const sameAs = [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean);

  return {
    "@type": "GeneralContractor",
    "@id": ORGANIZATION_ID,
    // The full, searched-for form is the entity's name; every other spelling
    // the company is known by is an alternateName, so Google can resolve all of
    // them to this one node instead of guessing they are related.
    name: siteConfig.seoName,
    alternateName: [...siteConfig.alternateNames],
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: `${siteConfig.url}/`,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}/#logo`,
      url: absoluteUrl(siteConfig.branding.logo),
      caption: siteConfig.seoName,
    },
    image: { "@id": `${siteConfig.url}/#logo` },
    telephone: siteConfig.contact.phoneE164,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.contact.city,
      addressRegion: "القاهرة",
      addressCountry: siteConfig.contact.countryCode,
    },
    areaServed: { "@type": "Country", name: "Egypt" },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "21:00",
    },
    priceRange: "$$$",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/**
 * The website, as distinct from the company that runs it.
 *
 * No `potentialAction`/SearchAction: the site has no search page, and
 * declaring one that does not exist is a broken promise to a crawler.
 */
export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${siteConfig.url}/`,
    name: siteConfig.seoName,
    alternateName: siteConfig.nameEn,
    description: siteConfig.description,
    inLanguage: "ar",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export type Crumb = {
  name: string;
  /** Site-relative path. Omit on the final crumb — the page you are already on. */
  path?: string;
};

/**
 * A breadcrumb trail, always rooted at the homepage.
 *
 * The last item deliberately carries no `item`: schema.org's guidance is that
 * the current page does not link to itself, and Google's breadcrumb docs show
 * the trailing element without one.
 */
export function breadcrumbJsonLd(crumbs: Crumb[], pagePath: string) {
  const trail: Crumb[] = [{ name: "الرئيسية", path: "/" }, ...crumbs];

  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(pagePath)}#breadcrumb`,
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path && index < trail.length - 1
        ? { item: absoluteUrl(crumb.path) }
        : {}),
    })),
  };
}

export type WebPageInput = {
  path: string;
  name: string;
  description: string;
  /** Schema type: WebPage, AboutPage, ContactPage, CollectionPage, ItemPage. */
  type?: string;
  crumbs?: Crumb[];
};

/**
 * A page node wired into the site's graph.
 *
 * `isPartOf` and `about` are the whole point: they say this page belongs to
 * this website and is about this company, which is how a crawler gets from a
 * project detail page to the business behind it without guessing.
 */
export function webPageJsonLd({ path, name, description, type = "WebPage", crumbs }: WebPageInput) {
  const url = absoluteUrl(path);

  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "ar",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    ...(crumbs ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  };
}

/**
 * Wraps nodes in a single `@graph`.
 *
 * Keeps the number of <script type="application/ld+json"> blocks on a page to
 * two — the site graph from the root layout, and the page's own — instead of
 * one per node. Google merges blocks and resolves @ids across them either way;
 * the reason to group is that a page assembling its nodes in one place cannot
 * accidentally emit a second, contradictory copy of a node it already has.
 */
export function jsonLdGraph(...nodes: Array<Record<string, unknown> | null | undefined>) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}
