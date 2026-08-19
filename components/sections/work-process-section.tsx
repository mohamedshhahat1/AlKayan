"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { MessageSquare, PencilRuler, Box, FileText, KeyRound } from "lucide-react";

/**
 * Five milestones, not seven steps. Consultation and the site visit happen in
 * one appointment, and quoting and contracting are a single decision point.
 * Rendered as a horizontal rail so the whole process reads in one screen
 * rather than seven alternating cards down the page.
 */
const steps = [
  { icon: MessageSquare, title: "الاستشارة والمعاينة", desc: "نستمع لرؤيتك ونزور الموقع لتحديد المتطلبات" },
  { icon: PencilRuler, title: "التصميم 2D", desc: "مخططات أولية دقيقة للمساحة" },
  { icon: Box, title: "التصور 3D", desc: "ترى مشروعك واقعياً قبل التنفيذ" },
  { icon: FileText, title: "العرض والتعاقد", desc: "عرض سعر مفصل وشفاف بلا رسوم خفية" },
  { icon: KeyRound, title: "التنفيذ والتسليم", desc: "تنفيذ بأعلى المعايير حتى تسليم المفتاح" },
];

export function WorkProcessSection() {
  return (
    <section className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="آلية العمل"
          title="رحلتك معنا خطوة بخطوة"
          subtitle="منهجية واضحة ومنطمة تضمن وصولك لنتيجة تفوق توقعاتك"
        />

        <div className="relative mt-10">
          {/* The rail the nodes sit on. Desktop only; stacked cards on mobile
              have no shared axis to draw. */}
          <div
            className="hidden lg:block absolute top-7 right-[10%] left-[10%] h-px"
            style={{ backgroundColor: "var(--line-bg)" }}
            aria-hidden="true"
          />
          <div
            className="hidden lg:block absolute top-7 right-[10%] left-[10%] h-px opacity-60"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)" }}
            aria-hidden="true"
          />

          <ol className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.08} y={24}>
                  <div className="group flex lg:flex-col items-start lg:items-center gap-4 lg:gap-0 lg:text-center">
                    <div className="relative flex-shrink-0 lg:mb-4">
                      <div className="w-14 h-14 rounded-2xl glass-gold flex items-center justify-center ring-4 ring-background group-hover:scale-110 transition-transform duration-300">
                        <step.icon className="w-5 h-5 text-gold" aria-hidden="true" />
                      </div>
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full gold-gradient-bg text-[11px] font-extrabold flex items-center justify-center" style={{ color: "#111111" }}>
                        {i + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
