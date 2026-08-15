"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * The official brand assets, and the only place they are rendered.
 *
 * Before this file the header and the footer each carried their own copy of a
 * gold monogram tile plus a two-line text lockup — identical markup, two
 * places to edit, and neither of them the real logo.
 *
 * Rules encoded here:
 *
 *  - The SVGs are used exactly as supplied. They are referenced by URL and
 *    never inlined, recoloured, or redrawn, so nothing in this codebase can
 *    alter the brand's visual identity.
 *  - Size is set with a height class and `width: auto`. Whatever aspect ratio
 *    the files happen to have is preserved at every breakpoint, which matters
 *    because the components must not assume dimensions they cannot verify.
 *  - Paths come from `siteConfig.branding`, never from a literal at the call
 *    site.
 *
 * Asset weight — OUTSTANDING
 * --------------------------
 * The supplied files are large: logo.svg is 839 KB and company_name.svg is
 * 889 KB. A vector mark is normally 2-20 KB, so ~1.7 MB across the pair points
 * to embedded raster data rather than paths, and both load in the header above
 * the fold.
 *
 * Nothing here modifies them — that is not this file's call to make. What it
 * does do is refuse to make the situation worse:
 *
 *  - `decoding="async"` keeps a large decode off the critical path.
 *  - `max-w-full` plus `object-contain` means an unexpected intrinsic ratio
 *    letterboxes rather than pushing the header wider than the viewport. The
 *    real dimensions could not be measured, so they are not assumed.
 *
 * See docs/BRAND-ASSETS.md for what should happen before launch.
 *
 * Fallback
 * --------
 * Each component falls back to the design that shipped before the assets
 * existed if its file cannot be loaded. This is deliberate: a missing asset
 * then costs the brand mark, not the whole header, and the site never shows a
 * browser's broken-image glyph. It is a degradation path, not a second logo
 * implementation — the fallback is unreachable whenever the SVG resolves.
 */

/**
 * `on-dark` pins the fallback text to light greys.
 *
 * The footer paints navy in both themes, so `text-muted-foreground` there
 * resolves to a dark grey in light mode and all but disappears.
 */
type Tone = "auto" | "on-dark";

type BrandAssetProps = {
  /**
   * Applied to the image and to the fallback alike — put visibility and
   * layout classes here.
   */
  className?: string;
  /**
   * Alt text. Pass "" when an ancestor already names the company (a link with
   * an aria-label, say); a screen reader announcing "الكيان" three times in a
   * row is worse than not announcing it at all.
   */
  alt?: string;
};

export function BrandLogo({ className, alt = siteConfig.branding.logoAlt }: BrandAssetProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : "true"}
        className={cn(
          "inline-flex aspect-square items-center justify-center rounded-xl gold-gradient-bg text-navy-deep font-extrabold text-lg",
          className
        )}
      >
        <span aria-hidden="true">{siteConfig.monogram}</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- an SVG of unknown
    // intrinsic size; next/image would need width/height we cannot assume and
    // would not optimise an SVG anyway.
    <img
      src={siteConfig.branding.logo}
      alt={alt}
      onError={() => setFailed(true)}
      draggable={false}
      decoding="async"
      className={cn("w-auto max-w-full select-none object-contain", className)}
    />
  );
}

type BrandWordmarkProps = BrandAssetProps & {
  /** Height class for the image only; the text fallback sets its own. */
  imgClassName?: string;
  tone?: Tone;
};

export function BrandWordmark({
  className,
  imgClassName = "h-6",
  tone = "auto",
  alt = siteConfig.branding.companyNameAlt,
}: BrandWordmarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : "true"}
        className={cn("leading-tight", className)}
      >
        {/* Both children are block-level so the stack survives whether the
            wrapper ends up display:block or display:flex. */}
        <span aria-hidden="true" className="block text-lg font-extrabold gold-gradient-text">
          {siteConfig.name}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "block text-[10px] tracking-[0.25em]",
            tone === "on-dark" ? "text-gray-400" : "text-muted-foreground"
          )}
        >
          {siteConfig.nameEn}
        </span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- see BrandLogo.
    <img
      src={siteConfig.branding.companyName}
      alt={alt}
      onError={() => setFailed(true)}
      draggable={false}
      decoding="async"
      className={cn("w-auto max-w-full select-none object-contain", imgClassName, className)}
    />
  );
}

/**
 * Mark plus wordmark at the default proportions.
 *
 * Used by the surfaces that just want "the logo" — the loading screen, the
 * error boundaries, the 404. The header and footer compose the two pieces
 * directly because they need per-breakpoint control the lockup should not try
 * to express.
 */
export function BrandLockup({
  className,
  tone = "auto",
  label = siteConfig.name,
}: {
  className?: string;
  tone?: Tone;
  /**
   * Announced once for the pair, not once per asset.
   *
   * Pass "" to make the whole lockup decorative, for screens where an adjacent
   * heading or status message already names the company. Mirrors `alt=""` on
   * the two components above.
   */
  label?: string;
}) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <BrandLogo alt="" className="h-11 shrink-0" />
      <BrandWordmark alt="" imgClassName="h-6" tone={tone} />
    </span>
  );
}
