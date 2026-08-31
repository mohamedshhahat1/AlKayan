import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/about-section";
import { WorkProcessSection } from "@/components/sections/work-process-section";
import { StatsSection } from "@/components/sections/stats-section";
import { ContactSection } from "@/components/sections/contact-section";
import { JsonLd } from "@/components/json-ld";
import { headerOffsetClass } from "@/lib/navigation";
import { breadcrumbJsonLd, pageMetadata, webPageJsonLd } from "@/lib/seo";

const PATH = "/about";

const DESCRIPTION =
  "في الكيان لا نتعامل مع التشطيبات كمرحلة تنفيذ فقط، بل نصنع تجربة متكاملة تبدأ من الفكرة وتنتهي بمساحة تحمل طابعك. تعرف على معايير الجودة وفريق العمل ومراحل التنفيذ.";

/**
 * Copy taken from the about section's own subtitle rather than written for the
 * occasion — the company's description of itself already exists and inventing a
 * second one would put two different claims on the same site.
 */
export const metadata: Metadata = pageMetadata({
  title: "من نحن",
  description: DESCRIPTION,
  path: PATH,
});

const crumbs = [{ name: "من نحن", path: PATH }];

export default function AboutPage() {
  return (
    <div className={headerOffsetClass}>
      <JsonLd
        nodes={[
          webPageJsonLd({
            path: PATH,
            name: "من نحن",
            description: DESCRIPTION,
            // AboutPage rather than the generic WebPage: schema.org has a type
            // for exactly this page and using it costs nothing.
            type: "AboutPage",
            crumbs,
          }),
          breadcrumbJsonLd(crumbs, PATH),
        ]}
      />
      {/* Full variant: the four strengths accordion is the substance of this
          page, and the homepage links here rather than repeating it.

          headingAs="h1": on the homepage this section is one of seven and its
          heading is an h2, but here it opens the page and is its title. */}
      <AboutSection headingAs="h1" />
      <WorkProcessSection />
      <StatsSection />
      <ContactSection variant="cta" source="about_page" />
    </div>
  );
}
