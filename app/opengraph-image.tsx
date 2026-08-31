// ImageResponse lives in next/server on Next 13. The next/og entry point was
// only introduced in Next 14 — switch these imports if the project upgrades.
import { ImageResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people see when a link to this site is shared — WhatsApp, Facebook,
 * X, LinkedIn, Slack, iMessage.
 *
 * ## Why the name is artwork and not text
 *
 * This card was Latin-only, reading "Al Kayan — Contracting & Luxury Interior
 * Finishing", because the fonts Satori bundles carry no Arabic glyphs. The
 * obvious fix — ship Tajawal and set the name in it — was tried and abandoned,
 * and the reason is worth recording so nobody spends the afternoon again:
 *
 *   1. Satori does not implement bidi. It shapes each Arabic word correctly but
 *      lays the words out in source order, left to right, so "الكيان للتشطيبات"
 *      renders as "للتشطيبات الكيان". `direction: "rtl"` changes nothing,
 *      because there is no bidi pass for it to influence. Giving each word its
 *      own flex item in a `row-reverse` row does fix the order.
 *   2. But Satori also measures Arabic from unshaped advance widths while
 *      rendering the shaped, joined forms, which are narrower. Every word lands
 *      in a box far wider than its ink, so the words sit with a gulf between
 *      them. `gap: 0` does not close it — the space is inside each word's box.
 *
 * So the name is drawn, not typeset: public/brand/company_name.svg is the
 * wordmark the header already uses. It is correct Arabic by construction, in
 * the brand's own lettering, and immune to both problems above.
 *
 * The tagline underneath is genuinely typeset, in Tajawal, and does still pay
 * (1) and (2) — hence ArabicLine below. It is three short words at 30px, where
 * the loose word spacing reads as tracking rather than as a fault. Keep it
 * short for that reason: the longer the line, the more the gaps accumulate.
 *
 * ## Assets
 *
 * Both SVGs and the font are read through `import.meta.url`, so the bundler
 * inlines the real files and this module never becomes a second copy of the
 * artwork. Replace the logo once, in public/brand/, and the share card follows.
 *
 * Satori needs explicit width and height on an <img>; it will not size an SVG
 * from its viewBox. The constants below preserve each file's own aspect ratio.
 *
 * ## Editing this
 *
 * Colours are literals because this runs at the edge with no stylesheet — keep
 * them in step with globals.css by hand. And note that every platform caches
 * share cards hard: after changing anything here, a link already sent in
 * WhatsApp keeps its old picture, sometimes for weeks. Test with a fresh URL.
 */

/** logo.svg — viewBox 1088x625. */
const LOGO_WIDTH = 208;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 625) / 1088);

/** company_name.svg — viewBox 515x228. */
const WORDMARK_WIDTH = 470;
const WORDMARK_HEIGHT = Math.round((WORDMARK_WIDTH * 228) / 515);

/**
 * One line of Arabic, laid out right to left.
 *
 * Each word is its own flex item and the row is `row-reverse`, so the first
 * word lands on the right, where an Arabic reader starts. See the note above
 * for why this is done by hand rather than with `direction: "rtl"`.
 *
 * No `gap`: Satori's Arabic boxes already carry more trailing space than a word
 * space needs, and adding to it only widens the gulf.
 */
function ArabicLine({ text, style }: { text: string; style: Record<string, unknown> }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {text
        .split(" ")
        .filter(Boolean)
        .map((word, index) => (
          <span key={index}>{word}</span>
        ))}
    </div>
  );
}

export default async function Image() {
  const [medium, logo, wordmark] = await Promise.all([
    fetch(new URL("./_fonts/Tajawal-Medium.ttf", import.meta.url)).then((r) => r.arrayBuffer()),
    fetch(new URL("../public/brand/logo.svg", import.meta.url)).then((r) => r.text()),
    fetch(new URL("../public/brand/company_name.svg", import.meta.url)).then((r) => r.text()),
  ]);

  // Satori takes an SVG as a data URI on an <img>. encodeURIComponent rather
  // than base64: the file is text, and this keeps it readable in a stack trace.
  const asImage = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

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
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(212,175,55,0.22) 0%, transparent 55%)",
          fontFamily: "Tajawal",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders
            to a raster image; next/image has no meaning inside ImageResponse. */}
        <img src={asImage(logo)} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="" />

        {/* eslint-disable-next-line @next/next/no-img-element -- as above. */}
        <img
          src={asImage(wordmark)}
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          alt=""
          style={{ marginTop: 30 }}
        />

        <ArabicLine
          // Complements the wordmark rather than echoing it: the artwork above
          // already reads "للتشطيبات والمقاولات العامة", so repeating "تشطيبات"
          // here spent the one line this card has on a word already on it.
          text="تصميم وتنفيذ متكامل"
          style={{ marginTop: 26, fontSize: 30, fontWeight: 500, color: "#F0F0F0" }}
        />

        <div
          style={{
            marginTop: 34,
            width: 200,
            height: 4,
            borderRadius: 999,
            backgroundColor: "#D4AF37",
          }}
        />

        <div style={{ marginTop: 30, fontSize: 25, fontWeight: 500, color: "#9A9A9A" }}>
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    {
      ...size,
      // One weight: the wordmark carries the heavy lettering, so nothing here
      // needs bold. Each face is ~60 KB inside an edge bundle with a size cap.
      fonts: [{ name: "Tajawal", data: medium, weight: 500, style: "normal" }],
    }
  );
}
