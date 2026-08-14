import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getProjectIds, getProject } from "@/lib/projects-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "مشاريع التشطيبات والمقاولات | أعمال الكيان",
  description: "استعرض مشاريع الكيان في تشطيب الشقق والفلل والمكاتب والمشروعات التجارية، مع تفاصيل الموقع والخدمات المنفذة.",
  alternates: { canonical: `${siteConfig.url}/projects` },
  openGraph: { title: "مشاريع الكيان | تشطيبات ومقاولات", description: "نماذج من أعمال الكيان في التشطيبات والتصميم والتنفيذ.", url: `${siteConfig.url}/projects`, type: "website", locale: "ar_EG", siteName: siteConfig.name },
};

export default async function ProjectsPage() {
  const ids = await getProjectIds();
  const projects = (await Promise.all(ids.map(getProject))).filter(Boolean);
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: "مشاريع الكيان", url: `${siteConfig.url}/projects`, description: metadata.description, isPartOf: { "@type": "WebSite", url: siteConfig.url }, mainEntity: { "@type": "ItemList", itemListElement: projects.map((project, index) => ({ "@type": "ListItem", position: index + 1, name: project!.title, url: `${siteConfig.url}/projects/${project!.id}` })) } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-luxury">
          <header className="max-w-4xl">
            <p className="text-sm font-bold tracking-[0.25em] text-gold mb-4">أعمالنا</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground">مشاريع التشطيبات والمقاولات</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-9">نماذج من مشروعات الكيان في التشطيبات والتصميم والتنفيذ، مع صفحة مستقلة لكل مشروع لمزيد من التفاصيل.</p>
          </header>
          {projects.length === 0 ? (
            <p className="mt-12 text-muted-foreground">سيتم إضافة المشاريع قريباً.</p>
          ) : (
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => project && (
                <Link key={project.id} href={`/projects/${project.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-gold/40 transition-colors">
                  <div className="aspect-[16/10] overflow-hidden"><img src={project.hero_image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>
                  <div className="p-5"><p className="text-xs font-bold text-gold">{project.category}</p><h2 className="mt-2 text-xl font-bold text-foreground group-hover:text-gold transition-colors">{project.title}</h2>{project.location && <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" aria-hidden="true" />{project.location}</p>}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
