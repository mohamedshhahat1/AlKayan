/**
 * Analytics: one module, two destinations.
 *
 * Google Analytics 4 answers "how many, from where, doing what"; Microsoft
 * Clarity answers "what did that actually look like" (heatmaps, session
 * recordings, scroll depth, rage and dead clicks). Both are wired up in
 * components/analytics.tsx and both are optional — the site behaves identically
 * when neither is configured.
 *
 * Rules this module exists to enforce:
 *
 *  1. Nothing is measured without consent. Every send goes through trackEvent,
 *     which returns early unless consent has been granted, and the scripts are
 *     not even injected before then. Rejecting analytics is not a degraded
 *     experience: it is the same site with nothing reporting.
 *
 *  2. No personal data, ever. AnalyticsParams is a closed type and the only
 *     values it accepts are ids, slugs, titles and UI placements. There is no
 *     field for a name, a phone number, an email address or a message, so a
 *     careless call site cannot invent one.
 *
 *  3. One definition per event. Call sites use the named helpers below rather
 *     than trackEvent("whatsapp_click", ...) so the event name and its
 *     parameters are declared once, here.
 */

/**
 * GA4 measurement id, e.g. G-XXXXXXXXXX. Never hardcoded — set
 * NEXT_PUBLIC_GA_MEASUREMENT_ID at build time (see .env.example).
 *
 * Blank is treated as absent, the same convention lib/site-config.ts uses: a
 * variable someone has not filled in yet and a variable that is not there at
 * all mean the same thing.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

/** Microsoft Clarity project id. Set NEXT_PUBLIC_CLARITY_PROJECT_ID. */
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() ?? "";

export const isGaConfigured = GA_MEASUREMENT_ID.length > 0;
export const isClarityConfigured = CLARITY_PROJECT_ID.length > 0;

/** True when there is anything at all to ask consent for. */
export const isAnalyticsConfigured = isGaConfigured || isClarityConfigured;

/** Every event this site is allowed to send. */
export type AnalyticsEventName =
  | "page_view"
  | "whatsapp_click"
  | "phone_click"
  | "project_view"
  | "service_view"
  | "contact_submit"
  | "quote_request";

/**
 * Every parameter this site is allowed to attach to an event.
 *
 * Deliberately closed. Adding a field here is a decision to be made once, in
 * review, rather than at a call site under deadline — which is how a phone
 * number ends up in an analytics payload.
 */
export type AnalyticsParams = {
  /** Route, including query string, e.g. "/projects/modern-villa". */
  page_path?: string;
  page_location?: string;
  page_title?: string;
  project_id?: string;
  project_slug?: string;
  project_name?: string;
  service_name?: string;
  /** Where in the UI the interaction happened: "header", "footer", "hero". */
  placement?: string;
  /** Which flow produced a lead: "contact_page", "project_detail". */
  source?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

export type ConsentState = "granted" | "denied" | "unset";

/** localStorage key. Versionless on purpose: the question is not going to change. */
export const CONSENT_STORAGE_KEY = "alkayan.analytics-consent";

type ConsentListener = (state: ConsentState) => void;

const consentListeners = new Set<ConsentListener>();

/**
 * Current choice, or "unset" if the visitor has not answered yet.
 *
 * Wrapped in try/catch because localStorage throws rather than returning null
 * in Safari's private mode and under some corporate policies. An unreadable
 * store is the same as an unanswered question: nothing is measured.
 */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";

  try {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : "unset";
  } catch {
    return "unset";
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "granted";
}

/**
 * Record a decision and tell everything that cares.
 *
 * Also speaks to the vendors directly: gtag Consent Mode is updated, and
 * Clarity is asked to stop on a withdrawal. That matters for the case where
 * someone grants consent, the tags load, and they then change their mind
 * without reloading the page.
 */
export function setConsent(state: "granted" | "denied"): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, state);
  } catch {
    // Nothing to do. The listeners below still run, so the current page
    // behaves as asked; the choice simply will not survive a reload.
  }

  window.gtag?.("consent", "update", {
    analytics_storage: state,
  });

  if (state === "denied") window.clarity?.("consent", false);

  for (const listener of consentListeners) listener(state);
}

