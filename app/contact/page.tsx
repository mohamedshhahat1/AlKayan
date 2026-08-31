import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import { breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { isKnownService } from "@/lib/services";
import { siteConfig } from "@/lib/site-config";

const PATH = "/contact";

const DESCRIPTION =
  "معاينة واستشارة مجانية ورد من فريقنا خلال 24 ساعة. احجز استشارتك عبر النموذج، أو تواصل معنا هاتفياً أو عبر واتساب.";

export const metadata: Metadata = pageMetadata({
  title: "تواصل معنا",
  description: DESCRIPTION,
  path: PATH,
});

const crumbs = [{ name: "تواصل معنا", path: PATH }];

type ContactPageProps = {
  searchParams: { service?: string | string[] };
};

/**
 * The contact page.
 *
 * ?service= lets a service card carry its subject into the form, which is the
 * difference between "someone enquired" and "someone enquired about smart home
 * wiring". The value is checked against the real catalogue before it is used:
 * it arrives from a URL, so it is attacker-controlled, and an unrecognised one
 * is dropped rather than rendered.
 *
 * The canonical is the bare /contact for every one of those variants — see
 * pageMetadata, which takes a fixed path. ?service=… is a form convenience,
 * not a separate page, and letting each of twenty-six values self-canonicalise
 * would put twenty-six near-identical URLs in front of a crawler.
 */
export default async function ContactPage({ searchParams }: ContactPageProps) {
  const requested = typeof searchParams.service === "string" ? searchParams.service : undefined;
  // Async because the catalogue is a Supabase read now, not a module constant.
  const defaultService = requested && (await isKnownService(requested)) ? requested : undefined;

  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path: PATH,
            name: "تواصل معنا",
            description: DESCRIPTION,
            type: "ContactPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, PATH),
          {
            // The phone number and hours as a contact point, attached to the
            // company rather than restated as a second organisation.
            "@type": "ContactPoint",
            "@id": `${siteConfig.url}${PATH}#contact-point`,
            contactType: "customer service",
            telephone: siteConfig.contact.phoneE164,
            email: siteConfig.contact.email,
            areaServed: "EG",
            availableLanguage: ["ar", "en"],
            parentOrganization: { "@id": ORGANIZATION_ID },
          },
        ]}
      />
      <ContactSection
        source="contact_page"
        defaultService={defaultService}
        // This page had no heading of its own: it opened at the FAQ's h2. The
        // page whose entire subject is "get in touch" now says so, once, as an
        // h1 — the same heading component every other route uses.
        pageHeading={{
          eyebrow: "تواصل معنا",
          title: "لنبدأ الحديث عن مشروعك",
          subtitle: "معاينة واستشارة مجانية، ورد من فريقنا خلال 24 ساعة.",
        }}
      />
    </div>
  );
}
