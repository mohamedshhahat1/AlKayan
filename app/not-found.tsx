import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { navLinks } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة",
  // A 404 has nothing worth indexing and should not dilute the pages that do.
  // `robots` here overrides the index/follow set in the root layout.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * When the site was one page, the only useful move was to send people back to
 * the top of it. Now there are five routes and a project URL per project, so a
 * 404 is usually a stale project link or a mistyped path — and the useful move
 * is to show where the content actually lives.
 *
 * next/link rather than an anchor: a full document reload to recover from a
 * typo throws away the loaded app for no reason.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      {/* Decorative: the heading below carries the message. */}
      <BrandLockup label="" />

      <p className="text-6xl font-extrabold gold-gradient-text" aria-hidden="true">
        404
      </p>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">الصفحة غير موجودة</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          الرابط الذي اتبعته قد يكون قديماً أو غير صحيح.
        </p>
      </div>

      <Link
        href="/"
        className="rounded-full gold-gradient-bg px-7 py-3 text-sm font-bold text-navy-deep transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        العودة إلى الصفحة الرئيسية
      </Link>

      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {navLinks
          .filter((link) => link.href !== "/")
          .map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              >
                {link.label}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
