import type { Metadata } from "next";
import { ServicesSection } from "@/components/sections/services-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { ContactSection } from "@/components/sections/contact-section";
import { headerOffsetClass } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "خدماتنا",
  description:
    "باقة شاملة من خدمات المقاولات والتشطيبات والتصميم: تشطيب الشقق والفلل والمكاتب والعيادات والمطاعم، التصميم الداخلي والخارجي، والأعمال المتخصصة تحت سقف واحد.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className={headerOffsetClass}>
      {/* Default props: all three category tabs and the whole catalogue. */}
      <ServicesSection />
      <WorkProcessSection />
      <ContactSection variant="cta" source="services_page" />
    </div>
  );
}
