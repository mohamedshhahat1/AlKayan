import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ServiceCard } from "@/components/sections/services-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ProjectCard } from "@/components/project-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/reveal";
import { headerOffsetClass } from "@/lib/navigation";
import {
  breadcrumbJsonLd,
  ORGANIZATION_ID,
  pageMetadata,
  webPageJsonLd,
  type Crumb,
} from "@/lib/seo";
import { getServiceGroupPage, getServiceGroupSlugs } from "@/lib/service-groups";
import { siteConfig } from "@/lib/site-config";

/**
 * Matches the content layer's revalidate: these pages are the service
 * catalogue, and an editor publishing a service should see it here on the same
 * schedule it appears on /services.
 */
export const revalidate = 300;

type GroupPageProps = { params: { group: string } };

export async function generateStaticParams() {
  const slugs = await getServiceGroupSlugs();

  return slugs.map((group) => ({ group }));
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const page = await getServiceGroupPage(params.group);

  // A slug that is not a real group is a 404, and a 404 is not indexable.
  if (!page) {
    return { title: "الخدمة غير موجودة", robots: { index: false, follow: true } };
  }

  return pageMetadata({
    title: page.copy.title,
    description: page.copy.description,
    path: `/services/${encodeURIComponent(params.group)}`,
  });
}

/**
 * A service group: what the work covers, how it runs, and what it produced.
 *
 * See lib/service-groups.ts for why this is three pages rather than
 * twenty-six — the short version is that the services table holds a title and
 * four words, and twenty-six pages built from that would be doorway pages.
 *
 * A server component throughout. The only client code that reaches the browser
 * is what was already client: the reveal animations, the service cards' click
 * tracking, and the project cards.
 */
export default async function ServiceGroupPage({ params }: GroupPageProps) {
  const page = await getServiceGroupPage(params.group);
  if (!page) notFound();

  const { group, services, copy, projects, siblings } = page;
  const path = `/services/${encodeURIComponent(group.slug)}`;
  const crumbs: Crumb[] = [
    { name: "خدماتنا", path: "/services" },
    { name: group.label, path },
  ];

  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path,
            name: copy.heading,
            description: copy.description,
            type: "CollectionPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, path),
          {
            /**
             * The group as one Service, with its rows as the offer catalogue.
             *
             * `provider` points at the Organization by @id rather than naming
             * the company again — one entity, referenced, not duplicated. No
             * price, no rating, no availability: none of that exists in the
             * data, and inventing it is how a rich result gets a manual action.
             */
            "@type": "Service",
            "@id": `${siteConfig.url}${path}#service`,
            name: copy.heading,
            description: copy.description,
            serviceType: group.label,
            inLanguage: "ar",
            provider: { "@id": ORGANIZATION_ID },
            areaServed: { "@type": "Country", name: "Egypt" },
            ...(services.length > 0
              ? {
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: copy.heading,
                    itemListElement: services.map((service, index) => ({
                      "@type": "Service",
                      position: index + 1,
                      name: service.title,
                      description: service.description,
                      provider: { "@id": ORGANIZATION_ID },
                    })),
                  },
                }
              : {}),
          },
        ]}
      />

      <section className="relative py-14 lg:py-20">
        <div className="container-luxury">
          <Breadcrumbs crumbs={crumbs} className="mb-8" />

          <SectionHeading
            as="h1"
            center={false}
            eyebrow={group.label}
            title={copy.heading}
            subtitle={copy.intro}
          />

          {services.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
                ما تشمله الخدمة
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          )}

          {/* Only rendered when projects actually recorded this work — see
              projectsForGroup. No filler portfolio. */}
          {projects.length > 0 && (
            <div className="mt-14">
              <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
                مشاريع نفذنا فيها {group.label}
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    placement={`service_group_${group.slug}`}
                  />
                ))}
              </div>

              <Link
                href="/projects"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-gold transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                تصفح كل مشاريع التشطيبات والتصميم
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Sideways links between the groups. Descriptive anchors, and the
              only route Google has from one service page to its siblings. */}
          <nav aria-label="خدمات أخرى" className="mt-14 border-t border-border/70 pt-8">
            <h2 className="mb-4 text-base font-bold text-foreground">خدمات أخرى من الكيان</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {siblings.map((sibling) => (
                <li key={sibling.id}>
                  <Link
                    href={`/services/${encodeURIComponent(sibling.slug)}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    خدمات {sibling.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground transition-colors hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  كل خدمات التشطيب والتصميم
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <WorkProcessSection />
      <ContactSection variant="cta" source="services_page" />
    </div>
  );
}
