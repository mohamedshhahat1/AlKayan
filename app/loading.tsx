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
      {/* aria-hidden on the mark, and the status text below carries the
          announcement, so a screen reader hears one sentence rather than the
          company name followed by "loading". */}
      <BrandLockup className="animate-pulse" label="" aria-hidden="true" />
      <p role="status" className="text-sm text-muted-foreground">
        جارٍ التحميل…
      </p>
    </div>
  );
}
