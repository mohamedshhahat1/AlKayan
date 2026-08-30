"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { resolveIcon } from "@/lib/content/icons";
import { useContent, useHeading, useSetting } from "@/lib/content/context";

/**
 * "Who we are" and "why us" were two full-height sections making the same
 * argument, and the six-step journey that used to live here repeated the work
 * process timeline. What is left is the part that actually differentiates:
 * one brand statement beside the reasons to pick us.
 *
 * The statement, the photograph behind it and the differentiators all come
 * from Supabase — see lib/content.
 */
export function AboutSection() {
  const { aboutFeatures } = useContent();
  const heading = useHeading("about");

  const statementLead = useSetting("about.statement_lead", "نحوّل المساحات إلى");
  const statementAccent = useSetting("about.statement_accent", "تحف فنية");
  const statementBody = useSetting("about.statement_body", "");
  const imageUrl = useSetting("about.image_url", "");

  return (
    /*
     * The first warm-light band in the rhythm.
     *
     * .band-warm redefines the semantic tokens on this element, so everything
     * below keeps using text-ink / bg-card / text-gold and simply resolves warm
     * — including gold, which steps down to #A77A32 for contrast on beige.
     *
     * The top border is a deliberate gold hairline: the dark hero above should
     * meet this band at a crisp architectural edge, not fade into it.
     */
    <section
      id="about"
      className="band-warm relative overflow-hidden border-t border-line-gold/40 py-16 lg:py-24"
    >
      <div className="container-luxury">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          subtitle={heading.subtitle ?? undefined}
        />

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Brand statement over the architecture shot */}
          <Reveal>
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-sm border border-line">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              {/* Horizontal scrim from the reading edge. The tokens are warm
                  inside this band, so the copy stays charcoal-on-ivory. */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, var(--scrim-h-from), var(--scrim-h-mid), transparent)",
                }}
              />
              <div className="relative flex h-full flex-col justify-center p-8 lg:p-10">
                <span className="arch-rule mb-5" aria-hidden="true" />
                <h3 className="font-display mb-4 text-display-md text-ink">
                  {statementLead} <span className="text-gold">{statementAccent}</span>
                </h3>
                <p className="max-w-md leading-relaxed text-ink-secondary">{statementBody}</p>
              </div>
            </div>
          </Reveal>

          {/* Differentiators as compact rows instead of seven large cards */}
          <Reveal delay={0.15}>
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
              {aboutFeatures.map((feature) => {
                const Icon = resolveIcon(feature.icon);

                return (
                <div
                  key={feature.id}
                  className="group flex items-start gap-3 rounded-sm border border-line bg-card p-4 transition-[background-color,border-color] duration-500 ease-arch hover:border-line-gold hover:bg-card-hover"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-line-gold/50 bg-gold/10">
                    <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block text-sm font-bold text-ink transition-colors duration-400 ease-arch group-hover:text-gold">
                      {feature.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                      {feature.description}
                    </span>
                  </span>
                </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
