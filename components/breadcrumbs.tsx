import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Crumb } from "@/lib/seo";

/**
 * The visible breadcrumb trail on deep pages.
 *
 * Pair it with `breadcrumbJsonLd(crumbs, path)` from lib/seo.ts and pass both
 * the *same* `crumbs` array. Google's breadcrumb guidance is that the markup
 * describes a trail the page actually shows; a BreadcrumbList with no visible
 * counterpart is markup describing something that is not there.
 *
 * RTL: the separator points left (ChevronLeft), which is "forwards" in a
 * right-to-left line. The default ChevronRight would point back the way the
 * eye came from.
 *
 * The last crumb is the current page and is rendered as text, not a link —
 * matching the JSON-LD, where the final ListItem carries no `item`.
 */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ name: "الرئيسية", path: "/" }, ...crumbs];

  return (
    <nav aria-label="مسار التنقل" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li key={`${crumb.name}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronLeft className="h-3 w-3 shrink-0 text-gold/60" aria-hidden="true" />
              )}
              {isLast || !crumb.path ? (
                // The page you are on. aria-current tells a screen reader which
                // item is the destination rather than another step.
                <span aria-current="page" className="font-medium text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="rounded transition-colors hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
