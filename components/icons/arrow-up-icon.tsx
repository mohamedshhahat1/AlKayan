type ArrowUpIconProps = {
  className?: string;
  /**
   * Stroke width in viewBox units, not pixels.
   *
   * The viewBox is 24 units wide, so the painted width is this value scaled by
   * (rendered size / 24). At the 28px and 32px sizes used by the back-to-top
   * button the default of 1.8 paints roughly 2.1px and 2.4px.
   */
  strokeWidth?: number;
};

/**
 * Minimal outline up arrow.
 *
 * Deliberately not Lucide's ArrowUp: Lucide sets stroke-linecap and
 * stroke-linejoin to round on every icon it ships, which softens the apex into
 * a curve and rounds off the stem. This uses butt caps and a miter join so the
 * point stays sharp and the ends stay flat.
 *
 * The head is drawn with an equal run and rise (7.2 each), which is a true 45
 * degree angle rather than an approximation.
 *
 * Being vector, it stays crisp at any density; there is no raster asset to go
 * soft on a retina display.
 */
export function ArrowUpIcon({ className, strokeWidth = 1.8 }: ArrowUpIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Stem. Stops exactly at the apex so the join reads as one shape. */}
      <path d="M12 20 L12 4.5" />
      {/* Head. Equal run and rise on both sides = 45 degrees. */}
      <path d="M4.8 11.7 L12 4.5 L19.2 11.7" />
    </svg>
  );
}
