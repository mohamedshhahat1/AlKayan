"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { MessageSquare, Search, PencilRuler, Box, FileText, Hammer, KeyRound } from "lucide-react";

const steps = [
  { icon: MessageSquare, title: "الاستشارة", desc: "نستمع لاحتياجاتك ونناقش رؤيتك للمشروع" },
  { icon: Search, title: "زيارة الموقع", desc: "نمعن النظر في المساحة ونحدد المتطلبات" },
  { icon: PencilRuler, title: "التصميم 2D", desc: "نضع المخططات الأولية الدقيقة" },
  { icon: Box, title: "التصور 3D", desc: "نعرض المشروع بشكل واقعي ثلاثي الأبعاد" },
  { icon: FileText, title: "عرض السعر", desc: "نقدم عرضاً مفصلاً وشفافاً" },
  { icon: Hammer, title: "التنفيذ", desc: "ننفذ المشروع بأعلى معايير الجودة" },
  { icon: KeyRound, title: "التسليم النهائي", desc: "نسلمك المفتاح بمشروع جاهز" },
];

export function WorkProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="آلية العمل"
          title="رحلتك معنا خطوة بخطوة"
          subtitle="منهجية واضحة ومنظمة تضمن وصولك لنتيجة تفوق توقعاتك"
        />

        <div ref={ref} className="mt-20 relative">
          {/* Background line */}
          <div className="absolute top-0 bottom-0 right-1/2 translate-x-1/2 w-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

          {/* Animated progress line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 right-1/2 translate-x-1/2 w-1 rounded-full gold-gradient-bg"
          />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <Reveal key={i} delay={0.1} y={40}>
                <div className={`flex items-center gap-6 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Card */}
                  <div className="flex-1">
                    <div className="glass rounded-2xl p-6 hover:border-gold/30 transition-all duration-500 hover:-translate-y-1 max-w-md mx-auto">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-gold" />
                        </div>
                        <span className="text-3xl font-extrabold text-gold opacity-30">0{i + 1}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full gold-gradient-bg ring-4 ring-navy" style={{ boxShadow: "0 0 20px rgba(212,175,55,0.4)" }} />
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden sm:block" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
