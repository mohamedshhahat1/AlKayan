"use client";

import { motion } from "framer-motion";
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

const serviceGroups: { label: string; services: Service[] }[] = [
  {
    label: "التشطيبات",
    services: [
      { icon: Home, title: "تشطيب الشقق", desc: "تشطيب شقق سكنية بتصاميم عصرية وجودة عالية" },
      { icon: Building2, title: "تشطيب الفلل", desc: "تشطيب فلل فاخرة بأدق التفاصيل والخامات" },
      { icon: Briefcase, title: "تشطيب المكاتب", desc: "مساحات عمل احترافية تعكس هوية شركتك" },
      { icon: Store, title: "تشطيب المحلات", desc: "تصاميم تجارية جذابة تجلب الزوار" },
      { icon: Stethoscope, title: "تشطيب العيادات", desc: "بيئات طبية نظيفة ومريحة واحترافية" },
      { icon: UtensilsCrossed, title: "تشطيب المطاعم والكافيهات", desc: "أجواء استثنائية تترك انطباعاً لا يُنسى" },
      { icon: Building, title: "تشطيب الشركات", desc: "مقرات شركات تعكس الاحترافية والرقي" },
    ],
  },
  {
    label: "التصميم",
    services: [
      { icon: Sofa, title: "تصميم داخلي", desc: "تصاميم داخلية فاخرة تناسب ذوقك الرفيع" },
      { icon: Palette, title: "تصميم خارجي", desc: "واجهات معمارية تلفت الأنظار" },
      { icon: Ruler, title: "تصميم 2D", desc: "مخططات دقيقة وشاملة لكل تفاصيل المشروع" },
      { icon: Box, title: "تصميم 3D", desc: "مشاهدة واقعية لمشروعك قبل التنفيذ" },
      { icon: Trees, title: "تصميم حدائق", desc: "مساحات خضراء ساحرة تبعث الراحة" },
      { icon: Flower2, title: "تصميم المناظر", desc: "تنسيق خارجي متكامل يتناغم مع الطبيعة" },
      { icon: DoorOpen, title: "المداخل", desc: "مداخل فاخرة تترك انطباعاً أولياً قوياً" },
      { icon: Sun, title: "الواجهات", desc: "واجهات معمارية مبتكرة وعصرية" },
    ],
  },
  {
    label: "الأعمال المتخصصة",
    services: [
      { icon: Zap, title: "الإضاءة", desc: "أنظمة إضاءة تخلق الأجواء المثالية" },
      { icon: Droplets, title: "السباكة", desc: "أنظمة صحية متكاملة بأعلى المعايير" },
      { icon: Layers, title: "الجبس بورد", desc: "تشكيلات جبسية ديكورية أنيقة" },
      { icon: Paintbrush, title: "الدهانات", desc: "دهانات ديكورية فاخرة ودائمة" },
      { icon: Grid3x3, title: "الأرضيات", desc: "أرضيات متنوعة بأفضل الخامات" },
      { icon: Gem, title: "الرخام", desc: "أعمال رخام فاخرة بلمسة احترافية" },
      { icon: TreePine, title: "النجارة", desc: "أعمال نجارة دقيقة وخامات ممتازة" },
      { icon: DoorOpen, title: "الألمنيوم", desc: "أعمال ألمنيوم حراري وديكوري" },
      { icon: Cpu, title: "السمارت هوم", desc: "أنظمة منزل ذكي متكاملة" },
      { icon: RefreshCw, title: "الترميم", desc: "تجديد وترميم المساحات بلمسة عصرية" },
      { icon: Wrench, title: "الصيانة", desc: "خدمات صيانة دورية احترافية" },
    ],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="خدماتنا"
          title="حلول متكاملة تحت سقف واحد"
          subtitle="نقدم باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك"
        />

        <div className="mt-20 space-y-16">
          {serviceGroups.map((group, gi) => (
            <div key={group.label}>
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.4), transparent)" }} />
                  <h3 className="text-lg font-bold text-gold tracking-wide">{group.label}</h3>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(270deg, rgba(212,175,55,0.4), transparent)" }} />
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.services.map((service, i) => (
                  <Reveal key={service.title} delay={(i % 4) * 0.08} y={30}>
                    <div className="group relative glass rounded-2xl p-6 h-full hover:border-gold/30 transition-all duration-500 hover:-translate-y-1.5 cursor-default overflow-hidden">
                      {/* Hover glow */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.15), transparent)" }} />

                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <service.icon className="w-5 h-5 text-gold" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                          {service.title}
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
