/**
 * Single source of truth for company contact details, social profiles and the
 * business facts quoted across the site (JSON-LD, header, footer, chat widget,
 * contact section, floating WhatsApp button).
 *
 * Previously these values were hardcoded and duplicated across five files,
 * which meant shipping placeholder data to production. Every value can now be
 * overridden at build time with a NEXT_PUBLIC_* env var, so the same codebase
 * can be deployed for staging and production without code edits.
 *
 * See .env.example for the full list.
 */

const phoneRaw = process.env.NEXT_PUBLIC_COMPANY_PHONE ?? "+201001234567";
const email = process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? "info@al-kayan.com";

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

/**
 * Derives every phone and email link from one raw number and one address.
 *
 * Exported because the number is now also editable from Supabase: when a
 * `contact.phone` setting is present, lib/content/site-details.ts calls this
 * again with that value. The derivation has to happen in one place — the
 * `tel:`, `wa.me`, display and E.164 forms must all agree, and four separate
 * `replace(/\D/g, "")` calls scattered across the codebase is how they stop
 * agreeing.
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
const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL || null;
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL || null;

export const siteConfig = {
  name: "الكيان",
  nameEn: "AL-KAYAN",
  /**
   * The descriptor that sits under the wordmark in the logo lockup. Not the
   * same string as `legalName`: this is the trading line, the other is the
   * registered entity used in the copyright notice and structured data.
   */
  descriptor: "للتشطيبات والمقاولات",
  legalName: "الكيان للمقاولات والتشطيبات",
  title: "الكيان | شركة مقاولات وتشطيبات داخلية فاخرة",
  description:
    "الكيان - شركة رائدة في مجال المقاولات والتشطيبات الداخلية والتصميم الداخلي والخارجي. من الفكرة إلى تسليم المفتاح بأعلى معايير الجودة والاحترافية.",
  shortDescription:
    "نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://al-kayan.com",
  locale: "ar_EG",
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
