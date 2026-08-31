"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * Sizing a box to the photograph inside it, rather than the photograph to the
 * box.
 *
 * Every image on the site is object-cover, which crops whatever does not fit.
 * That is right for a thumbnail in a uniform grid and wrong everywhere the
 * image *is* the content: a fixed height and a full-width container made a box
 * roughly 3:1, and the 3:2 photographs the projects table actually holds lost
 * half their height to it — a portrait pair lost three quarters.
 *
 * The rows carry no dimensions, so the shape is measured from the browser's own
 * decode and applied as an aspect-ratio. Extracted here because the before/after
 * slider and the project hero need exactly the same rule.
 */

/** Held until an image reports its real shape. Landscape, like most photographs. */
export const DEFAULT_RATIO = 3 / 2;

/**
 * The shape of an <img> that has just loaded, or null if it reported nothing.
 *
 * Guarded because a decode failure fires load with 0x0 in some browsers, and
 * dividing by that would put NaN into the container's aspect-ratio.
 */
function naturalRatio(image: HTMLImageElement): number | null {
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) return null;

  return naturalWidth / naturalHeight;
}

/**
 * The measured shape of an image, and the onLoad that measures it.
 *
 * `sources` is whatever identifies the image being shown — pass the src, or
 * both srcs for a pair. A change resets the ratio, because a new image is
 * usually a new shape and the old one must not be held while it loads. Call
 * sites that remount on change get this for free; the ones that swap props in
 * place do not.
 */
export function useNaturalRatio(...sources: string[]) {
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const key = sources.join("|");

  useEffect(() => {
    setRatio(DEFAULT_RATIO);
  }, [key]);

  return {
    ratio,
    onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => {
      const measured = naturalRatio(event.currentTarget);
      if (measured) setRatio(measured);
    },
  };
}

/**
 * Style for a box that holds `ratio` and is never taller than `--fit-h`.
 *
 * The height variable is a ceiling, not a height: a landscape image fills the
 * width and a portrait one narrows instead of running down the page. Callers
 * set --fit-h per breakpoint on the element's className, which is why it is a
 * custom property and not a prop — a Tailwind arbitrary property varies by
 * breakpoint, an inline style does not.
 */
export function fittedBox(ratio: number, fallbackHeight = "26rem"): CSSProperties {
  return {
    aspectRatio: ratio,
    width: `min(100%, calc(var(--fit-h, ${fallbackHeight}) * ${ratio}))`,
  };
}
