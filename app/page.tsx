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

const services = [
  "تشطيب الشقق", "تشطيب الفلل", "تشطيب المكاتب", "تشطيب المحلات", "تشطيب العيادات",
  "المطاعم والكافيهات", "تشطيب الشركات", "التصميم الداخلي", "التصميم الخارجي",
  "تصميم 2D و3D", "تصميم الحدائق والواجهات", "الإضاءة والسباكة والجبس بورد والدهانات والأرضيات",
  "أعمال الرخام والنجارة والألمنيوم", "السمارت هوم والترميم والصيانة",
];

const organizationId = `${siteConfig.url}#organization`;
const websiteId = `${siteConfig.url}#website`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "GeneralContractor",
      "@id": organizationId,
      name: siteConfig.name,
      alternateName: siteConfig.nameEn,
      legalName: siteConfig.legalName,
      description: siteConfig.description,
      url: siteConfig.url,
      telephone: siteConfig.contact.phoneE164,
      email: siteConfig.contact.email,
      image: `${siteConfig.url}/opengraph-image`,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.contact.city,
        addressCountry: siteConfig.contact.countryCode,
      },
      areaServed: { "@type": "Country", name: "Egypt" },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "21:00",
      },
      sameAs: [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "خدمات الكيان للمقاولات والتشطيبات",
        itemListElement: services.map((name) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name,
            provider: { "@id": organizationId },
            areaServed: { "@type": "Country", name: "Egypt" },
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "ar-EG",
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}#webpage`,
      url: siteConfig.url,
      name: siteConfig.title,
      description: siteConfig.description,
      inLanguage: "ar-EG",
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
