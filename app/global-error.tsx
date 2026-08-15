"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

/**
 * Root error boundary — the one that catches a throw in the root layout
 * itself.
 *
 * This component replaces the layout, which means globals.css is not applied
 * and neither is the font or the theme provider. Everything here is therefore
 * inline-styled and dependency-free on purpose: a screen that only appears
 * when the app is already broken must not have a way of breaking further.
 *
 * The logo is attempted but hides itself on error rather than leaving a broken
 * image icon in the middle of a crash screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] root error", error.digest ?? "", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 24,
          textAlign: "center",
          backgroundColor: "#0B1F3A",
          color: "#F5F7FA",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteConfig.branding.logo}
          alt=""
          height={56}
          style={{ height: 56, width: "auto" }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{siteConfig.name}</h1>

        <p style={{ margin: 0, maxWidth: 420, fontSize: 14, lineHeight: 1.7, color: "#93A4BC" }}>
          حدث خطأ غير متوقع وتعذر تحميل الموقع. يرجى إعادة المحاولة أو الاتصال بنا مباشرة.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              cursor: "pointer",
              border: 0,
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              color: "#0B1F3A",
              background: "linear-gradient(135deg, #E4C558, #D4AF37 55%, #B8962E)",
            }}
          >
            إعادة المحاولة
          </button>

          <a
            href={siteConfig.contact.telHref}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              color: "#F5F7FA",
              textDecoration: "none",
            }}
          >
            اتصل بنا
          </a>
        </div>
      </body>
    </html>
  );
}
