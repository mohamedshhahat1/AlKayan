"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useSiteDetails } from "@/lib/content/context";
import { trackWhatsAppClick } from "@/lib/analytics";

export function WhatsAppButton() {
  const { contact, hours } = useSiteDetails();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={contact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      // Fires before the browser opens WhatsApp, and cannot prevent it: the href
      // is untouched, so a blocked or refused analytics tag still leaves a
      // working link.
      onClick={() => trackWhatsAppClick({ placement: "floating_button" })}
      aria-label={`تواصل معنا عبر واتساب على ${contact.phone}`}
      className={`fixed bottom-6 right-6 z-50 group flex items-center gap-3 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* Order matters. This is a flex row inside a dir="rtl" document, so the
          first child sits on the right. The circle goes first to hold the
          right edge; the tooltip then grows inward, away from the viewport
          edge, instead of towards it.

          Worth noting the tooltip is opacity-0 rather than hidden, so it
          reserves its width even when not hovered. That is what decides where
          the icon rests, not just where the tooltip appears. */}
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300">
        <span className="absolute inset-0 rounded-full pulse-ring bg-[#25D366]" aria-hidden="true" />
        <WhatsAppIcon className="relative w-7 h-7 fill-white" />
      </span>

      <span className="hidden sm:flex flex-col items-start glass rounded-2xl px-4 py-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-bold text-foreground whitespace-nowrap">تحدث معنا على واتساب</span>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{hours.summary}</span>
      </span>
    </a>
  );
}
