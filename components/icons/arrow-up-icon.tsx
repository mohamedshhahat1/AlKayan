type ArrowUpIconProps = {
  className?: string;
  /**
   * Stroke width in viewBox units, not pixels.
   *
   * The viewBox is 24 units wide, so the painted width is this value scaled by
   * (rendered size / 24). At the 28px and 32px sizes used by the back-to-top
   * button the default of 1.8 paints roughly 2.1px and 2.4px.
   *
   * The reference artwork uses a stroke of 4.23% of its viewBox, which would
   * paint about 1.2px at these sizes. That is thinner than the 2-2.5px the
   * brief asked for, so the brief wins here.
   */
  strokeWidth?: number;
};

/**
 * Minimal outline chevron pointing up.
 *
 * Geometry taken from the supplied reference SVG, which is a bare chevron with
 * no vertical stem. Its run and rise measure 21.921 and 21.920 in a 47.255
 * viewBox — 45.0 degrees — spanning 92.8% of the width and 46.4% of the
 * height. Those proportions are reproduced here on a 24-unit viewBox.
 *
 * Not Lucide's ChevronUp: Lucide sets stroke-linecap and stroke-linejoin to
 * round on every icon it ships, which softens the apex. The reference does use
 * round caps, but the brief explicitly asked for none, so this uses butt caps
 * and a miter join.
 *
 * Being vector, it stays crisp at any density.
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
      {/* Equal run and rise of 10.4 on each side = 45 degrees, matching the
          reference exactly. Apex at 6.8 and ends at 17.2 centre the shape on
          the 12 midline, so it reads as centred in the circular button even
          though it now occupies only the middle band of the viewBox. */}
      <path d="M1.6 17.2 L12 6.8 L22.4 17.2" />
    </svg>
  );
}
