"use client";

import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { trackPhoneClick } from "@/lib/analytics";

/**
 * The phone call-to-action.
 *
 * Lifted out of the header unchanged so the same markup, the same gold pill
 * and the same `siteConfig.contact.telHref` back every call button on the
 * site. There is no second phone constant anywhere.
 *
 * Variants
 * --------
 * `full` — the desktop pill, byte-for-byte the classes the header shipped
 *          with. Callers supply the display class (`hidden sm:flex`), which is
 *          the only thing that ever differed. It shows the number unless the
 *          caller passes a `label` to show instead; either way the number is on
 *          the anchor's `title`, and the href is the same tel: link, so the
 *          button dials whatever it says on it.
 *
 * `icon` — the same action at 44x44, the minimum comfortable touch target, for
 *          the mobile navbar. Deliberately shaped like the theme toggle and
 *          the hamburger beside it (w-11 h-11 rounded-xl) so the row reads as
 *          three peers rather than a desktop button crushed into a gap. The
 *          number moves to `title`/`aria-label` because a 44px box cannot hold
 *          "+20 10 1234 5678" without shrinking the text below legibility.
 *
 * Tracking
 * --------
 * Both variants report a `phone_click` on the way to the dialer. It is a
 * synchronous call on an anchor whose href is untouched, so the call connects
 * whether or not analytics loaded, was consented to, or is blocked. `placement`
 * is what makes the number useful — knowing that people call is worth less than
 * knowing they call from the header rather than the contact page.
 */
export function CallCta({
  variant = "full",
  className,
  label,
  onNavigate,
  placement = "call_cta",
}: {
  variant?: "full" | "icon";
  className?: string;
  /** Shown in place of the number on the `full` variant. */
  label?: string;
  /** Lets the mobile menu close itself as the dialer opens. */
  onNavigate?: () => void;
  /** Where this button lives: "header", "header_mobile", "contact_section". */
  placement?: string;
}) {
  const handleClick = () => {
    trackPhoneClick({ placement });
    onNavigate?.();
  };

  if (variant === "icon") {
    return (
      <a
        href={siteConfig.contact.telHref}
        onClick={handleClick}
        aria-label="اتصل بنا"
        title={siteConfig.contact.phone}
        className={cn(
          "h-11 w-11 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-navy-deep transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
          className
        )}
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={siteConfig.contact.telHref}
      onClick={handleClick}
      title={siteConfig.contact.phone}
      className={cn(
        "items-center gap-2 px-4 py-2.5 rounded-full gold-gradient-bg text-navy-deep text-sm font-bold hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
        className
      )}
    >
      <Phone className="w-4 h-4" aria-hidden="true" />
      {/* dir="ltr" belongs to the number, not to the button: an Arabic label in
          an LTR span would render its punctuation on the wrong side. */}
      {label ? <span>{label}</span> : <span dir="ltr">{siteConfig.contact.phone}</span>}
    </a>
  );
}