/** Reopens the question, so the footer can offer "change my mind". */
export function resetConsent(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // See setConsent.
  }

  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  window.clarity?.("consent", false);

  for (const listener of consentListeners) listener("unset");
}

/**
 * Subscribe to consent changes. Returns an unsubscribe function, so it can be
 * returned straight from a useEffect.
 *
 * The storage event covers a second tab: answering there should not leave this
 * tab still measuring.
 */
export function subscribeConsent(listener: ConsentListener): () => void {
  if (typeof window === "undefined") return () => undefined;

  consentListeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) listener(readConsent());
  };

  window.addEventListener("storage", onStorage);

  return () => {
    consentListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

/**
 * Drops empty and undefined values so an absent optional column does not turn
 * into an "undefined" string in a report.
 */
function cleanParams(params: AnalyticsParams): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.trim() !== "") result[key] = value.trim();
  }

  return result;
}

/**
 * The one send path.
 *
 * Silent when consent has not been granted, when the tag is not configured, or
 * when it has not finished loading — a queued gtag call is not worth a broken
 * click. Mirrored into Clarity as a custom event, which is what makes it
 * possible to filter session recordings by "people who clicked WhatsApp".
 */
export function trackEvent(name: AnalyticsEventName, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const payload = cleanParams(params);

  if (isGaConfigured && typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (isClarityConfigured && typeof window.clarity === "function") {
    window.clarity("event", name);
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${name}`, payload);
  }
}

/**
 * Guard for events that describe an arrival rather than an action.
 *
 * React re-renders, and in development StrictMode mounts every component
 * twice. "project_view" fired from an effect would therefore be counted two or
 * three times per visit without this. Keyed by event and subject, held for the
 * life of the page.
 */
const firedOnce = new Set<string>();

export function trackOnce(key: string, send: () => void): void {
  if (firedOnce.has(key)) return;

  firedOnce.add(key);
  send();
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

/**
 * GA4's automatic page_view is turned off in components/analytics.tsx, because
 * with the App Router it only ever fires on a hard load and would miss every
 * client-side navigation. This is the replacement.
 */
export function trackPageView(pagePath: string): void {
  trackEvent("page_view", {
    page_path: pagePath,
    page_location: typeof window === "undefined" ? undefined : window.location.href,
    page_title: typeof document === "undefined" ? undefined : document.title,
  });
}

export function trackWhatsAppClick(params: { placement?: string; projectSlug?: string } = {}): void {
  trackEvent("whatsapp_click", {
    placement: params.placement,
    project_slug: params.projectSlug,
  });
}

export function trackPhoneClick(params: { placement?: string; projectSlug?: string } = {}): void {
  trackEvent("phone_click", {
    placement: params.placement,
    project_slug: params.projectSlug,
  });
}

/** A project detail page opened, or a project card followed. */
export function trackProjectView(
  project: { id?: string | null; slug?: string | null; name?: string | null },
  placement?: string
): void {
  trackEvent("project_view", {
    project_id: project.id ?? undefined,
    project_slug: project.slug ?? undefined,
    project_name: project.name ?? undefined,
    placement,
  });
}

export function trackServiceView(serviceName: string, placement?: string): void {
  trackEvent("service_view", {
    service_name: serviceName,
    placement,
  });
}

/**
 * The booking form was accepted by Supabase.
 *
 * Note what is absent: the name, phone, email and message the visitor typed.
 * Only where the form was and which service was picked from a fixed list are
 * reported, neither of which identifies anyone.
 */
export function trackContactSubmit(params: { source?: string; serviceName?: string } = {}): void {
  trackEvent("contact_submit", {
    source: params.source,
    service_name: params.serviceName,
  });
}

/** Someone asked to be quoted — a service card, a CTA, or a booking with a service attached. */
export function trackQuoteRequest(
  params: { source?: string; serviceName?: string; projectSlug?: string } = {}
): void {
  trackEvent("quote_request", {
    source: params.source,
    service_name: params.serviceName,
    project_slug: params.projectSlug,
  });
}
