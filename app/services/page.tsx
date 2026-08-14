import type { Metadata } from "next";
import Link from "next/link";
import { servicePages } from "@/lib/seo-data";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "خدمات التشطيبات والمقاولات | الكيان",
  description: "جميع خدمات الكيان في التشطيبات والمقاولات والتصميم الداخلي والخارجي للمنازل والفلل والمكاتب والمشروعات التجارية.",
  alternates: { canonical: `${siteConfig.url}/services` },
};

export default function ServicesPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", name: "خدمات الكيان", url: `${siteConfig.url}/services`, mainEntity: { "@type": "ItemList", itemListElement: servicePages.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.name, url: `${siteConfig.url}/services/${service.slug}` })) } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-luxury">
          <header className="max-w-4xl"><p className="text-sm font-bold tracking-[0.25em] text-gold mb-4">خدماتنا</p><h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground">خدمات التشطيبات والمقاولات</h1><p className="mt-6 text-lg text-muted-foreground leading-9">من التصميم إلى التنفيذ والتسليم، نقدم حلولاً متكاملة للتشطيبات السكنية والتجارية.</p></header>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{servicePages.map((service) => <Link key={service.slug} href={`/services/${service.slug}`} className="group rounded-2xl border border-border bg-card p-7 hover:border-gold/40 transition-colors"><h2 className="text-xl font-bold text-foreground group-hover:text-gold transition-colors">{service.name}</h2><p className="mt-3 text-sm text-muted-foreground leading-7">{service.description}</p><span className="inline-block mt-5 text-sm font-bold text-gold">اعرف المزيد ←</span></Link>)}</div>
        </div>
      </main>
    </>
  );
}
