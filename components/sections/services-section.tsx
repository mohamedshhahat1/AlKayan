"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { allServices, serviceGroups, type Service } from "@/lib/services";
import { trackServiceView } from "@/lib/analytics";

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
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

/**
 * The services grid.
 *
 * All 26 services used to render at once in three stacked blocks; the tabs
 * reduced that to a single screen. The catalogue itself now lives in
 * lib/services.ts, because the homepage and the contact form need it too.
 *
 * Each card is a link to the contact form with that service already selected —
 * the shortest path from "I want this" to an enquiry, and what makes
 * service_view worth recording.
 */
export function ServicesSection({
  showGroups = true,
  limit,
  showAllHref,
  eyebrow = "خدماتنا",
  title = "حلول متكاملة تحت سقف واحد",
  subtitle = "باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك",
}: ServicesSectionProps = {}) {
  const [active, setActive] = useState(serviceGroups[0].id);
  const activeGroup = serviceGroups.find((group) => group.id === active)!;

  const services = showGroups
    ? activeGroup.services
    : typeof limit === "number"
      ? allServices.slice(0, limit)
      : allServices;

  // Part of the Reveal key, so switching tabs replays the entrance animation
  // instead of reusing the previous group's mounted cards.
  const keyPrefix = showGroups ? active : "featured";

  return (
    <section id="services" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        {showGroups && (
          <Reveal delay={0.15} className="mt-8">
            <div role="tablist" aria-label="تصنيفات الخدمات" className="flex flex-wrap items-center justify-center gap-3">
              {serviceGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={active === group.id}
                  onClick={() => setActive(group.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active === group.id
                      ? "gold-gradient-bg"
                      : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
                  }`}
                  style={active === group.id ? { color: "#0B1F3A" } : {}}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {services.map((service, i) => (
            <Reveal key={`${keyPrefix}-${service.title}`} delay={(i % 4) * 0.06} y={20}>
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
 * Was a div with `cursor-default`, which is an odd thing to tell someone about a
 * service they might want to buy. Now it goes somewhere: /contact with this
 * service preselected. Every other class is unchanged, so the grid looks
 * identical.
 */
function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/contact?service=${encodeURIComponent(service.title)}`}
      onClick={() => trackServiceView(service.title, "services_grid")}
      className="group relative block glass rounded-xl p-4 sm:p-5 h-full hover:border-gold/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15), transparent)" }}
      />

      <div className="relative">
        <div className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <service.icon className="w-4 h-4 text-gold" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors duration-300">
          {service.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
      </div>
    </Link>
  );
}
