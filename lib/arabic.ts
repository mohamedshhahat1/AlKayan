/**
 * Arabic number agreement helpers.
 *
 * Arabic does not pluralise by appending a digit to a fixed noun the way the
 * template literals in this project were doing. Writing
 *
 *   `لمدة ${years} سنتين`
 *
 * renders "لمدة 2 سنتين" — literally "for a period of 2 two-years" — because
 * سنتين is already the dual form. The count and the noun have to agree.
 */

/**
 * Renders a count of years in correct Arabic.
 *
 *   1  → سنة واحدة        (singular)
 *   2  → سنتين            (dual — the numeral is carried by the word itself)
 *   3–10 → ٣ سنوات        (plural of paucity)
 *   11+  → ١٥ سنة         (singular after 11, as Arabic requires)
 *
 * Anything outside those shapes (0, negatives, fractions) falls back to the
 * 11+ form, which is the one that reads acceptably with an arbitrary numeral.
 */
export function arabicYears(count: number): string {
  if (count === 1) return "سنة واحدة";
  if (count === 2) return "سنتين";
  if (count >= 3 && count <= 10) return `${count} سنوات`;
  return `${count} سنة`;
}
