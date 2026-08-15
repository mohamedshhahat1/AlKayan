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
function formatPhone(digits: string): string {
  const match = digits.match(/^(20)(1\d)(\d{4})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : `+${digits}`;
}

const email = envOr(process.env.NEXT_PUBLIC_COMPANY_EMAIL, "info@al-kayan.com");

/**
 * Optional links. Leave the env var unset and the corresponding icon is hidden
 * entirely rather than rendering a dead `href="#"`.
 */
const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || null;
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || null;

/**
 * Hero background footage.
 *
 * Defaults to the Pexels asset supplied for this build. It is read from an env
 * var so the same code can point at a self-hosted file — set
 * NEXT_PUBLIC_HERO_VIDEO_URL to `/brand/hero.mp4`, drop the file in `public/`
 * and nothing else has to change. See docs/BRAND-ASSETS.md for why the
 * external URL is the current default.
 *
 * To turn the video off, set the variable to `off`. Leaving it blank does NOT
 * disable it — blank means "not configured", which falls through to the
 * default. Switching the opt-out from "" to an explicit word is deliberate:
 * the empty string was indistinguishable from a half-finished .env file, and
 * silently shipped a hero with no video.
 */
const DEFAULT_HERO_VIDEO = "https://www.pexels.com/download/video/31617692/";

const heroVideoRaw = envOr(process.env.NEXT_PUBLIC_HERO_VIDEO_URL, DEFAULT_HERO_VIDEO);
const heroVideo = heroVideoRaw.toLowerCase() === "off" ? "" : heroVideoRaw;

/**
 * Still shown before the video is ready, and permanently whenever the video
 * cannot or should not play. This is the image the hero used before the video
 * existed, so the fallback is the previously shipped design rather than a
 * blank navy box.
 *
 * w=2560 rather than 1920: the layer is scaled up to 1.18 by the Ken Burns
 * keyframes and to 1.15 by the parallax, so at 1920 the browser was upscaling
 * on any large or retina screen.
 *
 * There is no opt-out for this one. The hero is a full-viewport section with
 * white text on a scrim; without an image behind it there is nothing to scrim.
 */
const heroPoster = envOr(
  process.env.NEXT_PUBLIC_HERO_POSTER_URL,
  "https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=2560"
);

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
  url: envOr(process.env.NEXT_PUBLIC_SITE_URL, "https://al-kayan.com"),
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
    phone: formatPhone(phoneDigits),
    phoneE164: "+" + phoneDigits,
    telHref: "tel:+" + phoneDigits,
    whatsappHref: "https://wa.me/" + phoneDigits,
    email,
    mailtoHref: "mailto:" + email,
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
