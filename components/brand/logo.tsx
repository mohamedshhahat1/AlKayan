import { LogoMark, type LogoTone } from "@/components/brand/logo-mark";
import { siteConfig } from "@/lib/site-config";

/**
 * The brand logo.
 *
 * This is the only module that knows what the logo looks like — nothing else
 * should draw a monogram tile or reach for an image path. Two variants, each
 * with one job:
 *
 *   mark    The symbol on its own. Use where there is no room to read a
 *           wordmark, or where the company name is already announced beside it.
 *   lockup  Symbol + الكيان wordmark + descriptor. Use in the header, the
 *           footer, and any intro treatment.
 *
 * The wordmark is real text in Cairo, not part of the artwork. That keeps it
 * selectable, translatable and searchable, lets it hint against the pixel grid
 * at small sizes the way an outlined path never can, and means the display face
 * already loaded for the headings is reused rather than a second copy of the
 * same glyphs being shipped as vectors.
 *
 * Sizing contract: callers pass a height utility through `className` and the
 * symbol scales from it. A caller therefore cannot stretch the logo, and the
 * wordmark's own scale is set by `size` rather than being derived from a box.
 */

const SIZES = {
  /** Footer, mobile header. */
  sm: { mark: "h-10 w-10", name: "text-lg", descriptor: "text-[9px]" },
  /** Desktop header. */
  md: { mark: "h-12 w-12 sm:h-14 sm:w-14", name: "text-xl sm:text-2xl", descriptor: "text-[10px] sm:text-[11px]" },
  /** Intro treatments, Open Graph. */
  lg: { mark: "h-20 w-20", name: "text-4xl", descriptor: "text-sm" },
} as const;

export type LogoSize = keyof typeof SIZES;
export type LogoVariant = "mark" | "lockup";

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  tone?: LogoTone;
  className?: string;
  /**
   * Colour for the descriptor line. A separate prop rather than something the
   * caller folds into `className`, because two colour utilities on one element
   * are resolved by their order in the compiled stylesheet, not by their order
   * in the string — so a caller's override would win or lose unpredictably.
   * The header needs this: the descriptor sits on the hero photograph before
   * the header acquires its surface, and muted ink is unreadable there.
   */
  descriptorClassName?: string;
};

export function Logo({
  variant = "lockup",
  size = "md",
  tone = "gold",
  className = "",
  descriptorClassName = "text-ink-muted",
}: LogoProps) {
  const scale = SIZES[size];

  if (variant === "mark") {
    return <LogoMark tone={tone} className={`${scale.mark} ${className}`} />;
  }

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark tone={tone} className={`${scale.mark} flex-shrink-0`} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display font-extrabold ${scale.name} ${
            // The gradient text treatment only reads on a dark surface. On a
            // gold fill the caller passes tone="current" and the wordmark
            // follows the surrounding ink instead.
            tone === "gold" ? "gold-gradient-text" : "text-current"
          }`}
        >
          {siteConfig.name}
        </span>
        {/* The descriptor from the logo lockup itself. No letter-spacing:
            tracking breaks the cursive joins in Arabic, so للتشطيبات would
            render as disconnected letterforms. */}
        <span className={`${scale.descriptor} mt-1.5 font-medium ${descriptorClassName}`}>
          {siteConfig.descriptor}
        </span>
      </span>
    </span>
  );
}
