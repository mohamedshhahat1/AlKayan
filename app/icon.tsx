// ImageResponse lives in next/server on Next 13. The next/og entry point was
// only introduced in Next 14 — switch these imports if the project upgrades.
import { ImageResponse } from "next/server";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon, on the official palette.
 *
 * Still generated from text rather than the logo artwork: the symbol's
 * interior detail — the skyline rows inside the triangle — collapses into
 * mud at 32px, so a faithful reproduction at this size is not achievable.
 * Replace this route with a hand-trimmed app/icon.png once one exists;
 * a static file wins over anything generated here.
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
          fontSize: 18,
          fontWeight: 800,
          color: "#111111",
          background: "linear-gradient(135deg, #E5C98A, #C9A15A 55%, #A77A32)",
          borderRadius: 7,
        }}
      >
        AK
      </div>
    ),
    size
  );
}
