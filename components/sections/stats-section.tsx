"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, Counter } from "@/components/reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabase";
import { useContent, useSetting } from "@/lib/content/context";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
};

/** The band the whole section sits on, reused by the marquee edge fades. */
const BAND = "rgba(11,31,58,0.95)";

/**
 * Numbers and partners are the same argument — social proof — so they share
 * one dark band instead of two full sections.
 */
export function StatsSection() {
  const { stats } = useContent();
  const backgroundUrl = useSetting("stats.image_url", "");
  const partnersTitle = useSetting("partners.title", "شركاؤنا");

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let cancelled = false;

    async function fetchPartners() {
      const { data, error } = await supabase!
        .from("partners")
        .select("id, name, logo_url")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error("[partners] failed to load", error.message);
        return;
      }
      setPartners((data ?? []) as Partner[]);
    }

    fetchPartners();
    return () => {
      cancelled = true;
    };
  }, []);

  // The marquee animation translates by -50%, which only lines up seamlessly
  // when the list is rendered exactly twice.
  const loop = [...partners, ...partners];

  return (
    <section ref={ref} className="relative py-14 lg:py-20 overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      </motion.div>
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0.95), rgba(11,31,58,0.85), rgba(11,31,58,0.95))" }} />

      <div className="relative z-10">
        <div className="container-luxury">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Reveal key={stat.id} delay={i * 0.12} y={30}>
                <div className="text-center group">
                  <div className="text-2xl mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {stat.emoji}
                  </div>
                  <div className="text-3xl lg:text-5xl font-extrabold gold-gradient-text mb-1">
                    <Counter target={stat.target} suffix={stat.suffix} duration={2.5} />
                  </div>
                  <p className="text-xs lg:text-sm text-gray-300 font-medium">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {partners.length > 0 && (
          <div className="mt-12 pt-10" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
            <Reveal>
              <h2 className="text-center text-xs font-bold tracking-[0.3em] text-gold uppercase mb-6">
                {partnersTitle}
              </h2>
            </Reveal>

            <div className="relative overflow-hidden">
              {/* Fades match the band, not the page background. */}
              <div
                className="absolute top-0 bottom-0 right-0 z-10 w-24 pointer-events-none"
                style={{ background: `linear-gradient(270deg, ${BAND}, transparent)` }}
              />
              <div
                className="absolute top-0 bottom-0 left-0 z-10 w-24 pointer-events-none"
                style={{ background: `linear-gradient(90deg, ${BAND}, transparent)` }}
              />

              <div className="flex animate-marquee gap-10 w-max">
                {loop.map((partner, index) => (
                  <div
                    key={`${partner.id}-${index}`}
                    // The second pass is purely decorative; hide it from screen readers.
                    aria-hidden={index >= partners.length}
                    className="flex items-center justify-center min-w-[160px] h-14 group"
                  >
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        loading="lazy"
                        className="max-h-12 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-400 group-hover:text-gold transition-colors duration-500 whitespace-nowrap">
                        {partner.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
