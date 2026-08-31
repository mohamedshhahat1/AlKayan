import type { Metadata } from "next";
import { ServicesSection } from "@/components/sections/services-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import { getSiteContent } from "@/lib/content/fetch";
import { breadcrumbJsonLd, ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const PATH = "/services";

const DESCRIPTION =
  "باقة شاملة من خدمات المقاولات والتشطيبات والتصميم: تشطيب الشقق والفلل والمكاتب والعيادات والمطاعم، التصميم الداخلي والخارجي، والأعمال المتخصصة تحت سقف واحد.";

export const metadata: Metadata = pageMetadata({
  title: "خدماتنا",
  description: DESCRIPTION,
  path: PATH,
});

const crumbs = [{ name: "خدماتنا", path: PATH }];

/**
 * The services page.
 *
 * A server component now reads the catalogue as well as rendering the section,
 * so the list of services exists in structured data and not only in the DOM.
 * The read is memoised per request (see lib/content/fetch.ts), so asking for it
 * here costs nothing on top of the layout's own call.
 */
export default async function ServicesPage() {
  const { services } = await getSiteContent();

  /**
   * The catalogue, as schema.org sees it.
   *
   * `OfferCatalog` of `Service` is the accurate shape: these are named services
   * the company offers, not products with prices. Every field is copied from a
   * row an editor wrote — no price, no rating, no availability is invented,
   * because none of that exists in the data and structured data that overstates
   * a page is worse than none at all.
   */
  const catalogue =
    services.length > 0
      ? {
          "@type": "OfferCatalog",
          "@id": `${siteConfig.url}${PATH}#catalog`,
          name: "خدمات الكيان",
          inLanguage: "ar",
          itemListElement: services.map((service, index) => ({
            "@type": "Service",
            position: index + 1,
            name: service.title,
            description: service.description,
            serviceType: service.title,
            provider: { "@id": ORGANIZATION_ID },
            areaServed: { "@type": "Country", name: "Egypt" },
          })),
        }
      : null;

  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path: PATH,
            name: "خدماتنا",
            description: DESCRIPTION,
            type: "CollectionPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, PATH),
          catalogue,
        ]}
      />
      {/* Default props: all three category tabs and the whole catalogue.
          headingAs="h1" because this section is the page. */}
      <ServicesSection headingAs="h1" />
      <WorkProcessSection />
      <ContactSection variant="cta" source="services_page" />
    </div>
  );
}
