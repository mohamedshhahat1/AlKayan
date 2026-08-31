import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project-detail";
import { ContactSection } from "@/components/sections/contact-section";
import {
  categoryLabel,
  getProjectBySlug,
  getProjects,
  projectGallery,
  projectSlug,
  type Project,
} from "@/lib/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  ORGANIZATION_ID,
  pageMetadata,
  webPageJsonLd,
  type Crumb,
} from "@/lib/seo";
import { groupsForProject } from "@/lib/service-groups";
import { siteConfig } from "@/lib/site-config";

/**
 * Ten minutes.
 *
 * Long enough that a shared link does not re-query Supabase per visitor, short
 * enough that adding a project to the portfolio shows up without a deploy.
 */
export const revalidate = 600;

type ProjectPageProps = {
  params: { slug: string };
};

/**
 * Pre-renders every project that exists at build time.
 *
 * Projects not in this list still work: `dynamicParams` defaults to true, so a
 * project added after the build is rendered on first request and then cached.
 * That is why this can safely return an empty array when Supabase credentials
 * are absent from the build environment — the pages simply become on-demand.
 */
export async function generateStaticParams() {
  const { projects } = await getProjects();

  return projects.map((project) => ({ slug: projectSlug(project) }));
}

/**
 * A description for this project, from this project's data.
 *
 * The `description` column is not in the schema today, so the fallback is
 * assembled from fields that are: category, location, area and the first few
 * services. That keeps every project's description distinct — the thing
 * requirement 18 is actually asking for — without inventing sentences about
 * work nobody recorded.
 */
function projectDescription(project: Project): string {
  const existing = project.description?.trim();
  if (existing) return existing;

  const parts = [`${categoryLabel(project.category)} من تنفيذ ${siteConfig.name}`];

  if (project.location) parts.push(`في ${project.location}`);
  if (project.area_sqm != null) parts.push(`بمساحة ${project.area_sqm} م²`);

  const services = project.services_included?.slice(0, 3) ?? [];
  if (services.length > 0) parts.push(`يشمل ${services.join("، ")}`);

  return `${parts.join(" ")}.`;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  // Slugs may be Arabic, so the segment arrives percent-encoded.
  const project = await getProjectBySlug(decodeURIComponent(params.slug));

  if (!project) {
    return {
      title: "المشروع غير موجود",
      robots: { index: false, follow: true },
    };
  }

  const slug = projectSlug(project);

  return pageMetadata({
    // The root layout's template turns this into "المشروع | الكيان".
    title: project.title,
    description: projectDescription(project),
    path: `/projects/${encodeURIComponent(slug)}`,
    // The project's own cover image, so a shared link shows the project rather
    // than the site's generic card.
    image: project.hero_image,
  });
}

/**
 * One project.
 *
 * A server component: the query and the metadata happen here, and only the
 * gallery lightbox and the view event go to the browser, inside ProjectDetail.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(decodeURIComponent(params.slug));

  // A slug that does not resolve is a 404, not an empty page. getProjectBySlug
  // also accepts a project id, so links minted before a project had a slug
  // still land here rather than here.
  if (!project) notFound();

  const path = `/projects/${encodeURIComponent(projectSlug(project))}`;
  const description = projectDescription(project);
  const crumbs: Crumb[] = [
    { name: "مشاريعنا", path: "/projects" },
    { name: project.title, path },
  ];

  /**
   * The service pages this project's recorded scope belongs to, and three more
   * projects in the same category.
   *
   * Both exist for the same reason: a project page used to be a leaf. The only
   * way out was the header, the footer, and one "كل المشاريع" link — so a
   * visitor who liked this villa had nowhere to go, and PageRank flowing into a
   * shared project URL stopped dead instead of reaching the service and sibling
   * pages it should lift.
   *
   * Both are derived from real columns and both render nothing when there is
   * nothing to show.
   */
  const [serviceGroups, { projects: allProjects }] = await Promise.all([
    groupsForProject(project.services_included),
    getProjects(),
  ]);

  const related = allProjects
    .filter((other) => other.id !== project.id && other.category === project.category)
    .slice(0, 3);

  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path,
            name: project.title,
            description,
            type: "ItemPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, path),
          {
            /**
             * The project itself.
             *
             * `CreativeWork` rather than `Product`: this is a completed piece
             * of work in a portfolio, not something for sale. Product markup
             * would invite Google to look for a price and a rating that do not
             * exist, and be wrong about what the page is.
             *
             * Every field is conditional on the column being populated. A
             * project row with no location contributes no `locationCreated`
             * rather than an empty one.
             */
            "@type": "CreativeWork",
            "@id": `${absoluteUrl(path)}#project`,
            name: project.title,
            ...(project.title_en ? { alternateName: project.title_en } : {}),
            description,
            url: absoluteUrl(path),
            inLanguage: "ar",
            creator: { "@id": ORGANIZATION_ID },
            mainEntityOfPage: { "@id": `${absoluteUrl(path)}#webpage` },
            ...(project.hero_image
              ? { image: projectGallery(project).map((src) => absoluteUrl(src)) }
              : {}),
            ...(project.category ? { genre: categoryLabel(project.category) } : {}),
            ...(project.location
              ? {
                  locationCreated: {
                    "@type": "Place",
                    name: project.location,
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: project.location,
                      addressCountry: siteConfig.contact.countryCode,
                    },
                  },
                }
              : {}),
            ...(project.execution_date ? { dateCreated: project.execution_date } : {}),
          },
        ]}
      />
      {/* Above the hero, and matching the BreadcrumbList emitted above: Google
          asks that breadcrumb markup describe a trail the page actually shows. */}
      <div className="container-luxury pt-4">
        <Breadcrumbs crumbs={crumbs} />
      </div>

      <ProjectDetail project={project} />

      {(serviceGroups.length > 0 || related.length > 0) && (
        <section className="relative pb-6">
          <div className="container-luxury space-y-12">
            {serviceGroups.length > 0 && (
              <nav aria-labelledby="project-services">
                <h2
                  id="project-services"
                  className="mb-4 text-xl font-bold text-foreground sm:text-2xl"
                >
                  الخدمات المستخدمة في هذا المشروع
                </h2>
                <ul className="flex flex-wrap gap-3">
                  {serviceGroups.map((group) => (
                    <li key={group.id}>
                      <Link
                        href={`/services/${encodeURIComponent(group.slug)}`}
                        className="inline-flex items-center gap-2 rounded-full glass-light border border-border px-5 py-2.5 text-sm font-bold text-foreground transition-all duration-300 hover:border-gold/30 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        خدمات {group.label}
                        <ArrowLeft className="h-4 w-4 text-gold" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {related.length > 0 && (
              <div>
                <h2 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">
                  مشاريع {categoryLabel(project.category)} أخرى
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((other) => (
                    <ProjectCard key={other.id} project={other} placement="project_related" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <ContactSection variant="cta" source="project_detail" />
    </div>
  );
}
