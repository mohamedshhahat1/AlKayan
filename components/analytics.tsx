"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CLARITY_PROJECT_ID,
  GA_MEASUREMENT_ID,
  isClarityConfigured,
  isGaConfigured,
  readConsent,
  subscribeConsent,
  trackPageView,
} from "@/lib/analytics";

/** Where gtag.js lives. Interpolated with the measurement id, never hardcoded. */
const GA_LIBRARY_URL = "https://www.googletagmanager.com/gtag/js";

/**
 * gtag bootstrap.
 *
 * `send_page_view: false` is the important line. GA4's automatic page_view only
 * fires when gtag.js is evaluated, which with the App Router means once per
 * hard load — every client-side navigation after that would go unrecorded.
 * <PageViewTracker /> below sends them instead, so turning the automatic one
 * off is what prevents the landing page being counted twice.
 *
 * Consent Mode is declared as denied and then immediately granted, rather than
 * granted outright. This component does not render at all until consent has
 * been given, so the update always follows a real decision; declaring the
 * default first is what makes the tag behave correctly in the moment before it
 * arrives.
 */
const GA_BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', { analytics_storage: 'denied' });
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
`;

/**
 * Microsoft Clarity's official tag, verbatim apart from the id.
 *
 * Heatmaps, session recordings, scroll depth, rage clicks and dead clicks are
 * all features of the Clarity project itself rather than options set here —
 * loading the tag is the whole integration. Sensitive input values are not
 * captured: Clarity masks form fields by default, and the booking form is
 * additionally marked with data-clarity-mask.
 */
const CLARITY_BOOTSTRAP = `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
`;

/**
 * Loads the analytics tags, once, for the whole site.
 *
 * Mounted from app/layout.tsx so it survives navigation. Returns null — and
 * therefore injects nothing at all — until analytics consent has been granted,
 * which is what makes the consent banner meaningful rather than decorative.
 *
 * next/script with a stable `id` and `afterInteractive` does the rest: the
 * files are fetched once no matter how often this component renders, and never
 * before the page is usable.
 */
export function Analytics() {
  const [granted, setGranted] = useState(false);

  // Read on the client only: localStorage does not exist during SSR, and
  // deciding this during render would produce a hydration mismatch.
  useEffect(() => {
    setGranted(readConsent() === "granted");

    return subscribeConsent((state) => setGranted(state === "granted"));
  }, []);

  if (!granted) return null;

  return (
    <>
      {isGaConfigured && (
        <>
          <Script
            id="ga4-library"
            strategy="afterInteractive"
            src={`${GA_LIBRARY_URL}?id=${GA_MEASUREMENT_ID}`}
          />
          <Script
            id="ga4-bootstrap"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: GA_BOOTSTRAP }}
          />
        </>
      )}

      {isClarityConfigured && (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: CLARITY_BOOTSTRAP }}
        />
      )}

      {/* useSearchParams() opts its subtree into client rendering, so it needs
          a boundary or every page that mounts it would be forced dynamic. */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}

/**
 * One page_view per route, including client-side navigation.
 *
 * The ref is not defensive dressing: this effect runs twice per mount under
 * StrictMode in development, and re-runs whenever the search params object
 * identity changes. Comparing against the last path sent is what keeps the
 * count honest.
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (lastSent.current === path) return;

    lastSent.current = path;
    trackPageView(path);
  }, [pathname, searchParams]);

  return null;
}
