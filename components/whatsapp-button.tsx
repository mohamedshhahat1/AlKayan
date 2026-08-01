"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { siteConfig } from "@/lib/site-config";

/**
 * Floating WhatsApp call-to-action.
 *
 * Note: the previous version displayed a "متصل الآن" (online now) badge that was
 * always shown regardless of the time of day or whether anyone was available.
 * It now shows the actual working hours instead.
 */
export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={siteConfig.contact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`تواصل معنا عبر واتساب على ${siteConfig.contact.phone}`}
      className={`fixed bottom-6 right-6 z-50 group flex items-center gap-3 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <span className="hidden sm:flex flex-col items-end glass rounded-2xl px-4 py-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-bold text-white whitespace-nowrap">تحدث معنا على واتساب</span>
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{siteConfig.hours.summary}</span>
      </span>

      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 rounded-full pulse-ring bg-[#25D366]" aria-hidden="true" />
        <WhatsAppIcon className="relative w-7 h-7 fill-white" />
      </span>
    </a>
  );
}
