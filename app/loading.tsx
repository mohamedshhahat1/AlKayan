import { BrandLockup } from "@/components/brand";

/**
 * Route-level loading state.
 *
 * Rendered in place of the page while a navigation suspends, inside the root
 * layout, so the header and footer stay put and only the body swaps. On a
 * single-route site this is rarely seen — but it is the surface that shows if
 * a slow network stalls a transition, and it should be the brand rather than a
 * blank column when it does.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6">
      {/* label="" — decorative. The status message below is what a screen
          reader needs to hear here, not the company name again. */}
      <BrandLockup label="" className="animate-pulse" />
      <p role="status" className="text-sm text-muted-foreground">
        جارٍ التحميل…
      </p>
    </div>
  );
}
