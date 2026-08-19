import type Lenis from "lenis";

/**
 * Registry for the single Lenis instance created by <SmoothScroll />.
 *
 * Overlays cannot rely on `document.body.style.overflow = "hidden"` to stop
 * background scrolling: Lenis handles wheel events on window and moves the
 * page itself, so it ignores the body's overflow entirely. Anything that opens
 * on top of the page has to tell Lenis to stand down.
 */
let instance: Lenis | null = null;

/**
 * Number of overlays currently holding the lock. A plain boolean would break
 * when two overlays overlap — closing the first would restore scrolling while
 * the second is still open.
 */
let locks = 0;

let previousOverflow = "";

export function registerLenis(next: Lenis | null) {
  instance = next;
  // An overlay may already be open when the instance is (re)created.
  if (instance && locks > 0) instance.stop();
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;

  instance?.stop();
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  document.body.style.overflow = previousOverflow;
  instance?.start();
}

/**
 * Scrolls the page back to the top.
 *
 * This has to go through Lenis when Lenis is running. globals.css sets
 * `.lenis.lenis-smooth { scroll-behavior: auto !important }` — that rule
 * exists so anchor jumps do not fight the easing, but it also means a native
 * `window.scrollTo({ behavior: "smooth" })` is downgraded to an instant jump.
 *
 * The native path is not dead code: <SmoothScroll /> returns early under
 * prefers-reduced-motion and never creates an instance, so that is the branch
 * that runs there. `behavior: "auto"` is deliberate in that case — a user who
 * asked for less motion should not get a long animated scroll.
 */
export function scrollToTop() {
  if (instance) {
    instance.scrollTo(0);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

/**
 * Jumps to the top with no animation, for a route change.
 *
 * Distinct from scrollToTop(), which is the back-to-top button and should be
 * seen. Arriving on a new page part-way down is a bug, not a transition, so
 * this is instant.
 *
 * It also has to be Lenis-aware for a subtler reason than the CSS rule above:
 * Lenis keeps its own idea of the current scroll position, and moving the
 * window behind its back leaves the two disagreeing — the next wheel event then
 * animates from the stale position and the page appears to jump backwards.
 * `immediate` moves both at once.
 */
export function resetScroll() {
  if (instance) {
    instance.scrollTo(0, { immediate: true });
    return;
  }

  window.scrollTo(0, 0);
}
