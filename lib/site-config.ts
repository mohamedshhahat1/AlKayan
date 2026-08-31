/**
 * Single source of truth for company contact details, social profiles, brand
 * assets and the business facts quoted across the site (JSON-LD, header,
 * footer, chat widget, contact section, floating WhatsApp button).
 *
 * Previously these values were hardcoded and duplicated across five files,
 * which meant shipping placeholder data to production. Every value can now be
 * overridden at build time with a NEXT_PUBLIC_* env var, so the same codebase
 * can be deployed for staging and production without code edits.
 *
 * See .env.example for the full list.
 */

/**
 * Reads an env var, treating blank as absent.
 *
 * `??` is wrong for this job and it caused a real bug: it falls back only on
 * undefined, so a key that is present but empty — exactly what
 * `cp .env.example .env.local` produces — was handed through as "". The hero
 * then saw an empty video URL, took that as "no video configured" and never
 * played anything.
 *
 * A variable someone has not filled in yet and a variable that is not there at
 * all mean the same thing, so treat them the same.
 */
function envOr(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

const phoneRaw = envOr(process.env.NEXT_PUBLIC_COMPANY_PHONE, "+201001234567");

/** Digits only — required by `tel:` and `wa.me` links. */
const phoneDigits = phoneRaw.replace(/\D/g, "");

/**
 * Renders "201012345678" as "+20 10 1234 5678".
 *
 * Egyptian mobiles are the country code plus ten digits beginning with 1,
 * conventionally grouped 2-4-4. Anything that does not match is returned
 * unformatted rather than mis-spaced.
 */
export function formatPhone(digits: string): string {
  const match = digits.match(/^(20)(1\d)(\d{4})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : `+${digits}`;
}

const email = envOr(process.env.NEXT_PUBLIC_COMPANY_EMAIL, "info@al-kayan.com");

/**
 * The one public home of this website.
 *
 * Hardcoded rather than env-only, and deliberately so. This value is what goes
 * into every canonical tag, every Open Graph URL, every sitemap <loc> and the
 * Sitemap line of robots.txt. When it is wrong, it is not "slightly wrong":
 * Google reads a canonical pointing somewhere else, treats that somewhere else
 * as the real page, and drops this domain from the index entirely.
 *
 * That is not hypothetical. Production ran with NEXT_PUBLIC_SITE_URL set to
 * https://alkayan.vercel.app — which is a different Vercel project serving an
 * unrelated placeholder page — so every page on this domain told Google its
 * true home was a stranger's URL, and `site:alkayan.studio` returned nothing.
 *
 * The env var still overrides, because localhost and staging need it. What it
 * can no longer do is aim the canonical at a deployment host.
 */
const CANONICAL_ORIGIN = "https://www.alkayan.studio";

/**
 * Turns NEXT_PUBLIC_SITE_URL into an origin fit to be a canonical.
 *
 * Four things can go wrong with a hand-typed origin, and all four have:
 *
 *   unset / blank      the fallback is the real domain, not a guess
 *   trailing slash     `${url}/about` would become `//about`
 *   a *.vercel.app     never a canonical — see above
 *   the bare apex      alkayan.studio 308s to www, so publishing the apex as
 *                      canonical publishes a URL that redirects
 *
 * Anything unparseable falls back rather than throwing: a malformed variable
 * should cost a deploy nothing, and shipping the correct origin is a better
 * failure than a build error at the top of a module every page imports.
 */
function resolveSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return CANONICAL_ORIGIN;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return CANONICAL_ORIGIN;
  }

  // Preview and production deployment hosts are for reaching the app, never for
  // naming it. A canonical is a claim about identity, and this is not it.
  if (parsed.hostname === "vercel.app" || parsed.hostname.endsWith(".vercel.app")) {
    return CANONICAL_ORIGIN;
  }

  // The apex redirects to www at the edge (308). Canonicalising to a URL that
  // redirects makes Google follow a hop to find the page it was already given.
  if (parsed.hostname === "alkayan.studio") return CANONICAL_ORIGIN;

  // `.origin` drops any path, query, fragment and trailing slash in one move.
  return parsed.origin;
}

/**
 * Derives every phone and email link from one raw number and one address.
 *
 * Exported because the number is editable from Supabase as well: when a
 * `contact.phone` setting is present, lib/content/site-details.ts calls this
 * again with that value. The derivation has to happen in one place — the
 * `tel:`, `wa.me`, display and E.164 forms must all agree, and a setting that
 * moved the displayed number while the link still pointed at the old one would
 * be worse than the number not being editable at all.
 */
export function buildContactLinks(rawPhone: string, rawEmail: string) {
  const digits = rawPhone.replace(/\D/g, "");

  return {
    phone: formatPhone(digits),
    phoneE164: "+" + digits,
    telHref: "tel:+" + digits,
    whatsappHref: "https://wa.me/" + digits,
    email: rawEmail,
    mailtoHref: "mailto:" + rawEmail,
  };
}

const contactLinks = buildContactLinks(phoneRaw, email);

/**
 * Optional links. Leave the env var unset and the corresponding icon is hidden
 * entirely rather than rendering a dead `href="#"`.
 */
const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || null;
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;

