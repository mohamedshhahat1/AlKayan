"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { registerLenis, resetScroll } from "@/lib/lenis";
import { getScrollOffset } from "@/lib/header-offset";

/** How far off target we tolerate before correcting, in pixels. */
const LANDING_TOLERANCE = 2;

/** Guards against a correction that keeps shifting layout looping forever. */
const MAX_CORRECTIONS = 3;

/** Frames the scroll position must hold still before we trust a measurement. */
const STABLE_FRAMES = 4;

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
 *  4. anchor scrolls aligned the wrong edge and landed short — see below.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  /**
   * Route changes start at the top.
   *
   * Next.js does scroll to the top itself on navigation, but it does so by
   * moving the window, which Lenis is not watching — so Lenis keeps the old
   * offset and the first wheel event on the new page animates back down to it.
   * resetScroll() moves both, and is instant because arriving half-way down a
   * page is not a transition anyone asked for.
   *
   * Deliberately does not fire for in-page anchors: those change the hash, not
   * the pathname, so this effect does not run and the click handler below keeps
   * ownership of them.
   */
  useEffect(() => {
    resetScroll();
  }, [pathname]);

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
     * Absolute scroll position that puts the section's *content* just below the
     * header.
     *
     * Every section is `<section id="..." class="py-14 lg:py-20">`, so the
     * anchor is a box with 56-80px of its own top padding. Aligning that box's
     * edge with the header parks the padding under the navbar and leaves the
     * heading floating well down the viewport — which is the whole complaint.
     * Adding the padding back aligns the heading instead.
     *
     * Read per element rather than assumed, so a section with different padding
     * still lands in the same place, and it tracks the py-14 -> lg:py-20
     * breakpoint change for free.
     */
    const getTargetTop = (element: HTMLElement) => {
      const paddingTop = parseFloat(window.getComputedStyle(element).paddingTop) || 0;
      const documentTop = element.getBoundingClientRect().top + window.scrollY;

      return Math.max(0, documentTop + paddingTop - getScrollOffset());
    };

    let settleFrame = 0;

    const cancelSettle = () => {
      if (settleFrame !== 0) {
        cancelAnimationFrame(settleFrame);
        settleFrame = 0;
      }
    };

    /**
     * Scroll to an element, then confirm it actually landed there.
     *
     * Lenis resolves its destination to a pixel value when called. Images above
     * the target finish decoding during the 1.2s animation and take up their
     * real height, moving the target after the number was captured, so the
     * scroll finishes somewhere stale.
     *
     * Rather than trusting a completion callback — which can fire while layout
     * is still moving — this watches until the scroll position holds still for
     * a few frames, then re-measures and nudges if it drifted.
     */
    const scrollToElement = (element: HTMLElement) => {
      cancelSettle();
      lenis.scrollTo(getTargetTop(element));

      let corrections = 0;
      let lastY = Number.NaN;
      let stableFrames = 0;

      const watch = () => {
        const y = window.scrollY;
        stableFrames = Math.abs(y - lastY) < 0.5 ? stableFrames + 1 : 0;
        lastY = y;

        if (stableFrames < STABLE_FRAMES) {
          settleFrame = requestAnimationFrame(watch);
          return;
        }

        const drift = y - getTargetTop(element);
        if (Math.abs(drift) > LANDING_TOLERANCE && corrections < MAX_CORRECTIONS) {
          corrections += 1;
          stableFrames = 0;
          // Short: this is a nudge of a few dozen pixels, and easing it over
          // the full 1.2s reads as a second, separate scroll.
          lenis.scrollTo(getTargetTop(element), { duration: 0.35 });
          settleFrame = requestAnimationFrame(watch);
          return;
        }

        settleFrame = 0;
      };

      settleFrame = requestAnimationFrame(watch);
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

    // If the reader takes over, stop watching immediately. A correction firing
    // after someone has started scrolling would yank the page back.
    window.addEventListener("wheel", cancelSettle, { passive: true });
    window.addEventListener("touchstart", cancelSettle, { passive: true });
    window.addEventListener("keydown", cancelSettle);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("wheel", cancelSettle);
      window.removeEventListener("touchstart", cancelSettle);
      window.removeEventListener("keydown", cancelSettle);
      cancelSettle();
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
