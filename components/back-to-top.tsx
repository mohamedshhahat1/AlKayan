"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/lib/lenis";

/**
 * Floating back-to-top button.
 *
 * Placement: centred along the bottom edge, in the gap between <ChatWidget />
 * (bottom-6 left-6) and <WhatsAppButton /> (bottom-6 right-6). At the narrowest
 * supported width those two occupy 24-80px and the last 80px respectively,
 * which still leaves room for a 48px button on centre.
 *
 * Sitting at bottom-6 also keeps it clear of the chat panel, which opens at
 * bottom-24 and is nearly full-width on a phone — this button tops out at
 * 72px, so the two can be on screen together.
 *
 * The 400px threshold matches WhatsAppButton exactly, so the pair fades in
 * together instead of one trailing the other.
 *
 * All motion is CSS transitions; the only JavaScript is a passive scroll
 * listener flipping one boolean. -translate-x-1/2 composes with the
 * translate-y utilities below because Tailwind writes both into a single
 * transform through separate custom properties.
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full gold-gradient-bg text-navy-deep shadow-lg shadow-black/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
    </button>
  );
}
