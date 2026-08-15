"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BrandLockup } from "@/components/brand";
import { siteConfig } from "@/lib/site-config";

/**
 * Route error boundary.
 *
 * The app previously had none, so anything that threw while rendering fell
 * through to the framework's default screen — an English stack trace in
 * development and an unbranded "something went wrong" in production, on an
 * otherwise Arabic RTL site.
 *
 * `reset()` re-renders the segment, which is the right first move for a
 * transient failure. The phone number is offered underneath because this is a
 * lead-generation site: if the page cannot recover, the visitor should still
 * be one tap from the business.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is the only handle on the server-side stack in production,
    // so log it rather than the message alone.
    console.error("[app] unhandled error", error.digest ?? "", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <BrandLockup label="" aria-hidden="true" />

      <div>
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">حدث خطأ غير متوقع</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          تعذر عرض هذا الجزء من الصفحة. يمكنك المحاولة مرة أخرى، أو التواصل معنا مباشرة.
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-full gold-gradient-bg px-7 py-3 text-sm font-bold text-navy-deep transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          إعادة المحاولة
        </button>

        <a
          href={siteConfig.contact.telHref}
          className="glass-light rounded-full border border-border px-7 py-3 text-sm font-bold text-foreground transition-all duration-300 hover:border-gold/30 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          اتصل بنا
        </a>
      </div>
    </div>
  );
}
