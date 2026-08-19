import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";
import { BackToTop } from "@/components/back-to-top";
import { Analytics } from "@/components/analytics";
import { ConsentBanner } from "@/components/consent-banner";
import { siteConfig } from "@/lib/site-config";

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

export const viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <head>
        {/*
          The hero poster is the first pixel of this site anyone sees and it
          fills the viewport, so it is almost certainly the LCP element.

          Declaring it here means the browser begins fetching while the parser
          is still inside <head> — before it has reached the hero markup, and
          long before React has done anything. It also settles a race: the hero
          video is in the same initial HTML with preload="auto" and is roughly
          twelve times the size, so without this the poster would be queued
          behind it.

          Read from siteConfig rather than hardcoded, so the path cannot drift
          out of step with the component that renders it, and skipped entirely
          when the poster has been turned off.
        */}
        {siteConfig.hero.poster && (
          <link rel="preload" as="image" href={siteConfig.hero.poster} />
        )}
      </head>
      <body className={tajawal.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Side effect only — it does not render its children. */}
          <SmoothScroll />
          {/*
            Targets the <main> below rather than #hero, which only exists on the
            homepage — on /about the old link went nowhere, which is worse than
            no skip link for the person who depends on it.
          */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:gold-gradient-bg focus:text-navy-deep focus:font-bold"
          >
            تخطي إلى المحتوى
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <WhatsAppButton />
          <ChatWidget />
          <BackToTop />
          {/*
            Mounted here, once, for the whole site: the layout is not remounted
            on navigation, so the GA and Clarity tags load exactly once no matter
            how many pages someone visits. Both render nothing until consent is
            granted, and nothing at all when their env vars are unset.
          */}
          <Analytics />
          <ConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
