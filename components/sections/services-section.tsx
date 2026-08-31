"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { resolveIcon } from "@/lib/content/icons";
import { useContent, useHeading, useServicesInGroup } from "@/lib/content/context";
import type { Service } from "@/lib/content/types";

export type ServicesSectionProps = {
  /**
   * Show the three category tabs and one group at a time. Off on the homepage,
   * where a flat cut of the catalogue reads better than a tab strip nobody came
   * to that page to use.
   */
  showGroups?: boolean;
  /** Cap the grid. Only meaningful with showGroups off. */
  limit?: number;
  /** Renders a link onward, e.g. "/services". */
  showAllHref?: string;
  /**
   * Promotes this section's heading to the page's h1.
   *
   * Set by the route that owns this subject; left alone on the homepage, where
   * the hero already holds the h1 and a second one would leave the page with
   * two competing titles.
   */
  headingAs?: "h1" | "h2";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

/**
 * The services grid.
 *
 * All 26 services used to render at once in three stacked blocks; the tabs
 * reduced that to a single screen. The catalogue itself now lives in Supabase
 * — see lib/content — so the groups, the services in them and their icons are
 * an editor's decision, not a deploy.
 *
 * Each card is a link to the contact form with that service already selected —
 * the shortest path from "I want this" to an enquiry, and what makes
 * service_view worth recording.
 */
export function ServicesSection({
  showGroups = true,
  limit,
  showAllHref,
  eyebrow,
  title,
  subtitle,
  headingAs,
}: ServicesSectionProps = {}) {
  const { serviceGroups, services: allServices } = useContent();
  const heading = useHeading("services");

  // Seeded from the first group rather than a hardcoded slug: an editor may
  // reorder the groups or unpublish the one that used to be first.
  const [active, setActive] = useState(() => serviceGroups[0]?.slug ?? "");

  // `find` with a fallback rather than a non-null assertion. The active slug is
  // state and the groups come from the database, so they can change under it —
  // an editor unpublishing the open tab between two revalidations would
  // otherwise crash the section on a null deref.
  const activeGroup =
    serviceGroups.find((group) => group.slug === active) ?? serviceGroups[0];

  const groupServices = useServicesInGroup(activeGroup?.slug ?? "");

  const services = showGroups
    ? groupServices
    : typeof limit === "number"
      ? allServices.slice(0, limit)
      : allServices;

  // Part of the Reveal key, so switching tabs replays the entrance animation
  // instead of reusing the previous group's mounted cards.
  const keyPrefix = showGroups ? activeGroup?.slug ?? "none" : "featured";

  return (
    <section id="services" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        {/* Props still win, so /services and the homepage can each say
            something specific; the database supplies the default. */}
        <SectionHeading
          as={headingAs}
          eyebrow={eyebrow ?? heading.eyebrow}
          title={title ?? heading.title}
          subtitle={subtitle ?? heading.subtitle ?? undefined}
        />

        {showGroups && (
          <Reveal delay={0.15} className="mt-8">
            <div role="tablist" aria-label="تصنيفات الخدمات" className="flex flex-wrap items-center justify-center gap-3">
              {serviceGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={activeGroup?.slug === group.slug}
                  onClick={() => setActive(group.slug)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    activeGroup?.slug === group.slug
                      ? "gold-gradient-bg text-on-gold"
                      : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {services.map((service, i) => (
            <Reveal key={`${keyPrefix}-${service.id}`} delay={(i % 4) * 0.06} y={20}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>

        {showAllHref && (
          <div className="mt-8 text-center">
            <Link
              href={showAllHref}
              className="inline-flex items-center gap-2 glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              كل الخدمات
              <ArrowLeft className="w-4 h-4 text-gold" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * One service.
 *
 * Presentational, and deliberately not a link.
 *
 * It has been both. Originally a div with `cursor-default`; then a <Link> to
 * /contact with the service preselected, on the reasoning that a service
 * someone is reading about should have somewhere to go. In practice that made
 * the catalogue a minefield — twenty-six cards that each threw you into the
 * enquiry form the moment you clicked one to read it. Browsing a list of
 * services is not a request to be handed a contact form.
 *
 * So: no href, no onClick, no tab stop, and `cursor-default` so the pointer
 * promises nothing. The hover lift and the gold glow stay — they are the
 * grid's design, and a card may respond to the cursor without claiming to be
 * a button.
 *
 * The contact form still accepts ?service=, still validated against the real
 * catalogue, so a link minted before this change keeps working.
 */
export function ServiceCard({ service }: { service: Service }) {
  const Icon = resolveIcon(service.icon);

  return (
    <div className="group relative block glass rounded-xl p-4 sm:p-5 h-full hover:border-gold/30 transition-all duration-500 hover:-translate-y-1 cursor-default overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15), transparent)" }}
      />

      <div className="relative">
        <div className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className="w-4 h-4 text-gold" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
      </div>
    </div>
  );
}
