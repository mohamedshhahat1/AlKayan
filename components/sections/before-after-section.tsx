"use client";

import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { BeforeAfterSlider } from "@/components/before-after-slider";

const beforeAfterProjects = [
  {
    before:
      "https://images.pexels.com/photos/15087186/pexels-photo-15087186.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after:
      "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "شقة النخبة - جدة",
  },
  {
    before:
      "https://images.pexels.com/photos/19408681/pexels-photo-19408681.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after:
      "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "فيلا الياسمين - الرياض",
  },
];

export function BeforeAfterSection() {
  const [active, setActive] = useState(0);
  const project = beforeAfterProjects[active];

  return (
    <section id="before-after" className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="قبل و بعد"
          title="شاهد التحول بنفسك"
          subtitle="نتائج تتحدث عن نفسها - شاهد الفرق قبل وبعد أعمال التشطيب"
        />

        <Reveal delay={0.2} className="mt-12">
          <div role="tablist" aria-label="اختر المشروع" className="flex flex-wrap items-center justify-center gap-3">
            {beforeAfterProjects.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  active === index
                    ? "gold-gradient-bg text-navy-deep"
                    : "glass-light text-gray-300 hover:text-gold hover:border-gold/30"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3} className="mt-10 max-w-4xl mx-auto">
          <BeforeAfterSlider
            key={project.title}
            before={project.before}
            after={project.after}
            className="h-72 sm:h-96 lg:h-[500px] rounded-3xl"
          />
          <p className="text-center text-gray-400 text-sm mt-4">
            اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق
          </p>
        </Reveal>
      </div>
    </section>
  );
}
