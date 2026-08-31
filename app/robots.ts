import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * robots.txt.
 *
 * Note what is NOT here: no `host` line. It used to be set, and because
 * NEXT_PUBLIC_SITE_URL pointed at a deployment URL it published
 * "Host: https://alkayan.vercel.app" to every crawler that asked. `host` is a
 * Yandex extension that Google ignores entirely, so it was a directive with no
 * upside naming the wrong domain — the canonical tags and the redirect from the
 * apex already say which host is the real one, and they say it correctly.
 *
 * The Sitemap line is absolute, as the spec requires, and comes from the same
 * origin as every canonical on the site so the two cannot disagree.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /api/health is a liveness probe, not a page. Nothing under /api is
      // content, and crawling it only wastes budget that should go to the five
      // routes that are.
      //
      // Deliberately narrow: /_next/ stays crawlable. Blocking it is a common
      // reflex and a real mistake — it holds the CSS and JS Googlebot needs to
      // render the page, and a page it cannot render is a page it cannot judge
      // as mobile-friendly.
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