/**
 * Hero background media.
 *
 * Both files are committed to this repository and served from `public/`, so
 * the hero works with no environment configuration at all. Self-hosting rather
 * than hotlinking is deliberate: no third-party redirect on the critical path,
 * no host that can start refusing the request, and the encode is under our
 * control.
 *
 * The paths stay overridable so the media can be moved to object storage or a
 * CDN later without touching a component.
 *
 * To turn either off, set the variable to `off`. Leaving it blank does NOT
 * disable it — blank means "not configured", which falls through to the
 * default. Switching the opt-out from "" to an explicit word is deliberate:
 * the empty string was indistinguishable from a half-finished .env file, and
 * silently shipped a hero with no video.
 */
const DEFAULT_HERO_VIDEO = "/brand/hero.mp4";
const DEFAULT_HERO_POSTER = "/brand/hero-poster.jpg";

function heroMedia(value: string | undefined, fallback: string): string {
  const resolved = envOr(value, fallback);
  return resolved.toLowerCase() === "off" ? "" : resolved;
}

const heroVideo = heroMedia(process.env.NEXT_PUBLIC_HERO_VIDEO_URL, DEFAULT_HERO_VIDEO);

/**
 * The still behind the hero. First thing painted, and the last thing standing:
 * it stays on screen until the video is genuinely playing, and it remains
 * permanently for anyone on reduced motion or data-saver, and whenever the
 * video fails.
 *
 * Preloaded from <head> in app/layout.tsx and rendered as a real <img>, not a
 * CSS background — a background-image cannot be found by the preload scanner.
 *
 * If you replace the video, export the poster from the new footage so the
 * still and the first frame match and the cross-fade is invisible:
 *
 *     ffmpeg -ss 2 -i public/brand/hero.mp4 -frames:v 1 -q:v 3 public/brand/hero-poster.jpg
 */
const heroPoster = heroMedia(process.env.NEXT_PUBLIC_HERO_POSTER_URL, DEFAULT_HERO_POSTER);

export const siteConfig = {
  name: "الكيان",
  nameEn: "AL-KAYAN",
  /**
   * Two-letter Arabic monogram.
   *
   * No longer the logo. It is the fallback drawn by <BrandLogo /> when
   * `branding.logo` cannot be loaded, so the header degrades to the previous
   * design instead of a broken image icon.
   */
  monogram: "الك",
  legalName: "الكيان للمقاولات والتشطيبات",
  title: "الكيان | شركة مقاولات وتشطيبات داخلية فاخرة",
  description:
    "الكيان - شركة رائدة في مجال المقاولات والتشطيبات الداخلية والتصميم الداخلي والخارجي. من الفكرة إلى تسليم المفتاح بأعلى معايير الجودة والاحترافية.",
  shortDescription:
    "نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية.",
  /**
   * Absolute origin, no trailing slash. Drives metadataBase, every canonical,
   * Open Graph, the sitemap and robots.txt. See resolveSiteUrl above.
   */
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "ar_EG",

  /**
   * Official brand assets.
   *
   * Paths are public URLs served from `public/`, not filesystem paths. Import
   * them from here — a component that hardcodes "/brand/logo.svg" is a second
   * source of truth waiting to drift.
   *
   * The SVGs are used exactly as supplied: never recoloured, redrawn or
   * inlined. Sizing is done with a height class and `width: auto`, so whatever
   * aspect ratio the files have is preserved.
   */
  branding: {
    /** Logo mark. */
    logo: "/brand/logo.svg",
    /** Company name / wordmark. */
    companyName: "/brand/company_name.svg",
    /**
     * Alt text for each asset when it is the only thing naming the company.
     * Pass alt="" at the call site when an ancestor link or heading already
     * announces the name.
     */
    logoAlt: "شعار الكيان",
    companyNameAlt: "الكيان",
  },

  hero: {
    video: heroVideo,
    poster: heroPoster,
  },

  keywords: [
    "تشطيبات",
    "مقاولات",
    "تصميم داخلي",
    "تصميم خارجي",
    "الكيان",
    "تشطيب شقق",
    "تشطيب فلل",
    "تشطيب مكاتب",
    "ديكور",
    "مقاولات عامة",
    "تشطيبات القاهرة الجديدة",
    "مقاولات مصر",
  ],
  contact: {
    ...contactLinks,
    address: "القاهرة الجديدة، القاهرة، مصر",
    addressShort: "القاهرة الجديدة، مصر",
    city: "القاهرة الجديدة",
    countryCode: "EG",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=New+Cairo%2C+Egypt",
  },
  hours: {
    days: "السبت - الخميس",
    time: "9:00 ص - 9:00 م",
    summary: "السبت - الخميس: 9ص - 9م",
  },
  social: {
    facebook,
    instagram,
  },
  /**
   * Quoted by the chat widget and the FAQ section. Kept here so a change to the
   * warranty terms cannot leave the two out of sync.
   */
  warranty: {
    structuralYears: 2,
    finishingYears: 1,
  },
  timelines: {
    apartments: "60-90 يوماً",
    villas: "120-180 يوماً",
    offices: "60-120 يوماً",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Social profiles that are actually configured, ready to map over. */
export const socialLinks = [
  { key: "facebook", label: "فيسبوك", href: siteConfig.social.facebook },
  { key: "instagram", label: "انستغرام", href: siteConfig.social.instagram },
].filter((link): link is { key: string; label: string; href: string } => Boolean(link.href));
