/**
 * The الكيان symbol, drawn rather than loaded.
 *
 * The previous logo module pointed at /brand/al-kayan-mark.png and
 * /brand/al-kayan-lockup.png. The repository has no public/ directory at all,
 * so both were 404s waiting to happen; nothing imported the module, which is
 * the only reason the site did not show a broken image. Header and footer fell
 * back to a 44px monogram tile instead.
 *
 * Inline SVG rather than a raster file, because:
 *
 *   - It is resolution-independent. The mark is asked for at 32px (favicon),
 *     56px (header), 64px (footer) and 200px (Open Graph) — one raster would
 *     be soft at the top of that range and wasteful at the bottom.
 *   - It inherits colour. `tone="current"` paints it in the surrounding text
 *     colour, which is what lets one component serve a gold-on-charcoal header
 *     and a charcoal-on-gold favicon without a second asset.
 *   - It costs no request and cannot go missing.
 *
 * The geometry is the building elevation the brand is named for: a pitched
 * apex over a central spine, three tiers of floor plates widening as they
 * descend, and a full-width plinth. The taper runs downward on purpose — a
 * silhouette that narrows towards its base reads as unstable, and the first
 * draft of this mark did exactly that under a roof spanning the full width,
 * which left it looking like a house behind a small fence.
 *
 * Everything is symmetrical about x=32 and sits on a 64x64 grid, so it stays
 * aligned when the browser snaps strokes to the pixel grid at small sizes.
 */

/** Gold, matching --brand-gold-light / --brand-gold / --brand-gold-deep. */
const GOLD_STOPS = ["#E5C98A", "#C9A15A", "#A77A32"] as const;

/**
 * Fixed id, deliberately not `useId`.
 *
 * A generated id would force this into a client component, and the favicon and
 * Open Graph routes render it on the edge runtime. Repeating an identical
 * <linearGradient> definition across several instances is harmless — SVG
 * resolves the first one and every copy is byte-identical.
 */
const GRADIENT_ID = "al-kayan-gold";

/**
 * Floor tiers as [x, y, width] triples, height carried separately.
 *
 * A table rather than inline JSX because the two detail levels differ only in
 * this list, and because Satori — which renders the favicon and Open Graph
 * routes — cannot handle a JSX fragment. Branching with <>...</> threw
 * "Cannot convert a Symbol value to a string" from inside ImageResponse; a
 * mapped array is a plain child list and goes through fine.
 *
 * Every row is mirrored about x=32 and steps 4 units outward as it descends.
 */
const TIERS = {
  full: { height: 4.5, rows: [
    [20, 32, 6.5], [37.5, 32, 6.5],
    [16, 40, 10.5], [37.5, 40, 10.5],
    [12, 48, 14.5], [37.5, 48, 14.5],
  ] },
  compact: { height: 6.5, rows: [
    [14, 38, 11.5], [38.5, 38, 11.5],
  ] },
} as const;

export type LogoTone = "gold" | "current";

/**
 * How much interior detail to draw.
 *
 * `full` is the mark. `compact` is the same silhouette with one floor tier
 * instead of three and every element thickened, for sizes at which the real
 * tiers stop resolving — below roughly 40px the 4.5-unit bars and the 3.5-unit
 * gaps between them land on the same pixel and the interior fills in as a
 * solid block. The favicon is the case that forced this; it is a reduction of
 * the mark, not a different one.
 */
export type LogoDetail = "full" | "compact";

type LogoMarkProps = {
  /**
   * `gold` paints the brand gradient. `current` inherits the surrounding text
   * colour — use it on a gold fill, where the gradient would vanish.
   */
  tone?: LogoTone;
  detail?: LogoDetail;
  className?: string;
  /**
   * Explicit pixel dimensions. The header and footer size the mark with a
   * Tailwind height utility instead, but the favicon and Open Graph routes
   * render through Satori, which has no stylesheet to resolve a class against
   * and lays out only from concrete values.
   */
  width?: number;
  height?: number;
  /** For the hero, which pins its own colour and lifts the mark off the photo. */
  style?: React.CSSProperties;
};

export function LogoMark({
  tone = "gold",
  detail = "full",
  className,
  width,
  height,
  style,
}: LogoMarkProps) {
  const paint = tone === "gold" ? `url(#${GRADIENT_ID})` : "currentColor";
  const compact = detail === "compact";
  const tiers = TIERS[detail];

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      width={width}
      height={height}
      style={style}
      // Decorative in every current caller: the company name is always
      // announced next to it, either as the lockup's own text or as the
      // link's aria-label.
      aria-hidden="true"
      focusable="false"
    >
      {tone === "gold" && (
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD_STOPS[0]} />
            <stop offset="55%" stopColor={GOLD_STOPS[1]} />
            <stop offset="100%" stopColor={GOLD_STOPS[2]} />
          </linearGradient>
        </defs>
      )}

      {/* The apex. Mitred rather than rounded — the brand's line work is
          architectural, and a rounded join reads as a logo-maker default. Its
          span is set by the widest tier, not by the plinth, so the roof sits
          on the structure instead of hovering over it. */}
      <path
        d="M12 28 L32 8 L52 28"
        stroke={paint}
        strokeWidth={compact ? 6.5 : 5}
        strokeLinejoin="miter"
        strokeMiterlimit={10}
      />

      {/* Central spine, running from under the apex down to the plinth. */}
      <rect
        x={compact ? 27.5 : 29.5}
        y="28"
        width={compact ? 9 : 5}
        height="28"
        fill={paint}
      />

      {/* Floor tiers, split either side of the spine so it stays visible. */}
      {tiers.rows.map(([x, y, width]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={tiers.height} fill={paint} />
      ))}

      {/* Plinth. Unbroken across the spine — it is the one element that reads
          as ground rather than as another storey. */}
      <rect x="8" y="56" width="48" height={compact ? 6 : 4.5} fill={paint} />
    </svg>
  );
}
