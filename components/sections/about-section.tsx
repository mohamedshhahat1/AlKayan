"use client";

import { motion } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { Lightbulb, ClipboardList, PencilRuler, Box, Hammer, KeyRound } from "lucide-react";

const timeline = [
  { icon: Lightbulb, title: "الفكرة", desc: "نستمع لرؤيتك ونحولها إلى مفهوم واضح", step: "01" },
  { icon: ClipboardList, title: "التخطيط", desc: "نضع خطة متكاملة تلبي احتياجاتك وميزانيتك", step: "02" },
  { icon: PencilRuler, title: "التصميم ثنائي الأبعاد", desc: "رسومات دقيقة تعكس كل تفاصيل المساحة", step: "03" },
  { icon: Box, title: "التصور ثلاثي الأبعاد", desc: "مشاهدة واقعية لمشروعك قبل التنفيذ", step: "04" },
  { icon: Hammer, title: "التنفيذ", desc: "فريق متخصص ينفذ بأعلى معايير الجودة", step: "05" },
  { icon: KeyRound, title: "التسليم النهائي", desc: "نسلمك المفتاح بمشروع جاهز للسكن", step: "06" },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="من نحن"
          title="رحلة متكاملة من الفكرة إلى الواقع"
          subtitle="شركة الكيان تقدم حلولاً شاملة في مجال المقاولات والتشطيبات الداخلية، نرافقك في كل خطوة من رحلتك نحو مساحة أحلامك"
        />

        {/* Timeline */}
        <div className="mt-20 relative">
          {/* Connecting line */}
          <div className="absolute top-0 bottom-0 right-1/2 translate-x-1/2 w-px hidden lg:block" style={{ background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            {timeline.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1} y={50}>
                <div className="relative group">
                  {/* Card */}
                  <div className="glass rounded-2xl p-8 h-full hover:border-gold/30 transition-all duration-500 hover:-translate-y-2">
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl glass-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-6 h-6 text-gold" />
                      </div>
                      <span className="text-5xl font-extrabold opacity-10 text-gold">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>

                  {/* Arrow between items (desktop) */}
                  {i < timeline.length - 1 && (
                    <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-8 h-8 rounded-full glass-gold flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Architecture illustration */}
        <Reveal delay={0.3} className="mt-20">
          <div className="relative h-64 rounded-3xl overflow-hidden glass">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  "url(https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=1920)",
              }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--scrim-h-from), var(--scrim-h-mid), transparent)" }} />
            <div className="relative h-full flex items-center px-8 lg:px-16">
              <div className="max-w-lg">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  نحوّل المساحات إلى <span className="gold-gradient-text">تحف فنية</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  نمتلك خبرة تمتد لأكثر من 15 عاماً في تنفيذ مشاريع سكنية وتجارية فاخرة بأعلى معايير الجودة العالمية
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
