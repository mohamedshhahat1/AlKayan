"use client";

import { useState } from "react";
import { Reveal, SectionHeading } from "@/components/reveal";
import {
  Building2, Home, Briefcase, Store, Stethoscope, UtensilsCrossed,
  Building, Sofa, Palette, Ruler, Box, Trees, Flower2, DoorOpen,
  Sun, Zap, Droplets, Layers, Paintbrush, Grid3x3, Gem, TreePine,
  Cpu, RefreshCw, Wrench, type LucideIcon
} from "lucide-react";

type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const serviceGroups: { id: string; label: string; services: Service[] }[] = [
  {
    id: "finishing",
    label: "التشطيبات",
    services: [
      { icon: Home, title: "تشطيب الشقق", desc: "تصاميم عصرية وجودة عالية" },
      { icon: Building2, title: "تشطيب الفلل", desc: "فلل فاخرة بأدق التفاصيل" },
      { icon: Briefcase, title: "تشطيب المكاتب", desc: "مساحات عمل احترافية" },
      { icon: Store, title: "تشطيب المحلات", desc: "تصاميم تجارية جذابة" },
      { icon: Stethoscope, title: "تشطيب العيادات", desc: "بيئات طبية نظيفة ومريحة" },
      { icon: UtensilsCrossed, title: "المطاعم والكافيهات", desc: "أجواء استثنائية لا تُنسى" },
      { icon: Building, title: "تشطيب الشركات", desc: "مقرات تعكس الاحترافية" },
    ],
  },
  {
    id: "design",
    label: "التصميم",
    services: [
      { icon: Sofa, title: "تصميم داخلي", desc: "تصاميم فاخرة تناسب ذوقك" },
      { icon: Palette, title: "تصميم خارجي", desc: "واجهات معمارية لافتة" },
      { icon: Ruler, title: "تصميم 2D", desc: "مخططات دقيقة وشاملة" },
      { icon: Box, title: "تصميم 3D", desc: "مشاهدة واقعية قبل التنفيذ" },
      { icon: Trees, title: "تصميم حدائق", desc: "مساحات خضراء ساحرة" },
      { icon: Flower2, title: "تصميم المناظر", desc: "تنسيق خارجي متكامل" },
      { icon: DoorOpen, title: "المداخل", desc: "انطباع أول قوي" },
      { icon: Sun, title: "الواجهات", desc: "واجهات مبتكرة وعصرية" },
    ],
  },
  {
    id: "specialized",
    label: "الأعمال المتخصصة",
    services: [
      { icon: Zap, title: "الإضاءة", desc: "أنظمة تخلق الأجواء المثالية" },
      { icon: Droplets, title: "السباكة", desc: "أنظمة صحية متكاملة" },
      { icon: Layers, title: "الجبس بورد", desc: "تشكيلات ديكورية أنيقة" },
      { icon: Paintbrush, title: "الدهانات", desc: "دهانات فاخرة ودائمة" },
      { icon: Grid3x3, title: "الأرضيات", desc: "أفضل الخامات والتشطيبات" },
      { icon: Gem, title: "الرخام", desc: "أعمال رخام فاخرة" },
      { icon: TreePine, title: "النجارة", desc: "دقة وخامات ممتازة" },
      { icon: DoorOpen, title: "الألمنيوم", desc: "ألمنيوم حراري وديكوري" },
      { icon: Cpu, title: "السمارت هوم", desc: "أنظمة منزل ذكي متكاملة" },
      { icon: RefreshCw, title: "الترميم", desc: "تجديد بلمسة عصرية" },
      { icon: Wrench, title: "الصيانة", desc: "صيانة دورية احترافية" },
    ],
  },
];

/**
 * All 26 services used to render at once in three stacked blocks. Same
 * catalogue, but only the active group is in the DOM, so the section is a
 * single screen instead of three.
 */
export function ServicesSection() {
  const [active, setActive] = useState(serviceGroups[0].id);
  const activeGroup = serviceGroups.find((group) => group.id === active)!;

  return (
    <section id="services" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="خدماتنا"
          title="حلول متكاملة تحت سقف واحد"
          subtitle="باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك"
        />

        <Reveal delay={0.15} className="mt-8">
          <div role="tablist" aria-label="تصنيفات الخدمات" className="flex flex-wrap items-center justify-center gap-3">
            {serviceGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={active === group.id}
                onClick={() => setActive(group.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  active === group.id
                    ? "gold-gradient-bg"
                    : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
                }`}
                style={active === group.id ? { color: "#0B1F3A" } : {}}
              >
                {group.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {activeGroup.services.map((service, i) => (
            <Reveal key={`${active}-${service.title}`} delay={(i % 4) * 0.06} y={20}>
              <div className="group relative glass rounded-xl p-4 sm:p-5 h-full hover:border-gold/30 transition-all duration-500 hover:-translate-y-1 cursor-default overflow-hidden">
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15), transparent)" }}
                />

                <div className="relative">
                  <div className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <service.icon className="w-4 h-4 text-gold" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-gold transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
