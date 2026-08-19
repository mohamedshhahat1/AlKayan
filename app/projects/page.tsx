import type { Metadata } from "next";
import { ProjectsSection } from "@/components/sections/projects-section";
import { DesignsSection } from "@/components/sections/designs-section";
import { ContactSection } from "@/components/sections/contact-section";
import { headerOffsetClass } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "مشاريعنا",
  description:
    "معرض أعمالنا الفاخرة: مشاريع تشطيب وتصميم نفذناها بأعلى معايير الجودة — شقق وفلل ومكاتب وعيادات، مع صور قبل وبعد وتفاصيل كل مشروع.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className={headerOffsetClass}>
      {/* Filters, the local "show all" expand and the before/after block — the
          full gallery, which is what someone arriving here came for. */}
      <ProjectsSection placement="projects_page" />
      <DesignsSection />
      <ContactSection variant="cta" source="projects_page" />
    </div>
  );
}
