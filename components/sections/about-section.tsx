"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { Award, Users, Clock, Sparkles, DollarSign, ShieldCheck, Headset } from "lucide-react";

/**
 * "Who we are" and "why us" were two full-height sections making the same
 * argument, and the six-step journey that used to live here repeated the work
 * process timeline. What is left is the part that actually differentiates:
 * one brand statement beside the seven reasons to pick us.
 */
const features = [
  { icon: Award, title: "جودة فائقة", desc: "أعلى معايير الجودة في كل تفصيلة" },
  { icon: Users, title: "فريق محترف", desc: "نخبة من المهندسين والفنيين" },
  { icon: Clock, title: "التزام بالمواعيد", desc: "تسليم في الوقت المحدد دون تأخير" },
  { icon: Sparkles, title: "أحدث التصاميم", desc: "نواكب أحدث الاتجاهات العالمية" },
  { icon: DollarSign, title: "أسعار تنافسية", desc: "أفضل قيمة دون تنازل عن الجودة" },
  { icon: ShieldCheck, title: "ضمان شامل", desc: "ضمان على جميع الأعمال" },
  { icon: Headset, title: "ما بعد التسليم", desc: "صيانة ومتابعة بعد التسليم" },
];

export function AboutSection() {
  return (
    <section id="about" className="relative py-14 lg:py-20 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-5 blur-3xl"
        style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }}
      />

      <div className="container-luxury">
        <SectionHeading
          eyebrow="من نحن"
          title="رحلة متكاملة من الفكرة إلى الواقع"
          subtitle="شركة الكيان تقدم حلولاً شاملة في المقاولات والتشطيبات الداخلية، ونرافقك في كل خطوة نحو مساحة أحلامك"
        />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Brand statement over the architecture shot */}
          <Reveal>
            <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden glass">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage:
                    "url(https://images.pexels.com/photos/7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&w=1920)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, var(--scrim-h-from), var(--scrim-h-mid), transparent)",
                }}
              />
              <div className="relative h-full flex flex-col justify-center p-8 lg:p-10">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  نحوّل المساحات إلى <span className="gold-gradient-text">تحف فنية</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-md">
                  خبرة تمتد لأكثر من 15 عاماً في تنفيذ مشاريع سكنية وتجارية فاخرة بأعلى معايير الجودة
                  العالمية، من التصميم الأولي وحتى تسليم المفتاح.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Differentiators as compact rows instead of seven large cards */}
          <Reveal delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group glass rounded-xl p-4 flex items-start gap-3 hover:border-gold/30 transition-colors duration-300"
                >
                  <span className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-4 h-4 text-gold" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground group-hover:text-gold transition-colors duration-300">
                      {f.title}
                    </span>
                    <span className="block text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {f.desc}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
