"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { getSupabaseClient } from "@/lib/supabase";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
};

export function PartnersSection() {
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
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="container-luxury">
        <Reveal>
          <h2 className="text-center text-sm font-bold tracking-[0.3em] text-gold uppercase mb-10">
            شركاؤنا
          </h2>
        </Reveal>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute top-0 bottom-0 right-0 z-10 w-32 pointer-events-none bg-gradient-to-l from-background to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 z-10 w-32 pointer-events-none bg-gradient-to-r from-background to-transparent" />

        <div className="flex animate-marquee gap-12 w-max">
          {loop.map((partner, index) => (
            <div
              key={`${partner.id}-${index}`}
              // The second pass is purely decorative; hide it from screen readers.
              aria-hidden={index >= partners.length}
              className="flex items-center justify-center min-w-[200px] h-20 group"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  loading="lazy"
                  className="max-h-16 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <span className="text-xl font-bold text-muted-foreground/70 group-hover:text-gold transition-colors duration-500 whitespace-nowrap">
                  {partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
