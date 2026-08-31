import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Web app manifest, served at /manifest.webmanifest.
 *
 * Not a PWA and not trying to be: there is no service worker and nothing here
 * works offline. It exists because "installable / has a manifest" is one of the
 * things Lighthouse and Search Console's mobile usability checks look for, and
 * because a phone that adds this site to a home screen should get the brand's
 * name and colours rather than a screenshot and a URL.
 *
 * `display: "browser"` is deliberate rather than the usual "standalone". The
 * site is a website — an installed copy that hides the address bar would take
 * away the back button and the ability to share a URL, which is most of what a
 * visitor does here.
 *
 * The icon is app/icon.tsx, the same generated mark the favicon uses, so there
 * is one source for the brand square.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.legalName}`,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: "/",
    scope: "/",
    display: "browser",
    lang: "ar",
    dir: "rtl",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["business", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
