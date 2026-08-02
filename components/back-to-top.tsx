"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/lib/lenis";

/**
 * Floating back-to-top button.
 *
 * Placement: stacked directly above <WhatsAppButton /> in the bottom-right
 * (bottom-6 + a 56px button = 80px, so bottom-24 clears it). The document is
 * dir="rtl", but both existing floating widgets are pinned to physical
 * corners — WhatsApp right, chat left — so this follows the same convention
 * rather than flipping with the writing direction.
 *
 * The 400px threshold matches WhatsAppButton exactly, so the pair fades in
 * together instead of one trailing the other.
 *
 * All motion is CSS transitions; the only JavaScript is a passive scroll
 * listener flipping one boolean.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى الأعلى"
      // The [body:has(#chat-panel)_&] variants hide this while the chat panel
      // is open: that panel is anchored at bottom-24 left-6 and is nearly
      // full-width on a phone, so it would otherwise sit underneath this
      // button. Doing it in CSS keeps the two widgets free of shared state.
      className={`fixed bottom-24 right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full gold-gradient-bg text-navy-deep shadow-lg shadow-black/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background [body:has(#chat-panel)_&]:opacity-0 [body:has(#chat-panel)_&]:pointer-events-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
    </button>
  );
}
