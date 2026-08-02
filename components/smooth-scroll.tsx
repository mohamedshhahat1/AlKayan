"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/lenis";
import { getScrollOffset } from "@/lib/header-offset";

/**
 * Lenis smooth scrolling.
 *
 * Problems this addresses:
 *  1. the requestAnimationFrame loop was never cancelled, so a second loop was
 *     started on every remount and kept running after unmount;
 *  2. `html { scroll-behavior: smooth }` and Lenis both tried to own the scroll
 *     position, so in-page anchors jumped and then fought the easing. Anchors
 *     are now handed to Lenis explicitly;
 *  3. overlays had no way to stop background scrolling — see lib/lenis.ts.
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

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();

      // Resolved to an absolute document position here rather than handed to
      // Lenis as element + offset. getBoundingClientRect is viewport-relative,
      // so adding the current scroll position converts it to a document
      // coordinate; subtracting the measured header height is what leaves the
      // section sitting just below the bar instead of underneath it.
      const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

      lenis.scrollTo(Math.max(0, top));
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
