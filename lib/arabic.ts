/**
 * Arabic number agreement helpers.
 *
 * Arabic does not pluralise by putting a digit in front of a fixed noun the
 * way the template literals in this project were doing. Writing
 *
 *   `لمدة ${years} سنتين`
 *
 * renders "لمدة 2 سنتين" — literally "for a period of 2 two-years" — because
 * سنتين is already the dual form and carries the count itself.
 */

/**
 * Renders a count of years in correct Arabic.
 *
 *   1    → سنة واحدة     (singular)
 *   2    → سنتين         (dual; the numeral is inside the word)
 *   3-10 → 5 سنوات       (plural of paucity)
 *   11+  → 15 سنة        (singular again after 11, as Arabic requires)
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

/**
 * Reduces an Arabic string to a comparable form.
 *
 * Two strings that name the same thing routinely differ in ways that carry no
 * meaning: the alef may be bare or carry a hamza (ا / أ / إ / آ), taa marbuta
 * and haa are typed interchangeably at a word's end (ة / ه), alef maqsura and
 * yaa likewise (ى / ي), and diacritics and tatweel may be present or not.
 * Comparing raw strings therefore misses matches that a reader would call
 * identical.
 */
export function normalizeArabic(value: string): string {
  return value
    .normalize("NFKC")
    // Harakat, superscript alef and tatweel: decoration, never distinction.
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Tokens too common to imply two labels are about the same work. */
const STOPWORDS = new Set(["من", "في", "علي", "الي", "مع", "و", "او", "انظمه"]);

/**
 * Splits an Arabic label into comparable tokens.
 *
 * The definite article is why this exists. The services catalogue says
 * "تشطيب الشقق" while the projects table records "تشطيب شقق" — the same work,
 * written the way each was typed. Something has to make those equal.
 *
 * Each word contributes *both* its normalised form and its form with a leading
 * "ال" removed, rather than only the stripped one. Stripping unconditionally is
 * wrong and quietly loses matches: "ألمنيوم" normalises to "المنيوم", whose
 * first two letters are part of the word, not an article — strip them and it
 * no longer matches "الألمنيوم". Keeping both forms means the article is
 * ignored where it is one and preserved where it is not, with no dictionary.
 *
 * Tokens shorter than three characters are dropped along with the stopwords
 * above: matching on a two-letter fragment finds coincidences, not meaning.
 */
export function arabicTokens(value: string): string[] {
  const tokens = new Set<string>();

  for (const word of normalizeArabic(value).split(/[\s،,\/|-]+/)) {
    for (const form of [word, word.replace(/^ال/, "")]) {
      if (form.length >= 3 && !STOPWORDS.has(form)) tokens.add(form);
    }
  }

  // Array.from, not a spread: this project targets a JS level where spreading
  // a Set needs downlevelIteration, and that is not a flag worth turning on for
  // one line.
  return Array.from(tokens);
}

/**
 * Do two Arabic labels describe overlapping work?
 *
 * True when they share any significant token. Deliberately loose, because it
 * is used to decide whether a project belongs on a *service group* page — a
 * project recording "تشطيب فيلا" belongs under a group whose catalogue says
 * "تشطيب الفلل" even though "فيلا" and "فلل" are different words, and the
 * shared "تشطيب" is what says so.
 */
export function arabicLabelsOverlap(a: string, b: string): boolean {
  const left = new Set(arabicTokens(a));
  if (left.size === 0) return false;

  return arabicTokens(b).some((token) => left.has(token));
}
