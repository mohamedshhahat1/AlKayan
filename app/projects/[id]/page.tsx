import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MapPin, Ruler, Clock } from "lucide-react";
import { getProject, getProjectIds } from "@/lib/projects-server";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  return (await getProjectIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id);
  if (!project) return {};
  const title = `${project.title} | مشاريع الكيان`;
  const description = `تفاصيل مشروع ${project.title}${project.location ? ` في ${project.location}` : ""}: التشطيبات والخدمات المنفذة بواسطة الكيان.`;
  const url = `${siteConfig.url}/projects/${project.id}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "article", locale: "ar_EG", siteName: siteConfig.name, images: [{ url: project.hero_image, alt: project.title }] } };
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();
  const url = `${siteConfig.url}/projects/${project.id}`;
  const description = `تفاصيل مشروع ${project.title}${project.location ? ` في ${project.location}` : ""}: التشطيبات والخدمات المنفذة بواسطة الكيان.`;
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "الرئيسية", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "المشاريع", item: `${siteConfig.url}/projects` }, { "@type": "ListItem", position: 3, name: project.title, item: url }] },
    { "@type": "CreativeWork", "@id": `${url}#project`, name: project.title, description, url, image: [project.hero_image, ...(project.gallery_images ?? [])], locationCreated: project.location ? { "@type": "Place", name: project.location } : undefined, creator: { "@type": "Organization", name: siteConfig.legalName, url: siteConfig.url }, dateCreated: project.execution_date ?? undefined },
  ] };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-24 pb-20 min-h-screen bg-background">
        <div className="container-luxury">
          <nav aria-label="مسار التنقل" className="py-5 text-sm text-muted-foreground"><Link href="/" className="hover:text-gold">الرئيسية</Link><span className="mx-2">/</span><Link href="/projects" className="hover:text-gold">المشاريع</Link><span className="mx-2">/</span>{project.title}</nav>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border"><img src={project.hero_image} alt={project.title} className="w-full aspect-[16/7] object-cover" fetchPriority="high" /></div>
          <header className="mt-10 max-w-4xl"><p className="text-sm font-bold tracking-[0.2em] text-gold">{project.category}</p><h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-foreground">{project.title}</h1>{project.location && <p className="mt-4 flex items-center gap-2 text-muted-foreground"><MapPin className="w-5 h-5 text-gold" aria-hidden="true" />{project.location}</p>}</header>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {project.area_sqm != null && <Info icon={Ruler} label="المساحة" value={`${project.area_sqm} م²`} />}
            {project.duration_days != null && <Info icon={Clock} label="مدة التنفيذ" value={`${project.duration_days} يوم`} />}
            {project.execution_date && <Info icon={Calendar} label="التنفيذ" value={new Intl.DateTimeFormat("ar-EG-u-ca-gregory", { year: "numeric", month: "long" }).format(new Date(project.execution_date))} />}
            <Info icon={MapPin} label="نوع المشروع" value={project.category} />
          </div>
          {project.services_included?.length ? <section className="mt-12"><h2 className="text-2xl font-bold text-foreground">الخدمات المنفذة</h2><div className="mt-5 flex flex-wrap gap-3">{project.services_included.map((item) => <span key={item} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">{item}</span>)}</div></section> : null}
          {project.materials_used?.length ? <section className="mt-10"><h2 className="text-2xl font-bold text-foreground">الخامات المستخدمة</h2><div className="mt-5 flex flex-wrap gap-3">{project.materials_used.map((item) => <span key={item} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">{item}</span>)}</div></section> : null}
          {project.gallery_images?.length ? <section className="mt-12"><h2 className="text-2xl font-bold text-foreground">صور المشروع</h2><div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{project.gallery_images.map((image) => <img key={image} src={image} alt={`${project.title} - صورة من المشروع`} className="w-full aspect-[4/3] object-cover rounded-xl" loading="lazy" />)}</div></section> : null}
          {project.client_testimonial ? <blockquote className="mt-12 rounded-2xl border border-gold/30 bg-card p-7 text-lg text-foreground leading-9">“{project.client_testimonial}”{project.client_name ? <footer className="mt-3 text-sm text-gold font-bold">— {project.client_name}</footer> : null}</blockquote> : null}
          <Link href="/projects" className="mt-12 inline-flex items-center gap-2 text-gold font-bold hover:gap-3 transition-all"><ArrowRight className="w-4 h-4" aria-hidden="true" /> العودة إلى كل المشاريع</Link>
        </div>
      </main>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return <div className="rounded-xl border border-border p-4"><Icon className="w-5 h-5 text-gold" aria-hidden="true" /><p className="mt-2 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold text-foreground">{value}</p></div>;
}
