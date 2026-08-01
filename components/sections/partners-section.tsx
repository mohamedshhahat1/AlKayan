"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Reveal, SectionHeading } from "@/components/reveal";

type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    async function fetchPartners() {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setPartners(data as Partner[]);
    }
    fetchPartners();
  }, []);

  const displayPartners = partners.length > 0 ? partners : [];
  const doubled = [...displayPartners, ...displayPartners];

  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      <div className="container-luxury">
        <Reveal>
          <p className="text-center text-sm font-bold tracking-[0.3em] text-gold uppercase mb-10">
            شركاؤنا
          </p>
        </Reveal>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute top-0 bottom-0 right-0 z-10 w-32 bg-gradient-to-l from-navy to-transparent pointer-events-none" style={{ background: "linear-gradient(270deg, #0B1F3A, transparent)" }} />
        <div className="absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r from-navy to-transparent pointer-events-none" style={{ background: "linear-gradient(90deg, #0B1F3A, transparent)" }} />

        <div className="flex animate-marquee gap-12 w-max">
          {doubled.map((partner, i) => (
            <div
              key={i}
              className="flex items-center justify-center min-w-[200px] h-20 group"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-h-16 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <span className="text-xl font-bold text-gray-500 group-hover:text-gold transition-colors duration-500 whitespace-nowrap">
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
