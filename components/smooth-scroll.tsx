"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/lenis";

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

    // Offset for the fixed header so the target heading is not covered.
    const headerOffset = -96;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: headerOffset });
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
