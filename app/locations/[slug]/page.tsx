import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { locationPages, servicePages } from "@/lib/seo-data";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return locationPages.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const location = locationPages.find((item) => item.slug === params.slug);
  if (!location) return {};
  const url = `${siteConfig.url}/locations/${location.slug}`;
  return { title: location.title, description: location.description, keywords: [`شركة تشطيبات ${location.name}`, `مقاولات ${location.name}`, `تشطيب فلل ${location.name}`, `تشطيب شقق ${location.name}`], alternates: { canonical: url }, openGraph: { title: location.title, description: location.description, url, type: "article", locale: "ar_EG", siteName: siteConfig.name } };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const location = locationPages.find((item) => item.slug === params.slug);
  if (!location) notFound();
  const url = `${siteConfig.url}/locations/${location.slug}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "Service", "@id": `${url}#service`, name: `تشطيبات ومقاولات في ${location.name}`, description: location.description, url, provider: { "@type": "GeneralContractor", name: siteConfig.legalName, url: siteConfig.url }, areaServed: [{ "@type": "City", name: location.name }, ...location.areas.map((name) => ({ "@type": "Place", name }))], serviceType: "تشطيبات ومقاولات" };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-luxury">
          <nav aria-label="مسار التنقل" className="text-sm text-muted-foreground mb-10"><Link href="/" className="hover:text-gold">الرئيسية</Link><span className="mx-2">/</span>مناطق العمل<span className="mx-2">/</span>{location.name}</nav>
          <header className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-gold text-sm font-bold mb-4"><MapPin className="w-4 h-4" aria-hidden="true" />{location.name}</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">شركة تشطيبات ومقاولات في {location.name}</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-9">{location.description}</p>
          </header>
          <section className="mt-12 rounded-2xl border border-border p-7 lg:p-10"><h2 className="text-2xl font-bold text-foreground">خدماتنا في {location.name}</h2><p className="mt-3 text-muted-foreground leading-8">نوفر حلول التشطيبات والتصميم والتنفيذ للمنازل والفلل والمكاتب والمشروعات التجارية، مع متابعة مراحل المشروع من البداية حتى التسليم.</p><div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{servicePages.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="rounded-xl border border-border px-5 py-4 font-semibold text-foreground hover:border-gold/50 hover:text-gold transition-colors">{service.name}</Link>)}</div></section>
          <section className="mt-12"><h2 className="text-2xl font-bold text-foreground">المناطق القريبة التي نخدمها</h2><div className="mt-5 flex flex-wrap gap-3">{location.areas.map((area) => <span key={area} className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground">{area}</span>)}</div></section>
          <section className="mt-12 rounded-2xl border border-gold/30 bg-card p-7 lg:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"><div><h2 className="text-2xl font-bold text-foreground">هل لديك مشروع في {location.name}؟</h2><p className="mt-2 text-muted-foreground">تواصل معنا لمناقشة المساحة، النطاق والميزانية المبدئية.</p></div><a href={siteConfig.contact.whatsappHref} className="shrink-0 inline-flex items-center justify-center rounded-full gold-gradient-bg text-navy-deep font-bold px-7 py-3">تواصل عبر واتساب</a></section>
        </div>
      </main>
    </>
  );
}
