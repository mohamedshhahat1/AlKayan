"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Maximize, Clock, CheckCircle2, Plus } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { getSupabaseClient } from "@/lib/supabase";
import { lockScroll, unlockScroll } from "@/lib/lenis";

type Project = {
  id: string;
  title: string;
  title_en: string | null;
  category: string;
  location: string | null;
  area_sqm: number | null;
  duration_days: number | null;
  execution_date: string | null;
  services_included: string[] | null;
  materials_used: string[] | null;
  client_testimonial: string | null;
  client_name: string | null;
  hero_image: string;
  gallery_images: string[] | null;
  before_image: string | null;
  after_image: string | null;
  featured: boolean;
};

type Status = "loading" | "ready" | "error";

const categoryLabels: Record<string, string> = {
  apartments: "شقق",
  villas: "فلل",
  offices: "مكاتب",
  clinics: "عيادات",
  restaurants: "مطاعم",
  commercial: "تجاري",
  landscape: "حدائق",
};

/** `category` is free text in the database, so fall back instead of rendering "undefined". */
function categoryLabel(category: string) {
  return categoryLabels[category] ?? "مشروع";
}

/**
 * Gregorian formatting. `toLocaleDateString("ar-SA")` resolves to the Islamic
 * calendar in most browsers, which is not what a completion date should show.
 */
const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  year: "numeric",
  month: "long",
});

