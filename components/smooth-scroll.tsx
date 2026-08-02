"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/lenis";
import { getScrollOffset } from "@/lib/header-offset";

/** How far off target we tolerate before correcting, in pixels. */
const LANDING_TOLERANCE = 2;

/** Guards against a correction that keeps shifting layout looping forever. */
const MAX_CORRECTIONS = 3;

/**
 * Lenis smooth scrolling.
 *
 * Problems this addresses:
 *  1. the requestAnimationFrame loop was never cancelled, so a second loop was
 *     started on every remount and kept running after unmount;
 *  2. `html { scroll-behavior: smooth }` and Lenis both tried to own the scroll
 *     position, so in-page anchors jumped and then fought the easing. Anchors
 *     are now handed to Lenis explicitly;
 *  3. overlays had no way to stop background scrolling — see lib/lenis.ts;
 *  4. anchor scrolls landed short of their target — see scrollToElement below.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Prevent the browser from restoring the previous scroll position on
    // refresh, and always start from the top of the page.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // If the URL has a hash (e.g. #services), remove it so the page does not
    // jump to that section on reload.
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Let natively scrollable overlays (modals, chat panel) keep their own
      // wheel events instead of forwarding them to the page.
      prevent: (node: Element) => node.hasAttribute("data-lenis-prevent"),
    });

    registerLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /**
     * Scroll an element to just below the fixed header, then verify it.
     *
     * Lenis resolves the destination to a single pixel value at the moment it
     * is called. Over the 1.2s animation, images between here and the target
     * finish decoding and take up their real height, which pushes the target
     * further down the document than it was when that number was captured. The
     * scroll then finishes at a stale position, short of the section, with the
     * previous one still sitting under the header.
     *
     * So the landing is measured again once the animation completes and
     * corrected if it drifted. The retry cap is there because a correction can
     * itself reveal more images and shift things again; in practice it settles
     * on the first pass.
     */
    const scrollToElement = (element: HTMLElement, attempt = 0) => {
      const top = element.getBoundingClientRect().top + window.scrollY - getScrollOffset();

      lenis.scrollTo(Math.max(0, top), {
        // Snappier than the initial 1.2s glide: this is a correction of a few
        // dozen pixels, and easing it at full length reads as a second scroll.
        duration: attempt === 0 ? undefined : 0.4,
        onComplete: () => {
          if (attempt >= MAX_CORRECTIONS) return;

          // Positive means the section sits below where it should; negative
          // means it is hidden behind the header.
          const drift = element.getBoundingClientRect().top - getScrollOffset();
          if (Math.abs(drift) <= LANDING_TOLERANCE) return;

          scrollToElement(element, attempt + 1);
        },
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();
      scrollToElement(target);
      history.replaceState(null, "", hash);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
