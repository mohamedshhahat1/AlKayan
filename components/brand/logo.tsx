import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

/**
 * The brand logo.
 *
 * This is the only module that knows where the logo artwork lives — nothing
 * else should reference /brand/* directly. Two official variants are supplied
 * and each has one job:
 *
 *   mark    The triangle-and-skyline symbol on its own. Used wherever the
 *           available height is under roughly 64px, because the wordmark and
 *           tagline inside the full lockup stop being readable below that.
 *   lockup  Symbol + الكيان wordmark + tagline. Used where there is room to
 *           actually read it: the footer, and any intro treatment.
 *
 * Sizing contract: callers pass height utilities through `className`. The
 * component pins `w-auto`, so the browser derives the width from the
 * artwork's own proportions instead of from the width attribute below. A
 * caller who passes the wrong box therefore cannot stretch the logo, and it
 * never needs cropping to fit. `object-contain` is a second guard for callers
 * that set both dimensions anyway.
 *
 * The declared width/height only reserve layout space to prevent shift; they
 * are not a promise about the file's exact pixel size.
 *
 * No filter, shadow, gradient or glow is applied here, and none should be
 * added by a caller — the artwork ships with its own finish.
 */

const VARIANTS = {
  mark: {
    src: "/brand/al-kayan-mark.png",
    width: 880,
    height: 546,
  },
  lockup: {
    src: "/brand/al-kayan-lockup.png",
    width: 1244,
    height: 1244,
  },
} as const;

export type LogoVariant = keyof typeof VARIANTS;

type LogoProps = {
  variant?: LogoVariant;
  /** Height utilities, e.g. "h-10 sm:h-11". Width is always derived. */
  className?: string;
  /** Set on the header instance only — it is the one above the fold. */
  priority?: boolean;
  /**
   * Use when the company name is already announced next to the logo. An empty
   * alt keeps the image out of the accessibility tree rather than having a
   * screen reader read the same name twice.
   */
  decorative?: boolean;
};

export function Logo({
  variant = "mark",
  className = "h-11",
  priority = false,
  decorative = false,
}: LogoProps) {
  const asset = VARIANTS[variant];

  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={decorative ? "" : siteConfig.legalName}
      priority={priority}
      className={`w-auto object-contain ${className}`}
      draggable={false}
    />
  );
}
