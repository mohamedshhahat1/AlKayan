"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  isAnalyticsConfigured,
  readConsent,
  setConsent,
  subscribeConsent,
} from "@/lib/analytics";

/**
 * Analytics consent.
 *
 * The project had no consent mechanism, so this is the smallest honest one:
 * ask once, remember the answer, and let it be changed later from the footer.
 * Nothing is loaded or sent before it is answered — see components/analytics.tsx.
 *
 * Extending it to per-vendor toggles later means turning the single stored
 * value in lib/analytics.ts into a record; every call site already goes through
 * hasAnalyticsConsent(), so none of them would need to change.
 *
 * Not rendered at all when neither GA4 nor Clarity is configured: there is
 * nothing to consent to, and a banner asking anyway is worse than no banner.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnalyticsConfigured) return;

    setVisible(readConsent() === "unset");

    return subscribeConsent((state) => setVisible(state === "unset"));
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="إعدادات التحليلات"
      // bottom-24 rather than bottom-6: the WhatsApp button and the chat button
      // already hold both bottom corners.
      className="fixed bottom-24 left-1/2 z-[55] w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2"
    >
      <div className="glass rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="hidden sm:flex w-9 h-9 rounded-lg glass-gold items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-gold" aria-hidden="true" />
        </span>

        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
          نستخدم أدوات تحليل لفهم كيفية استخدام الموقع وتحسينه. لا نرسل أي بيانات
          شخصية، والموقع يعمل بشكل كامل إذا اخترت الرفض.
        </p>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="px-4 py-2 rounded-full glass-light border border-border text-xs font-bold text-foreground hover:text-gold hover:border-gold/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            رفض
          </button>

          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="px-5 py-2 rounded-full gold-gradient-bg text-navy-deep text-xs font-bold hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            موافق
          </button>
        </div>
      </div>
    </div>
  );
}
