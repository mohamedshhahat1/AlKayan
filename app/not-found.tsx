import type { Metadata } from "next";
import { BrandLockup } from "@/components/brand";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  // A 404 has nothing worth indexing and should not dilute the one page that
  // does. `robots` here overrides the index/follow set in the root layout.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * The site is a single page, so almost every 404 is a stale link or a typo.
 * The useful move is therefore to send people back to the top of the page
 * rather than to offer a sitemap of somewhere they were never trying to go.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandLockup label="" aria-hidden="true" />

      <p className="text-6xl font-extrabold gold-gradient-text" aria-hidden="true">
        404
      </p>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">الصفحة غير موجودة</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          الرابط الذي اتبعته قد يكون قديماً أو غير صحيح.
        </p>
      </div>

      <a
        href="/"
        className="rounded-full gold-gradient-bg px-7 py-3 text-sm font-bold text-navy-deep transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        العودة إلى الصفحة الرئيسية
      </a>
    </div>
  );
}
