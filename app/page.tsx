import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
