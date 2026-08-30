import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import "./bands.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";
import { BackToTop } from "@/components/back-to-top";
import { siteConfig } from "@/lib/site-config";
import { getSiteContent } from "@/lib/content/fetch";
import { ContentProvider } from "@/lib/content/context";

/**
 * Two faces, one family of shapes.
 *
 * Cairo carries the headings: geometric, high-contrast at large sizes, and it
 * keeps the counters open in الكيان at display scale. Tajawal stays on body
 * copy, where its narrower forms fit more Arabic per line without crowding.
 *
 * Cairo is a variable font, so `weight` is intentionally omitted — next/font
 * only requires it for static families. Subsets are arabic + latin; both are
 * published for Cairo, which is what the Noto Kufi Arabic attempt got wrong.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * How long a rendered page may serve before the content tables are read again.
 *
 * Five minutes. The content is edited in the Supabase dashboard by hand, so
 * the write rate is a few changes an hour at most; re-reading eleven tables on
 * every request to catch them would be pure waste. Long enough that the site
 * is served from cache under load, short enough that an editor sees their
 * change without asking anyone to redeploy.
 */
export const revalidate = 300;

export const viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

/**
 * Dark is the default theme, so `dark` is a static class on <html> rather than
 * something a provider writes at runtime.
 *
 * The token layer also defines a full warm palette under `.light`, so enabling
 * a theme switch is a matter of swapping this one class — no component rule
 * needs a second definition. Keeping `dark` here (rather than dropping the
 * class strategy) also means every dark: utility already in the component layer
 * resolves exactly as before.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // One read for the whole page. The sections are client components and cannot
  // fetch on the server themselves; this is the single place the content
  // enters the tree, and ContentProvider carries it down.
  const content = await getSiteContent();

  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable} ${tajawal.variable}`}>
      <body className={tajawal.className}>
        {/* Side effect only — it does not render its children. */}
        <SmoothScroll />
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-sm focus:bg-gold focus:text-on-gold focus:font-bold"
        >
          تخطي إلى المحتوى
        </a>
        <ContentProvider content={content}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <ChatWidget />
          <BackToTop />
        </ContentProvider>
      </body>
    </html>
  );
}
