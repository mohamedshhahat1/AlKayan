import { cn } from "@/lib/utils";

/**
 * An infinite, constant-speed client marquee.
 *
 * Built to sit over media — it carries its own dark scrim and blur so the names
 * stay legible without hiding what is behind them.
 *
 * How the loop is seamless:
 *
 *   The track renders `clients` exactly twice and animates to translate3d(-50%)
 *   (see `client-marquee` in tailwind.config.ts). At the end of the cycle copy 2
 *   sits precisely where copy 1 began, so the last frame is identical to the
 *   first and the restart is invisible. Because the distance is a percentage of
 *   the track's own width, this holds at every viewport size and font size with
 *   nothing measured in JS and no resize handling. The timing is linear and
 *   infinite with no easing anywhere: any easing would slow the strip near the
 *   loop point and show exactly what the duplication is there to hide.
 *
 * Deliberately has no JavaScript — no hooks, no state, no effects, no refs — so
 * it renders in a server component and the animation runs at first paint rather
 * than waiting for hydration. globals.css already disables animation under
 * prefers-reduced-motion, which leaves the track parked at frame 0: a static,
 * fully legible list rather than an empty strip.
 *
 * Not a carousel: no controls, no dots, no snapping, nothing focusable. It is
 * decorative, hence pointer-events-none.
 */
export type ClientMarqueeProps = {
  /** Client names, in display order. Rendered twice; see above. */
  clients: readonly string[];
  /** Small label above the strip. */
  label?: string;
  className?: string;
  /**
   * Seconds per full loop. Defaults to the 46s in tailwind.config.ts.
   *
   * Speed is loop distance over time, and the distance depends on how many
   * names there are and how wide they render, so a longer list needs a longer
   * duration to move at the same pace.
   */
  durationSeconds?: number;
};

export function ClientMarquee({
  clients,
  label = "TRUSTED BY OUR CLIENTS",
  className,
  durationSeconds,
}: ClientMarqueeProps) {
  // An empty list would render a blank scrim band over the video.
  if (clients.length === 0) return null;

  return (
    // dir="ltr": the page is RTL, but these are Latin brand marks and the
    // animation is physical (transforms ignore direction). Pinning the track's
    // direction keeps layout and motion agreeing regardless of the page.
    <div
      dir="ltr"
      className={cn(
        "pointer-events-none relative w-full select-none overflow-hidden pb-4 pt-3 sm:pb-5 sm:pt-4 lg:pb-6 lg:pt-5",
        className
      )}
    >
      {/* Scrim. Transparent at the top so it dissolves into the footage rather
          than starting on a line, opaque enough at the bottom to carry white
          text over whatever frame is playing. The slight blur softens busy
          video detail behind the names without hiding the motion. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[rgba(8,24,48,0.85)] via-[rgba(8,24,48,0.55)] to-transparent backdrop-blur-[3px]"
      />

      <p className="relative mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.4em] text-white/55 sm:text-[10px] sm:tracking-[0.45em]">
        {label}
      </p>

      {/* The mask dissolves both ends, so names leave and arrive instead of
          being sliced off at the viewport edge. Duplicated with the -webkit-
          prefix for Safari, which still needs it for masks. */}
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]">
        <ul
          className="animate-client-marquee flex w-max items-center"
          style={durationSeconds ? { animationDuration: `${durationSeconds}s` } : undefined}
        >
          {[0, 1].map((copy) =>
            clients.map((name) => (
              <li
                key={`${copy}-${name}`}
                // The second pass exists only so the loop can close. Announcing
                // it would read the whole client list twice.
                aria-hidden={copy === 1 || undefined}
                // Spacing is per-item padding rather than a flex gap so the two
                // copies meet with exactly the same gap as every other pair —
                // the seam has to be indistinguishable from any other join.
                className="shrink-0 whitespace-nowrap px-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 sm:px-8 sm:text-[13px] lg:px-10 lg:text-sm"
              >
                {name}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
