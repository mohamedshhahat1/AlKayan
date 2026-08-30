"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { resolveIcon } from "@/lib/content/icons";
import { useContent, useHeading } from "@/lib/content/context";

/**
 * Five milestones, not seven steps. Consultation and the site visit happen in
 * one appointment, and quoting and contracting are a single decision point.
 * Rendered as a horizontal rail so the whole process reads in one screen
 * rather than seven alternating cards down the page.
 *
 * The steps come from Supabase — see lib/content. The rail's five-column grid
 * is a layout choice and does not track the row count; a sixth step wraps
 * rather than crowding the row.
 */
export function WorkProcessSection() {
  const { processSteps } = useContent();
  const heading = useHeading("process");

  return (
    <section className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          subtitle={heading.subtitle ?? undefined}
        />

        <div className="relative mt-10">
          {/* The rail the nodes sit on. Desktop only; stacked cards on mobile
              have no shared axis to draw. */}
          <div
            className="hidden lg:block absolute top-7 right-[10%] left-[10%] h-px"
            style={{ backgroundColor: "var(--line-bg)" }}
            aria-hidden="true"
          />
          <div
            className="hidden lg:block absolute top-7 right-[10%] left-[10%] h-px opacity-60"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)" }}
            aria-hidden="true"
          />

          <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {processSteps.map((step, i) => {
              const Icon = resolveIcon(step.icon);

              return (
              <li key={step.id}>
                <Reveal delay={i * 0.08} y={24}>
                  <div className="group flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 lg:text-center">
                    <div className="relative flex-shrink-0 lg:mb-4">
                      <div className="w-14 h-14 rounded-2xl glass-gold flex items-center justify-center ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-gold" aria-hidden="true" />
                      </div>
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full gold-gradient-bg text-[11px] font-extrabold flex items-center justify-center" style={{ color: "#111111" }}>
                        {i + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
