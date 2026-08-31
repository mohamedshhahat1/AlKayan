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
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  ORGANIZATION_ID,
  pageMetadata,
  webPageJsonLd,
} from "@/lib/seo";
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
  const crumbs = [
    { name: "مشاريعنا", path: "/projects" },
    { name: project.title, path },
  ];

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
      <ProjectDetail project={project} />
      <ContactSection variant="cta" source="project_detail" />
    </div>
  );
}
