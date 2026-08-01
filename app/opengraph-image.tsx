// ImageResponse lives in next/server on Next 13. The next/og entry point was
// only introduced in Next 14 — switch these imports if the project upgrades.
import { ImageResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated social preview card.
 *
 * Deliberately Latin-only: the fonts bundled with Satori do not cover Arabic
 * glyphs, so Arabic text would render as blank boxes. Swap in a Tajawal .ttf
 * via the `fonts` option if an Arabic card is needed.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B1F3A",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(212,175,55,0.22) 0%, transparent 55%)",
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            letterSpacing: 12,
            color: "#D4AF37",
          }}
        >
          {siteConfig.nameEn}
        </div>
        <div style={{ marginTop: 12, fontSize: 34, color: "#E6EDF7" }}>
          Contracting &amp; Luxury Interior Finishing
        </div>
        <div
          style={{
            marginTop: 44,
            width: 220,
            height: 5,
            borderRadius: 999,
            backgroundColor: "#D4AF37",
          }}
        />
        <div style={{ marginTop: 44, fontSize: 26, color: "#93A4BC" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size
  );
}
