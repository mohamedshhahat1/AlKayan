import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getSiteContent } from "@/lib/content/fetch";
import { ContentProvider } from "@/lib/content/context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ChatWidget } from "@/components/chat-widget";
import { BackToTop } from "@/components/back-to-top";
import { Analytics } from "@/components/analytics";
import { ConsentBanner } from "@/components/consent-banner";
import { siteConfig } from "@/lib/site-config";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

/**
 * Search Console's HTML-tag verification, if that is the method chosen.
 *
 * Read here rather than in siteConfig because it is not a fact about the
 * business — it is a token belonging to one Search Console property.
 */
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || null;

/**
 * Tajawal, self-hosted and subsetted by next/font.
 *
 * Five weights, not seven. 200 and 300 were declared and never used: no
 * `font-extralight` or `font-light` class exists anywhere in the app, and no
 * component sets those numerically. Each declared weight is a separate woff2
 * per subset, and every one of them is emitted as a `<link rel="preload">` in
 * <head> on every page — so two unused weights were four render-blocking-ish
 * font fetches competing with the hero poster for bandwidth on first paint.
 *
 * The five that remain are the ones the classes actually resolve to: 400
 * normal, 500 medium, 700 bold, 800 extrabold, 900 black. `font-semibold`
 * (600) is used too but Tajawal has no 600 — the browser has always picked the
 * nearest, and that is unchanged.
 *
 * Before adding a weight back, check a class or a style actually asks for it.
 */
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
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
    // Googlebot gets the explicit form as well. The defaults are already
    // index/follow, but the three preview caps are not: without them Google
    // may show a thumbnail-sized image and a truncated snippet for a portfolio
    // site whose whole argument is photographs.
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Rendered as <meta name="google-site-verification"> when the variable is
  // set. Search Console's DNS TXT method is better — it survives a redeploy
  // with the variable missing — so this is the fallback, not the plan.
  verification: googleVerification ? { google: googleVerification } : undefined,
  manifest: "/manifest.webmanifest",
  category: "construction",
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
};

export const viewport = {
  // Tints the mobile browser chrome. Matches --background in dark mode, which
  // is the default theme — so the address bar and the page are one black.
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

/**
 * How long a rendered page may serve before the content tables are read again.
 *
 * Five minutes. The content is edited in the Supabase dashboard by hand, so
 * the write rate is a few changes an hour at most; re-reading fifteen tables
 * on every request to catch them would be pure waste. Long enough that the
 * site serves from cache under load, short enough that an editor sees their
 * change without asking anyone to redeploy.
 */
export const revalidate = 300;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // One read for the whole site. The sections are client components and cannot
  // fetch on the server themselves; this is the single place content enters
  // the tree, and ContentProvider carries it down through every route.
  const content = await getSiteContent();

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
        {/*
          The company and the website, once, on every route.

          In the layout rather than on the homepage because a crawler's first
          contact with this site is often a project page or /services, and the
          entity behind the page should not depend on which door it came in by.
          Every per-page graph below references these two nodes by @id instead
          of restating them, so there is exactly one Organization on the site.
        */}
        <JsonLd nodes={[organizationJsonLd(), websiteJsonLd()]} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
         <ContentProvider content={content}>
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
         </ContentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
