/**
 * Single source of truth for the fixed header's height.
 *
 * Both the anchor scrolling in components/smooth-scroll.tsx and the active-link
 * scan in components/site-header.tsx need this number. When they each kept
 * their own copy they drifted apart, which is how a link could scroll to one
 * place and highlight based on another.
 *
 * Measured rather than hardcoded, so it stays correct if the header's padding,
 * font size or contents change at any breakpoint.
 */

/** Breathing room between the header's bottom edge and the section below it. */
export const HEADER_GAP = 12;

/**
 * Fallback matching `[id] { scroll-margin-top: 6rem }` in globals.css, used
 * during SSR and in the unlikely case the header is not in the DOM yet.
 */
const FALLBACK_HEADER_HEIGHT = 96;

export function getHeaderHeight(): number {
  if (typeof document === "undefined") return FALLBACK_HEADER_HEIGHT;

  const header = document.querySelector("header");
  if (!(header instanceof HTMLElement) || header.offsetHeight === 0) {
    return FALLBACK_HEADER_HEIGHT;
  }

  return header.offsetHeight;
}

/**
 * Distance from the top of the viewport at which a section should come to rest,
 * and the line the active-link scan measures against.
 *
 * Note the header is taller before it condenses on scroll (py-5 vs py-3). A
 * click starting from the very top therefore measures the tall state and lands
 * the section a little lower than strictly needed. That errs towards a small
 * extra gap rather than towards the heading hiding under the header, which is
 * the right direction to be wrong in.
 */
export function getScrollOffset(): number {
  return getHeaderHeight() + HEADER_GAP;
}
