// ImageResponse lives in next/server on Next 13. The next/og entry point was
// only introduced in Next 14 — switch these imports if the project upgrades.
import { ImageResponse } from "next/server";
import { LogoMark } from "@/components/brand/logo-mark";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon: the real mark, on the official palette.
 *
 * This used to render the letters "AK", with a comment explaining that the
 * logo's interior detail collapsed at 32px so a faithful reproduction was not
 * achievable. That was true of the raster artwork it was describing. The mark
 * is now drawn as vectors on a 64-unit grid whose smallest feature is a 4.5
 * unit bar — a little over 2px here — so it survives the reduction, and the
 * favicon no longer disagrees with the header about what the brand looks like.
 *
 * `tone="current"` rather than the gradient: at this size a three-stop ramp
 * across 32px is indistinguishable from a flat fill, and flat charcoal on gold
 * is the higher-contrast pair. `detail="compact"` because the full mark's
 * three tiers do fill in to a solid block down here — the reduction keeps one
 * tier and thickens everything, so the silhouette still reads as the same
 * building.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#171717",
          background: "linear-gradient(135deg, #E5C98A, #C9A15A 55%, #A77A32)",
          borderRadius: 7,
        }}
      >
        <LogoMark tone="current" detail="compact" width={26} height={26} />
      </div>
    ),
    size
  );
}
