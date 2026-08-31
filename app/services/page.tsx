import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  const { services, serviceGroups } = await getSiteContent();

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

      {/*
        Links down into the three service pages.

        The tabs above are client-side state: switching them changes no URL, so
        before this existed the catalogue had exactly one indexable page and
        every group was invisible to a crawler. These are real anchors with
        descriptive Arabic text — the only route Google has from /services into
        /services/finishing and its siblings.
      */}
      <section className="relative pb-6">
        <div className="container-luxury">
          <nav aria-labelledby="service-pages" className="border-t border-border/70 pt-10">
            <h2 id="service-pages" className="mb-5 text-xl font-bold text-foreground sm:text-2xl">
              تفاصيل كل خدمة
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {serviceGroups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/services/${encodeURIComponent(group.slug)}`}
                    className="group flex h-full items-center justify-between gap-3 rounded-xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <span className="text-sm font-bold text-foreground transition-colors group-hover:text-gold">
                      خدمات {group.label}
                    </span>
                    <ArrowLeft
                      className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
      <WorkProcessSection />
      <ContactSection variant="cta" source="services_page" />
    </div>
  );
}
