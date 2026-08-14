import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { servicePages } from "@/lib/seo-data";
import { siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = servicePages.find((item) => item.slug === params.slug);
  if (!service) return {};
  const url = `${siteConfig.url}/services/${service.slug}`;
  return {
    title: service.title,
    description: service.description,
    keywords: [service.name, "تشطيبات", "مقاولات", "القاهرة", "مصر"],
    alternates: { canonical: url },
    openGraph: { title: service.title, description: service.description, url, type: "article", locale: "ar_EG", siteName: siteConfig.name },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = servicePages.find((item) => item.slug === params.slug);
  if (!service) notFound();
  const url = `${siteConfig.url}/services/${service.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "الخدمات", item: `${siteConfig.url}/services/${service.slug}` },
        { "@type": "ListItem", position: 3, name: service.name, item: url },
      ]},
      { "@type": "Service", "@id": `${url}#service`, name: service.name, description: service.description, url, provider: { "@type": "GeneralContractor", name: siteConfig.legalName, url: siteConfig.url }, areaServed: { "@type": "City", name: "Cairo" }, serviceType: service.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-luxury">
          <nav aria-label="مسار التنقل" className="text-sm text-muted-foreground mb-10">
            <Link href="/" className="hover:text-gold">الرئيسية</Link><span className="mx-2">/</span>
            <Link href="/#services" className="hover:text-gold">الخدمات</Link><span className="mx-2">/</span>{service.name}
          </nav>

          <header className="max-w-4xl">
            <p className="text-sm font-bold tracking-[0.25em] text-gold mb-4">خدمات الكيان</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">{service.name}</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-9 max-w-3xl">{service.intro}</p>
          </header>

          <section className="mt-12 grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
            <div className="rounded-2xl border border-border p-7 lg:p-10">
              <h2 className="text-2xl font-bold text-foreground">ماذا نقدم؟</h2>
              <ul className="mt-6 grid sm:grid-cols-2 gap-4">
                {service.benefits.map((benefit) => <li key={benefit} className="flex gap-3 items-start text-muted-foreground leading-7"><CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-1" aria-hidden="true" />{benefit}</li>)}
              </ul>
            </div>
            <aside className="rounded-2xl border border-gold/30 bg-card p-7">
              <MapPin className="w-7 h-7 text-gold" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-bold text-foreground">نطاق العمل</h2>
              <p className="mt-3 text-muted-foreground leading-7">القاهرة والقاهرة الجديدة، مع إمكانية دراسة المشروعات في مناطق أخرى حسب نطاق المشروع.</p>
              <a href={siteConfig.contact.whatsappHref} className="mt-6 inline-flex items-center justify-center w-full rounded-full gold-gradient-bg text-navy-deep font-bold px-5 py-3">اطلب معاينة للمشروع</a>
            </aside>
          </section>

          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground">خدمات أخرى</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {servicePages.filter((item) => item.slug !== service.slug).map((item) => <Link key={item.slug} href={`/services/${item.slug}`} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-gold/50 hover:text-gold transition-colors">{item.name}</Link>)}
            </div>
          </section>

          <div className="mt-12"><Link href="/projects" className="inline-flex items-center gap-2 text-gold font-bold hover:gap-3 transition-all">شاهد مشاريعنا <ArrowLeft className="w-4 h-4" aria-hidden="true" /></Link></div>
        </div>
      </main>
    </>
  );
}
