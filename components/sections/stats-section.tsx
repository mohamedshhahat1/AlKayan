"use client";

import { Reveal, Counter } from "@/components/reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { target: 450, suffix: "+", label: "مشروع منجز", icon: "🏗️" },
  { target: 15, suffix: "+", label: "سنة خبرة", icon: "⭐" },
  { target: 380, suffix: "+", label: "عميل سعيد", icon: "😊" },
  { target: 250000, suffix: " م²", label: "مساحة منجزة", icon: "📐" },
];

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-15"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/35300835/pexels-photo-35300835.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        />
      </motion.div>
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0.95), rgba(11,31,58,0.85), rgba(11,31,58,0.95))" }} />

      <div className="relative z-10 container-luxury">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 0.15} y={40}>
              <div className="text-center group">
                <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl lg:text-6xl font-extrabold gold-gradient-text mb-3">
                  <Counter target={stat.target} suffix={stat.suffix} duration={2.5} />
                </div>
                <p className="text-sm lg:text-base text-gray-300 font-medium">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
