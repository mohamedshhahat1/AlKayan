import { buildContactLinks, siteConfig } from "@/lib/site-config";
import type { SiteSettings } from "@/lib/content/types";

/**
 * Company facts, with Supabase settings layered over the build-time config.
 *
 * The precedence is deliberate, because there are now three places a phone
 * number could come from:
 *
 *   1. `site_settings` in Supabase — wins. It is the one an editor can change
 *      without a developer, which is the whole point of this layer.
 *   2. A NEXT_PUBLIC_* env var — the deployment's value, used when no setting
 *      row exists. Still the right home for anything that differs between a
 *      staging and a production deploy of the same content.
 *   3. The literal in lib/site-config.ts — the last-resort placeholder.
 *
 * Phone and email are re-derived rather than overridden field by field. A
 * setting that changed the displayed number but left `telHref` pointing at the
 * old one would be worse than not being editable, so an overridden value goes
 * back through `buildContactLinks` and all six forms move together.
 */
export type SiteDetails = ReturnType<typeof resolveSiteDetails>;

export function resolveSiteDetails(settings: SiteSettings) {
  const phone = settings["contact.phone"];
  const email = settings["contact.email"];

  const days = settings["hours.days"] ?? siteConfig.hours.days;
  const time = settings["hours.time"] ?? siteConfig.hours.time;

  // Only rebuild when a setting actually supplies one of the two; otherwise
  // reuse what site-config already derived from the environment.
  const links =
    phone || email
      ? buildContactLinks(phone ?? siteConfig.contact.phoneE164, email ?? siteConfig.contact.email)
      : siteConfig.contact;

  return {
    contact: {
      ...links,
      address: settings["contact.address"] ?? siteConfig.contact.address,
      addressShort: settings["contact.address_short"] ?? siteConfig.contact.addressShort,
      city: settings["contact.city"] ?? siteConfig.contact.city,
      countryCode: settings["contact.country_code"] ?? siteConfig.contact.countryCode,
      mapsHref: settings["contact.maps_href"] ?? siteConfig.contact.mapsHref,
    },
    hours: {
      days,
      time,
      // Derived, not stored. The WhatsApp tooltip wants both on one line;
      // storing that as a third setting would let it disagree with the pair it
      // summarises the moment someone edited only the days.
      summary: `${days}: ${time}`,
    },
    warranty: {
      structuralYears: toYears(
        settings["warranty.structural_years"],
        siteConfig.warranty.structuralYears
      ),
      finishingYears: toYears(
        settings["warranty.finishing_years"],
        siteConfig.warranty.finishingYears
      ),
    },
    timelines: {
      apartments: settings["timelines.apartments"] ?? siteConfig.timelines.apartments,
      villas: settings["timelines.villas"] ?? siteConfig.timelines.villas,
      offices: settings["timelines.offices"] ?? siteConfig.timelines.offices,
    },
  };
}

/**
 * Warranty terms are stored as text like every other setting, but they are fed
 * to `arabicYears`, which branches on the number. A cell holding "two" or a
 * stray space must fall back rather than reach that function as NaN and put
 * "NaN سنة" on a live page.
 */
function toYears(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
