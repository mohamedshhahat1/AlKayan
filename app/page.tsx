import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { BeforeAfterSection } from "@/components/sections/before-after-section";
import { DesignsSection } from "@/components/sections/designs-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { PartnersSection } from "@/components/sections/partners-section";
import { FaqSection } from "@/components/sections/faq-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GeneralContractor",
            name: "الكيان",
            alternateName: "AL-KAYAN",
            description:
              "شركة رائدة في مجال المقاولات والتشطيبات الداخلية والتصميم الداخلي والخارجي",
            telephone: "+966501234567",
            email: "info@al-kayan.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "الرياض",
              addressCountry: "SA",
            },
            areaServed: "SA",
            priceRange: "$$$",
          }),
        }}
      />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <ProjectsSection />
      <BeforeAfterSection />
      <DesignsSection />
      <WorkProcessSection />
      <StatsSection />
      <TestimonialsSection />
      <PartnersSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
