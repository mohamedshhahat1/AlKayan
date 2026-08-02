import type { Metadata } from "next";
import { Tajawal, IBM_Plex_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";
import { BackToTop } from "@/components/back-to-top";
import { siteConfig } from "@/lib/site-config";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

/**
 * Navigation face.
 *
 * IBM Plex Sans Arabic has lower stroke contrast and a larger x-height than
 * Tajawal, so it stays legible at small sizes over a photograph — which is
 * exactly the nav's problem. Its Arabic is a modern low-contrast Naskh, the
 * register luxury architecture studios tend to use.
 *
 * Only 500 and 600 are loaded, and only the nav uses the family, so this adds
 * two subsetted woff2 files rather than a second full family. Tajawal remains
 * the site font everywhere else.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["500", "600"],
  variable: "--font-plex-arabic",
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

export const viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <body className={tajawal.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Side effect only — it does not render its children. */}
          <SmoothScroll />
          <a
            href="#hero"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:gold-gradient-bg focus:text-navy-deep focus:font-bold"
          >
            تخطي إلى المحتوى
          </a>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <ChatWidget />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
