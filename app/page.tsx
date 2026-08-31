import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectsGallerySection } from "@/components/sections/projects-gallery-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site-config";
import { webPageJsonLd } from "@/lib/seo";

/**
 * The homepage node.
 *
 * The Organization and WebSite that used to be built here now live in the root
 * layout, so they are present on every route rather than only this one — see
 * lib/seo.ts. What is left is the page itself, pointing at both by @id.
 *
 * No BreadcrumbList: the homepage is the root of every trail, and a trail with
 * one item is not a trail.
 */
const jsonLd = webPageJsonLd({
  path: "/",
  name: siteConfig.title,
  description: siteConfig.description,
});

/**
 * The homepage.
 *
 * Each section shows a cut of itself and hands off to the page that owns the
 * subject: about is compact and links to /about, services shows eight of
 * twenty-six, projects shows the featured ones. The designs gallery and the
 * work-process walkthrough live on /projects and /about rather than being
 * printed in both places.
 *
 * Projects are the circular gallery here, not the grid. ProjectsGallerySection
 * took over the grid's heading, its id="projects" anchor and its link to
 * /projects; the grid still runs /projects itself, with the filters, the
 * before/after block and the per-project cards that belong on a page someone
 * arrived at deliberately.
 *
 * No metadata export: the root layout's title, description and canonical "/"
 * are already exactly right for this route.
 *
 * A server component, and deliberately still one — nothing here needs the
 * browser, so nothing here ships to it.
 */
export default function Home() {
  return (
    <>
      <JsonLd nodes={[jsonLd]} />
      <HeroSection />
      <AboutSection compact />
      <ServicesSection showGroups={false} limit={8} showAllHref="/services" />
      <ProjectsGallerySection />
      <StatsSection />
      <TestimonialsSection />
      <ContactSection variant="cta" source="home_cta" />
    </>
  );
}
