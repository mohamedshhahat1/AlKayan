import type { Metadata } from "next";
import { ProjectsSection } from "@/components/sections/projects-section";
import { DesignsSection } from "@/components/sections/designs-section";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import { getProjects, projectSlug, type Project } from "@/lib/projects";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const PATH = "/projects";

const DESCRIPTION =
  "معرض أعمالنا الفاخرة: مشاريع تشطيب وتصميم نفذناها بأعلى معايير الجودة — شقق وفلل ومكاتب وعيادات، مع صور قبل وبعد وتفاصيل كل مشروع.";

export const metadata: Metadata = pageMetadata({
  title: "مشاريعنا",
  description: DESCRIPTION,
  path: PATH,
});

const crumbs = [{ name: "مشاريعنا", path: PATH }];

/**
 * How long the build will wait for the portfolio before giving up on it.
 *
 * This page is statically generated, so its Supabase read runs during
 * `next build`. getProjects handles an *error* — it logs and reports `failed` —
 * but it cannot handle a request that simply never comes back, and Next's
 * static generation timeout turns that into a failed build. A deploy that
 * cannot ship because a database was briefly slow is a bad trade for a section
 * that already knows how to render without it.
 *
 * Ten seconds is far longer than the query takes (tens of milliseconds) and far
 * shorter than the 60s generation budget, so a timeout here is always a real
 * problem rather than an impatient one.
 */
const PORTFOLIO_READ_TIMEOUT_MS = 10_000;

async function projectsForPage(): Promise<{ projects: Project[]; failed: boolean }> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<{ projects: Project[]; failed: boolean }>((resolve) => {
    timer = setTimeout(() => {
      console.error("[projects] server read timed out; the grid will fetch client-side.");
      resolve({ projects: [], failed: true });
    }, PORTFOLIO_READ_TIMEOUT_MS);
  });

  try {
    return await Promise.race([getProjects(), timeout]);
  } finally {
    // Losing the race does not cancel the timer, and a pending timer keeps the
    // event loop — and a serverless invocation — alive for no reason.
    clearTimeout(timer);
  }
}

/**
 * Matches the project detail pages, which are the links this page exists to
 * hand out. A stale portfolio index pointing at ten projects while the sitemap
 * lists twelve is a crawl inconsistency for no reason.
 */
export const revalidate = 600;

/**
 * The projects page.
 *
 * Reads the portfolio on the server and hands it to the grid. The grid used to
 * fetch it in the browser, which meant the initial HTML of this page contained
 * six skeleton rectangles and not one link to a project — and those cards are
 * the only in-content links to project pages anywhere on the site. Googlebot
 * renders JavaScript and would have found them eventually; "in the HTML" is
 * still the stronger guarantee, and the skeleton-to-cards swap was a layout
 * shift a visitor paid for as well.
 *
 * A Supabase failure keeps the old behaviour: getProjects reports it rather
 * than throwing, and the grid falls back to fetching for itself.
 */
export default async function ProjectsPage() {
  const { projects, failed } = await projectsForPage();

  const itemList =
    projects.length > 0
      ? {
          "@type": "ItemList",
          "@id": `${siteConfig.url}${PATH}#projects`,
          name: "مشاريع الكيان",
          numberOfItems: projects.length,
          itemListElement: projects.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: project.title,
            url: absoluteUrl(`${PATH}/${encodeURIComponent(projectSlug(project))}`),
          })),
        }
      : null;

  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path: PATH,
            name: "مشاريعنا",
            description: DESCRIPTION,
            type: "CollectionPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, PATH),
          itemList,
        ]}
      />
      {/* Filters, the local "show all" expand and the before/after block — the
          full gallery, which is what someone arriving here came for. */}
      <ProjectsSection
        placement="projects_page"
        headingAs="h1"
        initialProjects={failed ? undefined : projects}
      />
      <DesignsSection />
      <ContactSection variant="cta" source="projects_page" />
    </div>
  );
}
