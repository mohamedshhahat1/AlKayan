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
import { getSiteContent } from "@/lib/content/fetch";
import { resolveSiteDetails } from "@/lib/content/site-details";

/**
 * Structured data, built from the same resolved details the footer renders so
 * the two cannot drift.
 *
 * A function rather than a module constant, because the contact details are
 * now editable in Supabase: a constant would be frozen at import time and
 * would keep publishing the build's phone number and address to search
 * engines after an editor changed them.
 */
function buildJsonLd(details: ReturnType<typeof resolveSiteDetails>) {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${siteConfig.url}#organization`,
    name: siteConfig.name,
    alternateName: siteConfig.nameEn,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: details.contact.phoneE164,
    email: details.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: details.contact.city,
      addressCountry: details.contact.countryCode,
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
}

/**
 * Section order is deliberately short: hero, who we are, what we do, proof,
 * process, numbers, voices, and the ask. Anything that repeated another
 * section was merged rather than stacked.
 */
export default async function Home() {
  const content = await getSiteContent();
  const jsonLd = buildJsonLd(resolveSiteDetails(content.settings));

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
