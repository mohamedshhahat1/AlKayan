import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ContactSection } from "@/components/sections/contact-section";
import { headerOffsetClass } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

/**
 * Copy taken from the about section's own subtitle rather than written for the
 * occasion — the company's description of itself already exists and inventing a
 * second one would put two different claims on the same site.
 */
export const metadata: Metadata = pageMetadata({
  title: "من نحن",
  description:
    "في الكيان لا نتعامل مع التشطيبات كمرحلة تنفيذ فقط، بل نصنع تجربة متكاملة تبدأ من الفكرة وتنتهي بمساحة تحمل طابعك. تعرف على معايير الجودة وفريق العمل ومراحل التنفيذ.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className={headerOffsetClass}>
      {/* Full variant: the four strengths accordion is the substance of this
          page, and the homepage links here rather than repeating it. */}
      <AboutSection />
      <WorkProcessSection />
      <StatsSection />
      <ContactSection variant="cta" source="about_page" />
    </div>
  );
}