/** How many cards to show before the user asks for the rest. */
const INITIAL_VISIBLE = 6;

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

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("ready");
      return;
    }

    let cancelled = false;

    async function fetchProjects() {
      const { data, error } = await supabase!
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error("[projects] failed to load", error.message);
        setStatus("error");
        return;
      }
      setProjects((data ?? []) as Project[]);
      setStatus("ready");
    }

    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  // Only offer filters that actually match something.
  const availableCategories = Array.from(new Set(projects.map((project) => project.category)));
  const categories = ["all", ...availableCategories];

  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filtered.length - visible.length;

  return (
    <section id="projects" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="مشاريعنا"
          title="معرض أعمالنا الفاخرة"
          subtitle="نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية"
        />

        {status === "loading" && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="glass rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        )}

        {status === "error" && (
          <p role="status" className="mt-8 text-center text-muted-foreground">
            تعذر تحميل المشاريع حالياً. يرجى المحاولة لاحقاً.
          </p>
        )}

        {status === "ready" && projects.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">سيتم إضافة المشاريع قريباً.</p>
        )}

        {status === "ready" && projects.length > 0 && (
          <>
            <Reveal delay={0.15} className="mt-8">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => {
                      setActiveCategory(category);
                      setShowAll(false);
                    }}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      activeCategory === category
                        ? "gold-gradient-bg text-navy-deep"
                        : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
                    }`}
                  >
                    {category === "all" ? "الكل" : categoryLabel(category)}
                  </button>
                ))}
              </div>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 0.08} y={30}>
                  <button
                    type="button"
                    onClick={() => setSelected(project)}
                    aria-label={`عرض تفاصيل مشروع ${project.title}`}
                    className="group relative block w-full text-right rounded-2xl overflow-hidden glass cursor-pointer hover:border-gold/30 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <div className="zoom-container relative aspect-[16/11]">
                      <img
                        src={project.hero_image}
                        alt={project.title}
                        loading="lazy"
                        className="zoom-image w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-image-scrim transition-opacity duration-500" />

                      <div className="absolute top-3 right-3">
                        <span className="glass-gold text-gold text-xs font-bold px-3 py-1 rounded-full">
                          {categoryLabel(project.category)}
                        </span>
                      </div>

                      <div className="absolute bottom-0 right-0 left-0 p-5">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold transition-colors duration-300">
                          {project.title}
                        </h3>
                        {project.location && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-300">
                            <MapPin className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
                            {project.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="mt-8 text-center text-muted-foreground">لا توجد مشاريع في هذا التصنيف.</p>
            )}

            {hiddenCount > 0 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Plus className="w-4 h-4 text-gold" aria-hidden="true" />
                  عرض كل المشاريع
                  <span className="text-muted-foreground">({hiddenCount})</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Before / after used to be a section of its own, arguing the same
            point as the gallery above it. */}
        <div id="before-after" className="mt-14 pt-10 border-t border-border">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="inline-block text-xs font-bold tracking-[0.3em] text-gold uppercase mb-2">
                  قبل و بعد
                </span>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground">شاهد التحول بنفسك</h3>
              </div>

              <BeforeAfterTabs />
            </div>
          </Reveal>
        </div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

/** Tab row plus the slider it controls, kept together so state stays local. */
function BeforeAfterTabs() {
  const [active, setActive] = useState(0);
  const project = beforeAfterProjects[active];

  return (
    <>
      <div role="tablist" aria-label="اختر المشروع" className="flex flex-wrap items-center gap-2">
        {beforeAfterProjects.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              active === index
                ? "gold-gradient-bg text-navy-deep"
                : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="w-full sm:w-auto sm:absolute sm:static" />

      <div className="w-full order-last mt-6 sm:mt-0 sm:w-full sm:basis-full">
        <BeforeAfterSlider
          key={project.title}
          before={project.before}
          after={project.after}
          className="h-64 sm:h-80 lg:h-[420px] rounded-3xl mt-6"
        />
        <p className="text-center text-muted-foreground text-xs mt-3">
          اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق
        </p>
      </div>
    </>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    // Setting body overflow alone is not enough: Lenis drives the page scroll
    // from window-level wheel events and never looks at it. lockScroll pauses
    // Lenis as well.
    lockScroll();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Rendered on document.body rather than inside <section id="projects">. A
  // dialog nested in the section is subject to that subtree's stacking context
  // and to any ancestor that establishes a containing block, which would pin
  // this "fixed" overlay to the section instead of the viewport.
  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        // Keep wheel and touch scrolling inside the dialog.
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-4 sm:inset-8 lg:inset-12 z-[70] rounded-3xl overflow-y-auto overscroll-contain glass border border-gold/20 bg-card/95"
      >
        <button
          type="button"
          onClick={onClose}
          className="sticky top-6 float-left ml-6 z-[80] w-11 h-11 rounded-full glass-light flex items-center justify-center text-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={project.hero_image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-image-scrim" />
          <div className="absolute bottom-0 right-0 left-0 p-8">
            <span className="glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">
              {categoryLabel(project.category)}
            </span>
            <h2 className="text-3xl font-extrabold text-white">{project.title}</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-12 space-y-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {project.location && <InfoCard icon={MapPin} label="الموقع" value={project.location} />}
            {project.area_sqm != null && (
              <InfoCard icon={Maximize} label="المساحة" value={`${project.area_sqm} م²`} />
            )}
            {project.duration_days != null && (
              <InfoCard icon={Clock} label="المدة" value={`${project.duration_days} يوم`} />
            )}
            {project.execution_date && (
              <InfoCard
                icon={Calendar}
                label="تاريخ التنفيذ"
                value={dateFormatter.format(new Date(project.execution_date))}
              />
            )}
          </div>

          {project.gallery_images && project.gallery_images.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-5">معرض الصور</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery_images.map((image, index) => (
                  <div key={image} className="zoom-container rounded-xl overflow-hidden glass">
                    <img
                      src={image}
                      alt={`${project.title} — صورة ${index + 1}`}
                      loading="lazy"
                      className="zoom-image w-full h-56 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.before_image && project.after_image && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-5">قبل و بعد</h3>
              <BeforeAfterSlider
                before={project.before_image}
                after={project.after_image}
                className="h-72 sm:h-96 rounded-2xl"
              />
            </div>
          )}

          {project.services_included && project.services_included.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-5">الخدمات المضمنة</h3>
              <ul className="flex flex-wrap gap-3">
                {project.services_included.map((service) => (
                  <li
                    key={service}
                    className="glass-gold text-gold text-sm px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.materials_used && project.materials_used.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-5">الخامات المستخدمة</h3>
              <ul className="flex flex-wrap gap-3">
                {project.materials_used.map((material) => (
                  <li key={material} className="glass-light text-muted-foreground text-sm px-4 py-2 rounded-full">
                    {material}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.client_testimonial && (
            <figure className="glass rounded-2xl p-8">
              <blockquote className="text-lg text-foreground/90 leading-relaxed mb-4 italic">
                {project.client_testimonial}
              </blockquote>
              {project.client_name && (
                <figcaption className="text-gold font-bold">— {project.client_name}</figcaption>
              )}
            </figure>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <Icon className="w-5 h-5 text-gold mb-3" aria-hidden="true" />
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
