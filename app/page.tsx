import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { DesignsSection } from "@/components/sections/designs-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
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
 * Section order is deliberately short: hero, who we are, what we do, proof,
 * process, numbers, voices, and the ask. Anything that repeated another
 * section was merged rather than stacked.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <DesignsSection />
      <WorkProcessSection />
      <StatsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
