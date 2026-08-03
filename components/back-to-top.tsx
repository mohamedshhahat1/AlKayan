"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon";
import { scrollToTop } from "@/lib/lenis";

/**
 * Floating back-to-top control.
 *
 * There is no button surface — just the gold chevron drifting on its own. The
 * 48/56px box is kept even though nothing is painted there, because it is the
 * touch target; without it the tappable area would shrink to the glyph, which
 * is well under the 44px minimum. rounded-full survives for the same kind of
 * reason: it only shapes the focus-visible ring now.
 *
 * Placement: centred along the bottom edge, in the gap between <ChatWidget />
 * (bottom-6 left-6) and <WhatsAppButton /> (bottom-6 right-6).
 *
 * The 400px threshold matches WhatsAppButton exactly, so the pair fades in
 * together instead of one trailing the other.
 *
 * All motion is CSS; the only JavaScript is a passive scroll listener flipping
 * one boolean.
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
      className={`group fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-gold flex items-center justify-center transition-all duration-[250ms] ease-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* Two nested elements because both effects animate translateY, and a
          running animation always beats a transition on the same property. If
          the drift and the hover lift shared one node, hovering would appear
          to do nothing. The wrapper drifts; the glyph lifts. */}
      <span className="animate-float-subtle flex items-center justify-center">
        {/* drop-shadow, not shadow-*: a box-shadow would trace the element's
            box and leave a blurred disc behind a now-transparent button. As a
            filter, this follows the rendered stroke instead. */}
        <ArrowUpIcon className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-[250ms] ease-out group-hover:-translate-y-[3px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]" />
      </span>
    </button>
  );
}
