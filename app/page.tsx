import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ProjectsGallerySection } from "@/components/sections/projects-gallery-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { ContactSection } from "@/components/sections/contact-section";
import { siteConfig } from "@/lib/site-config";

/** Structured data, built from site config so it cannot drift from the footer. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${siteConfig.url}#organization`,
  name: siteConfig.name,
  alternateName: siteConfig.nameEn,
  legalName: siteConfig.legalName,
  description: siteConfig.description,
  url: siteConfig.url,
  telephone: siteConfig.contact.phoneE164,
  email: siteConfig.contact.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: siteConfig.contact.city,
    addressCountry: siteConfig.contact.countryCode,
  },
  areaServed: {
    "@type": "Country",
    name: "Egypt",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "09:00",
    closes: "21:00",
  },
  sameAs: [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean),
  priceRange: "$$$",
};

/**
 * The homepage.
 *
 * Still the same sections in the same order, but each one now shows a cut of
 * itself and hands off to the page that owns the subject: about is compact and
 * links to /about, services shows eight of twenty-six, projects shows the
 * featured ones. The designs gallery and the work-process walkthrough moved to
 * /projects and /about respectively rather than being printed in both places.
 *
 * The projects grid is followed by the circular gallery — the same featured
 * rows, turned into a scroll-driven 3D ring. It is the one section that is a
 * full viewport tall and pinned, so it reads as a deliberate pause between the
 * portfolio and the numbers, and it links on to /projects like the grid does.
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutSection compact />
      <ServicesSection showGroups={false} limit={8} showAllHref="/services" />
      <ProjectsSection
        featuredOnly
        limit={6}
        showFilters={false}
        showBeforeAfter={false}
        showAllHref="/projects"
        placement="home_featured"
      />
      <ProjectsGallerySection />
      <StatsSection />
      <TestimonialsSection />
      <ContactSection variant="cta" source="home_cta" />
    </>
  );
}
