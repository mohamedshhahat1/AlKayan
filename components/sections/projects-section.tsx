"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, SectionHeading } from "@/components/reveal";
import { X, MapPin, Calendar, Maximize, Clock, CheckCircle2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  title_en: string | null;
  category: string;
  location: string | null;
  area_sqm: number | null;
  duration_days: number | null;
  execution_date: string | null;
  services_included: string[];
  materials_used: string[];
  client_testimonial: string | null;
  client_name: string | null;
  hero_image: string;
  gallery_images: string[] | null;
  before_image: string | null;
  after_image: string | null;
  featured: boolean;
};

const categoryLabels: Record<string, string> = {
  apartments: "شقق",
  villas: "فلل",
  offices: "مكاتب",
  clinics: "عيادات",
  restaurants: "مطاعم",
  commercial: "تجاري",
  landscape: "حدائق",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setProjects(data as Project[]);
    }
    fetchProjects();
  }, []);

  const categories = ["all", ...Object.keys(categoryLabels)];
  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="relative py-24 lg:py-32">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="مشاريعنا"
          title="معرض أعمالنا الفاخرة"
          subtitle="نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية"
        />

        {/* Category filters */}
        <Reveal delay={0.2} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "gold-gradient-bg text-navy"
                    : "glass-light text-gray-300 hover:text-gold hover:border-gold/30"
                }`}
                style={activeCategory === cat ? { color: "#0B1F3A" } : {}}
              >
                {cat === "all" ? "الكل" : categoryLabels[cat]}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Masonry grid */}
        <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filtered.map((project, i) => (
            <Reveal key={project.id} delay={(i % 3) * 0.1} y={40}>
              <div
                onClick={() => setSelected(project)}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden glass cursor-pointer hover:border-gold/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="zoom-container relative">
                  <img
                    src={project.hero_image}
                    alt={project.title}
                    className="zoom-image w-full h-auto object-cover"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" style={{ background: "linear-gradient(180deg, transparent 30%, rgba(11,31,58,0.9) 100%)" }} />

                  {/* Category badge */}
                  <div className="absolute top-4 right-4">
                    <span className="glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full">
                      {categoryLabels[project.category]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 right-0 left-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300">
                      {project.title}
                    </h3>
                    {project.location && (
                      <p className="flex items-center gap-1.5 text-sm text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-gold" />
                        {project.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-4 sm:inset-8 lg:inset-12 z-[70] rounded-3xl overflow-y-auto glass border border-gold/20"
        style={{ backgroundColor: "rgba(11,31,58,0.95)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="fixed top-6 left-6 z-[80] w-11 h-11 rounded-full glass-light flex items-center justify-center text-white hover:text-gold transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero image */}
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={project.hero_image} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(11,31,58,1) 100%)" }} />
          <div className="absolute bottom-0 right-0 left-0 p-8">
            <span className="glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">
              {categoryLabels[project.category]}
            </span>
            <h2 className="text-3xl font-extrabold text-white">{project.title}</h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-12 space-y-10">
          {/* Info grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {project.location && (
              <InfoCard icon={MapPin} label="الموقع" value={project.location} />
            )}
            {project.area_sqm && (
              <InfoCard icon={Maximize} label="المساحة" value={`${project.area_sqm} م²`} />
            )}
            {project.duration_days && (
              <InfoCard icon={Clock} label="المدة" value={`${project.duration_days} يوم`} />
            )}
            {project.execution_date && (
              <InfoCard icon={Calendar} label="تاريخ التنفيذ" value={new Date(project.execution_date).toLocaleDateString("ar-SA")} />
            )}
          </div>

          {/* Gallery */}
          {project.gallery_images && project.gallery_images.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-5">معرض الصور</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery_images.map((img, i) => (
                  <div key={i} className="zoom-container rounded-xl overflow-hidden glass">
                    <img src={img} alt={`${project.title} ${i + 1}`} className="zoom-image w-full h-56 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before & After */}
          {project.before_image && project.after_image && (
            <div>
              <h3 className="text-xl font-bold text-white mb-5">قبل و بعد</h3>
              <BeforeAfterSlider before={project.before_image} after={project.after_image} />
            </div>
          )}

          {/* Services */}
          {project.services_included && project.services_included.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-5">الخدمات المضمنة</h3>
              <div className="flex flex-wrap gap-3">
                {project.services_included.map((s, i) => (
                  <span key={i} className="glass-gold text-gold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {project.materials_used && project.materials_used.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-5">الخامات المستخدمة</h3>
              <div className="flex flex-wrap gap-3">
                {project.materials_used.map((m, i) => (
                  <span key={i} className="glass-light text-gray-300 text-sm px-4 py-2 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Testimonial */}
          {project.client_testimonial && (
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-gold text-lg">★</span>
                ))}
              </div>
              <p className="text-lg text-gray-200 leading-relaxed mb-4 italic">
                "{project.client_testimonial}"
              </p>
              {project.client_name && (
                <p className="text-gold font-bold">— {project.client_name}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <Icon className="w-5 h-5 text-gold mb-3" />
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);

  return (
    <div
      className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden glass select-none"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setPos(Math.max(0, Math.min(100, x)));
      }}
      onTouchMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        setPos(Math.max(0, Math.min(100, x)));
      }}
    >
      {/* After (full) */}
      <img src={after} alt="بعد" className="absolute inset-0 w-full h-full object-cover" />
      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="قبل" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      {/* Labels */}
      <span className="absolute top-4 right-4 glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full">قبل</span>
      <span className="absolute top-4 left-4 glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full">بعد</span>
      {/* Divider */}
      <div className="absolute top-0 bottom-0 w-1 bg-gold" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg">
          <span className="text-navy text-xs font-bold" style={{ color: "#0B1F3A" }}>⟷</span>
        </div>
      </div>
    </div>
  );
}
