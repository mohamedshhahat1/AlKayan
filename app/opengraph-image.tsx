// ImageResponse lives in next/server on Next 13. The next/og entry point was
// only introduced in Next 14 — switch these imports if the project upgrades.
import { ImageResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";
import { LogoMark } from "@/components/brand/logo-mark";

export const runtime = "edge";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated social preview card, on the official palette.
 *
 * Deliberately Latin-only: the fonts bundled with Satori do not cover Arabic
 * glyphs, so Arabic text would render as blank boxes. Swap in a Tajawal .ttf
 * via the `fonts` option if an Arabic card is needed.
 *
 * The card now carries the real mark. No file to fetch and decode: the mark is
 * a component, so Satori lays out its vectors directly.
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
          backgroundColor: "#111111",
          // The mark is painted with currentColor; flat gold reads better than
          // the gradient at this scale and avoids relying on Satori's <defs>
          // support.
          color: "#C9A15A",
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(201,161,90,0.22) 0%, transparent 55%)",
        }}
      >
        <LogoMark tone="current" width={150} height={150} />

        <div
          style={{
            marginTop: 30,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: 12,
            color: "#C9A15A",
          }}
        >
          {siteConfig.nameEn}
        </div>
        <div style={{ marginTop: 12, fontSize: 34, color: "#F3F0E8" }}>
          Contracting &amp; Luxury Interior Finishing
        </div>
        <div
          style={{
            marginTop: 44,
            width: 220,
            height: 5,
            borderRadius: 999,
            backgroundColor: "#C9A15A",
          }}
        />
        <div style={{ marginTop: 44, fontSize: 26, color: "#8F8A82" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size
  );
}
