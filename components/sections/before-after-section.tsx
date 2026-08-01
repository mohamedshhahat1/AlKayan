"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { useState } from "react";

const beforeAfterProjects = [
  {
    before: "https://images.pexels.com/photos/15087186/pexels-photo-15087186.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after: "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "شقة النخبة - جدة",
  },
  {
    before: "https://images.pexels.com/photos/19408681/pexels-photo-19408681.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after: "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "فيلا الياسمين - الرياض",
  },
];

export function BeforeAfterSection() {
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(50);

  const project = beforeAfterProjects[active];

  return (
    <section className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="قبل و بعد"
          title="شاهد التحول بنفسك"
          subtitle="نتائج تتحدث عن نفسها - شاهد الفرق قبل وبعد أعمال التشطيب"
        />

        {/* Project selector */}
        <Reveal delay={0.2} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {beforeAfterProjects.map((p, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setPos(50); }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === i
                    ? "gold-gradient-bg text-navy"
                    : "glass-light text-gray-300 hover:text-gold hover:border-gold/30"
                }`}
                style={active === i ? { color: "#0B1F3A" } : {}}
              >
                {p.title}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Slider */}
        <Reveal delay={0.3} className="mt-10 max-w-4xl mx-auto">
          <div
            className="relative w-full h-72 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden glass select-none cursor-ew-resize"
            onMouseMove={(e) => {
              if (e.buttons !== 1 && e.type === "mousemove") return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              setPos(Math.max(0, Math.min(100, x)));
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
              setPos(Math.max(0, Math.min(100, x)));
            }}
          >
            {/* After (full) */}
            <img src={project.after} alt="بعد" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            {/* Before (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img src={project.before} alt="قبل" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            </div>
            {/* Labels */}
            <span className="absolute top-5 right-5 glass-gold text-gold text-sm font-bold px-4 py-2 rounded-full z-10">قبل</span>
            <span className="absolute top-5 left-5 glass-gold text-gold text-sm font-bold px-4 py-2 rounded-full z-10">بعد</span>
            {/* Divider */}
            <div className="absolute top-0 bottom-0 z-10" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
              <div className="w-1 h-full bg-gold" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-gold/30">
                <span className="text-navy text-lg font-bold" style={{ color: "#0B1F3A" }}>⟷</span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">اسحب لرؤية الفرق</p>
        </Reveal>
      </div>
    </section>
  );
}
