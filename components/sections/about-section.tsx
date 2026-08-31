"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal, SectionHeading } from "@/components/reveal";
import { ArrowDownLeft, ArrowLeft, ArrowUpLeft, Sparkles } from "lucide-react";
import { resolveIcon } from "@/lib/content/icons";
import { useContent, useHeading } from "@/lib/content/context";

export type AboutSectionProps = {
  /**
   * Homepage cut: the image, the intro and the numbers, with a link to the
   * about page instead of the four-strength accordion. The strengths are the
   * substance of /about — printing them on the homepage too would leave that
   * page with nothing of its own to say.
   */
  /**
   * Promotes this section's heading to the page's h1.
   *
   * Set by the route that owns this subject; left alone on the homepage, where
   * the hero already holds the h1 and a second one would leave the page with
   * two competing titles.
   */
  headingAs?: "h1" | "h2";
  compact?: boolean;
};

export function AboutSection({ compact = false, headingAs }: AboutSectionProps = {}) {
  const { aboutFeatures: features, aboutStats: stats } = useContent();
  const heading = useHeading("about");

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="about"
      dir="rtl"
      className="relative overflow-hidden bg-background py-20 sm:py-24 lg:py-32"
    >
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[10%] h-[380px] w-[380px] rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-8%] h-[320px] w-[320px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="container-luxury relative z-10">
        <SectionHeading
          as={headingAs}
          eyebrow={heading.eyebrow}
          title={heading.title}
          subtitle={heading.subtitle ?? undefined}
        />

        {/* LTR controls desktop visual order:
            image = left
            content = right
        */}
        <div
          dir="ltr"
          className="mt-14 grid items-center gap-12 lg:grid-cols-[0.95fr_1fr] lg:gap-20"
        >
          {/* Image — LEFT */}
          <Reveal className="lg:order-1">
            <div className="group relative overflow-hidden rounded-[2rem]">
              <div className="aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt="تصميم داخلي فاخر من تنفيذ الكيان"
                  // Below the fold on both routes that render this section.
                  // Eager, it was preloaded in <head> and competed with the
                  // hero poster for the homepage's first paint.
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Small brand detail */}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-[11px] font-medium text-white/85">
                  تفاصيل تصنع الفرق
                </span>
              </div>
            </div>
          </Reveal>

          {/* Content — RIGHT */}
          <Reveal delay={0.12} className="lg:order-2">
            <div dir="rtl" className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-gold">
                <span className="h-px w-8 bg-gold" />
                EL KAYAN
              </span>

              <h3 className="mt-5 text-3xl font-black leading-[1.25] tracking-tight text-foreground sm:text-4xl lg:text-[46px]">
                التفاصيل الصغيرة
                <br />
                تصنع <span className="gold-gradient-text">الفرق الكبير</span>
              </h3>

              <p className="mt-6 text-sm leading-8 text-muted-foreground sm:text-base">
                نؤمن أن المساحة الناجحة ليست مجرد شكل جميل، بل مزيج متوازن من
                التصميم، الجودة، الدقة، والوطيفة. لذلك نعمل معك من أول تصور وحتى
                آخر تفصيلة في المشروع.
              </p>

              {/* Accordion */}
              {!compact && (
                <div className="mt-9 border-y border-border/70">
                  {features.map((feature, index) => {
                    const Icon = resolveIcon(feature.icon);
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={feature.title}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenIndex(isOpen ? -1 : index)
                          }
                          aria-expanded={isOpen}
                          className="group flex w-full items-center gap-4 py-5 text-right"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                              isOpen
                                ? "border-gold bg-gold text-black"
                                : "border-gold/20 bg-gold/[0.07] text-gold group-hover:border-gold/40"
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-extrabold transition-colors duration-300 sm:text-base ${
                                isOpen
                                  ? "text-gold"
                                  : "text-foreground group-hover:text-gold"
                              }`}
                            >
                              {feature.title}
                            </h4>
                          </div>

                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                              isOpen
                                ? "rotate-[-90deg] border-gold/30 bg-gold/10 text-gold"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {isOpen ? (
                              <ArrowUpLeft className="h-4 w-4" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4" />
                            )}
                          </div>
                        </button>

                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="pb-5 pr-14 text-xs leading-7 text-muted-foreground sm:text-sm">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black tracking-tight text-gold sm:text-3xl">
                      {stat.value}
                    </div>

                    <div className="mt-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {compact && (
                <div className="mt-8">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    المزيد عننا
                    <ArrowLeft className="w-4 h-4 text-gold" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
