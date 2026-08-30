"use client";

import { useRef, useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { resolveIcon } from "@/lib/content/icons";
import { useContent, useHeading, useServicesInGroup } from "@/lib/content/context";

/**
 * The service catalogue used to render all at once in three stacked blocks.
 * Same catalogue, but only the active group is in the DOM, so the section is a
 * single screen instead of three.
 *
 * Groups, services, icons and the heading above them all come from Supabase —
 * see lib/content. The three-tab shape is the only thing fixed here; the
 * number of tabs and what is in them is an editor's decision.
 */
export function ServicesSection() {
  const { serviceGroups } = useContent();
  const heading = useHeading("services");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Seeded from the first group rather than a hardcoded slug: an editor may
  // reorder the groups or unpublish the one that used to be first.
  const [active, setActive] = useState(() => serviceGroups[0]?.slug ?? "");

  // `find` rather than a non-null assertion. The active slug is state, and the
  // groups can change under it — an editor unpublishing the open tab between
  // two revalidations would otherwise crash the section on a null deref.
  const activeGroup =
    serviceGroups.find((group) => group.slug === active) ?? serviceGroups[0];

  const activeServices = useServicesInGroup(activeGroup?.slug ?? "");

  /**
   * Roving focus for the tablist.
   *
   * role="tab" is a promise to keyboard users that arrow keys move between
   * tabs; without this the markup claimed a pattern it did not implement.
   *
   * The arrow mapping is mirrored because the page is RTL: the visually next
   * tab is to the *left*, so ArrowLeft advances and ArrowRight goes back. Using
   * the LTR mapping here would send focus backwards from the user's point of
   * view.
   */
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const lastIndex = serviceGroups.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = index === lastIndex ? 0 : index + 1;
    else if (event.key === "ArrowRight") next = index === 0 ? lastIndex : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = lastIndex;

    if (next === null) return;
    event.preventDefault();
    setActive(serviceGroups[next].slug);
    tabRefs.current[next]?.focus();
  };

  return (
    /*
     * A dark band in the section rhythm: #171717 against the #111111 page, with
     * hairline rules top and bottom so the change of surface reads as a
     * deliberate edge rather than a gradient.
     */
    <section
      id="services"
      className="relative border-y border-line-subtle bg-surface py-16 lg:py-24"
    >
      <div className="container-luxury">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          subtitle={heading.subtitle ?? undefined}
        />

        <Reveal delay={0.15} className="mt-10">
          <div
            role="tablist"
            aria-label="تصنيفات الخدمات"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {serviceGroups.map((group, index) => {
              const isActive = activeGroup?.slug === group.slug;
              return (
                <button
                  key={group.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`services-tab-${group.slug}`}
                  aria-selected={isActive}
                  aria-controls={`services-panel-${group.slug}`}
                  /* Only the active tab is in the tab order; arrows move within. */
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(group.slug)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`rounded-sm px-6 py-3 text-sm font-semibold transition-colors duration-400 ease-arch focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? "bg-gold text-on-gold"
                      : "border border-line text-ink-secondary hover:border-line-gold hover:text-gold"
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id={`services-panel-${activeGroup?.slug ?? "none"}`}
          aria-labelledby={`services-tab-${activeGroup?.slug ?? "none"}`}
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          {activeServices.map((service, i) => {
            const Icon = resolveIcon(service.icon);

            return (
            <Reveal key={service.id} delay={(i % 4) * 0.06} y={20}>
              {/*
                A card, not a glass panel: #242424 fill, hairline border, 4px
                corner. On hover it steps to #2B2B2B, the border warms to the
                gold hairline and the whole card lifts 2px — one calm move
                instead of a lift, a glow and a rotating icon.
              */}
              <div className="group h-full cursor-default rounded-sm border border-line-subtle bg-card p-5 transition-[background-color,border-color,transform] duration-500 ease-arch hover:-translate-y-0.5 hover:border-line-gold hover:bg-card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-line-gold/60 bg-gold/10">
                  <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                <h3 className="font-display mb-1.5 text-sm font-bold text-ink transition-colors duration-400 ease-arch group-hover:text-gold">
                  {service.title}
                </h3>
                <p className="text-xs leading-relaxed text-ink-muted">{service.description}</p>
              </div>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
