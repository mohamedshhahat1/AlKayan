import Link from "next/link";
import { locationPages, servicePages } from "@/lib/seo-data";

export function SeoLinks() {
  return (
    <section aria-labelledby="seo-links-title" className="py-16 border-t border-border bg-background">
      <div className="container-luxury">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-bold tracking-[0.25em] text-gold mb-3">خدمات ومناطق العمل</p>
          <h2 id="seo-links-title" className="text-3xl sm:text-4xl font-extrabold text-foreground">
            تشطيبات ومقاولات حسب احتياجك وموقعك
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            استكشف صفحات خدماتنا لمعرفة نطاق التنفيذ، أو اختر منطقة العمل للاطلاع على الخدمات التي نقدمها بالقرب منك.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">خدمات الكيان</h3>
            <ul className="grid sm:grid-cols-2 gap-2" aria-label="صفحات الخدمات">
              {servicePages.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="block rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">مناطق العمل</h3>
            <ul className="grid sm:grid-cols-2 gap-2" aria-label="صفحات المناطق">
              {locationPages.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="block rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    شركة تشطيبات في {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
