"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { trackWhatsAppClick } from "@/lib/analytics";

type WhatsAppLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick" | "target" | "rel"
> & {
  /** Where on the page this link sits: "footer", "project_detail", "chat_widget". */
  placement: string;
  /** Set on a project page, so enquiries can be attributed to a project. */
  projectSlug?: string;
  children: ReactNode;
};

/**
 * A WhatsApp link that reports itself.
 *
 * WhatsApp is reachable from several places — the floating button, the footer,
 * the contact CTA, a project page — and every one of them wants the same event
 * with a different placement. This exists so that is a prop rather than a
 * copied onClick handler, which is the version that rots: someone adds a fifth
 * link and forgets the tracking, and the numbers quietly understate.
 *
 * The href and target are fixed and not overridable. Styling is entirely the
 * caller's, so this can be dropped into existing markup without changing how
 * anything looks.
 */
export function WhatsAppLink({ placement, projectSlug, children, ...rest }: WhatsAppLinkProps) {
  return (
    <a
      {...rest}
      href={siteConfig.contact.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      // Synchronous, so it runs before the browser follows the link. Nothing is
      // awaited and nothing can throw into the navigation.
      onClick={() => trackWhatsAppClick({ placement, projectSlug })}
    >
      {children}
    </a>
  );
}
