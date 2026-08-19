/**
 * The service catalogue.
 *
 * Moved verbatim out of components/sections/services-section.tsx, where it was
 * a private constant. Three things now need it — the services page, the
 * homepage's featured cut, and the contact form's service prefill — and the
 * alternative to a shared list is three lists that disagree about what the
 * company offers.
 *
 * Icons are part of the data rather than looked up by name: the icon is chosen
 * for the service, and keeping them together means adding a service cannot
 * silently produce a card with no icon.
 */

import {
  Building2, Home, Briefcase, Store, Stethoscope, UtensilsCrossed,
  Building, Sofa, Palette, Ruler, Box, Trees, Flower2, DoorOpen,
  Sun, Zap, Droplets, Layers, Paintbrush, Grid3x3, Gem, TreePine,
  Cpu, RefreshCw, Wrench, type LucideIcon
} from "lucide-react";

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export type ServiceGroup = {
  id: string;
  label: string;
  services: Service[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    id: "finishing",
    label: "التشطيبات",
    services: [
      { icon: Home, title: "تشطيب الشقق", desc: "تصاميم عصرية وجودة عالية" },
      { icon: Building2, title: "تشطيب الفلل", desc: "فلل فاخرة بأدق التفاصيل" },
      { icon: Briefcase, title: "تشطيب المكاتب", desc: "مساحات عمل احترافية" },
      { icon: Store, title: "تشطيب المحلات", desc: "تصاميم تجارية جذابة" },
      { icon: Stethoscope, title: "تشطيب العيادات", desc: "بيئات طبية نطيفة ومريحة" },
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
 * Every service, flattened, in catalogue order.
 *
 * The homepage shows the first few of these rather than a hand-picked list:
 * "featured" would be a fourth place to maintain, and the catalogue is already
 * ordered with the headline work first.
 */
export const allServices: Service[] = serviceGroups.flatMap((group) => group.services);

/**
 * Is this the title of a real service?
 *
 * Used to vet the ?service= query parameter before it is put in the booking
 * form: the value arrives from a URL, so it is not trusted, and an unrecognised
 * one is ignored rather than prefilled.
 */
export function isKnownService(title: string): boolean {
  return allServices.some((service) => service.title === title);
}
