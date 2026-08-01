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
