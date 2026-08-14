"use client";

import { useRef, useState } from "react";
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
      { icon: Stethoscope, title: "تشطيب العيادات", desc: "بيئات طبية نزيهة ومريحة" },
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
      { icon: Flower2, title: "تصميم المناطر", desc: "تنسيق خارجي متكامل" },
      { icon: DoorOpen, title: "المداخل", desc: "انطباع أول قوي" },
      { icon: Sun, title: "الواجهات", desc: "واجهات مبتكرة وعصرية" },
    ],
  },
  {
    id: "specialized",
    label: "الأعمال المتخصصة",
    services: [
      { icon: Zap, title: "الإضاءة", desc: "أنطمة تخلق الأجواء المثالية" },
      { icon: Droplets, title: "السباكة", desc: "أنطمة صحية متكاملة" },
      { icon: Layers, title: "الجبس بورد", desc: "تشكيلات ديكورية أنيقة" },
      { icon: Paintbrush, title: "الدهانات", desc: "دهانات فاخرة ودائمة" },
      { icon: Grid3x3, title: "الأرضيات", desc: "أفضل الخامات والتشطيبات" },
      { icon: Gem, title: "الرخام", desc: "أعمال رخام فاخرة" },
      { icon: TreePine, title: "النجارة", desc: "دقة وخامات ممتازة" },
      { icon: DoorOpen, title: "الألمنيوم", desc: "ألمنيوم حراري وديكوري" },
      { icon: Cpu, title: "السمارت هوم", desc: "أنطمة منزل ذكي متكاملة" },
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /**
   * Roving focus for the tablist.
   *
   * role="tab" is a promise to keyboard users that arrow keys move between
   * tabs; without this the markup claimed a pattern it did not implement.
   *
   * The arrow mapping is mirrored because the page is RTL: the visually next
   * tab is to the *left*, so ArrowLeft advances and ArrowRight goes back. Using
   * the LTR mapping here would send focus backwards from the user's point of
   * view.
   */
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const lastIndex = serviceGroups.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowLeft") next = index === lastIndex ? 0 : index + 1;
    else if (event.key === "ArrowRight") next = index === 0 ? lastIndex : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = lastIndex;

    if (next === null) return;
    event.preventDefault();
    setActive(serviceGroups[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    /*
     * A dark band in the section rhythm: #171717 against the #111111 page, with
     * hairline rules top and bottom so the change of surface reads as a
     * deliberate edge rather than a gradient.
     */
    <section
      id="services"
      className="relative border-y border-line-subtle bg-surface py-16 lg:py-24"
    >
      <div className="container-luxury">
        <SectionHeading
          eyebrow="خدماتنا"
          title="حلول متكاملة تحت سقف واحد"
          subtitle="باقة شاملة من خدمات المقاولات والتشطيبات والتصميم لتلبية كل احتياجاتك"
        />

        <Reveal delay={0.15} className="mt-10">
          <div
            role="tablist"
            aria-label="تصنيفات الخدمات"
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {serviceGroups.map((group, index) => {
              const isActive = active === group.id;
              return (
                <button
                  key={group.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`services-tab-${group.id}`}
                  aria-selected={isActive}
                  aria-controls={`services-panel-${group.id}`}
                  /* Only the active tab is in the tab order; arrows move within. */
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(group.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className={`rounded-sm px-6 py-3 text-sm font-semibold transition-colors duration-400 ease-arch focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? "bg-gold text-on-gold"
                      : "border border-line text-ink-secondary hover:border-line-gold hover:text-gold"
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div
          role="tabpanel"
          id={`services-panel-${activeGroup.id}`}
          aria-labelledby={`services-tab-${activeGroup.id}`}
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          {activeGroup.services.map((service, i) => (
            <Reveal key={`${active}-${service.title}`} delay={(i % 4) * 0.06} y={20}>
              {/*
                A card, not a glass panel: #242424 fill, hairline border, 4px
                corner. On hover it steps to #2B2B2B, the border warms to the
                gold hairline and the whole card lifts 2px — one calm move
                instead of a lift, a glow and a rotating icon.
              */}
              <div className="group h-full cursor-default rounded-sm border border-line-subtle bg-card p-5 transition-[background-color,border-color,transform] duration-500 ease-arch hover:-translate-y-0.5 hover:border-line-gold hover:bg-card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm border border-line-gold/60 bg-gold/10">
                  <service.icon className="h-4 w-4 text-gold" aria-hidden="true" />
                </div>
                <h3 className="font-display mb-1.5 text-sm font-bold text-ink transition-colors duration-400 ease-arch group-hover:text-gold">
                  {service.title}
                </h3>
                <p className="text-xs leading-relaxed text-ink-muted">{service.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
