"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { ProjectCard } from "@/components/project-card";
import { categoryLabel, getProjects, selectFeatured, type Project } from "@/lib/projects";

type Status = "loading" | "ready" | "error";

/** How many cards to show before the user asks for the rest. */
const INITIAL_VISIBLE = 6;

const beforeAfterProjects = [
  {
    before:
      "https://images.pexels.com/photos/15087186/pexels-photo-15087186.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after:
      "https://images.pexels.com/photos/7546323/pexels-photo-7546323.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "شقة النخبة - التجمع الخامس",
  },
  {
    before:
      "https://images.pexels.com/photos/19408681/pexels-photo-19408681.jpeg?auto=compress&cs=tinysrgb&w=1920",
    after:
      "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "فيلا الياسمين - الشيخ زايد",
  },
];

export type ProjectsSectionProps = {
  /** Homepage: only projects ticked `featured`, falling back to the newest. */
  featuredOnly?: boolean;
  /** Cap the grid. Omit on /projects, where INITIAL_VISIBLE and "show all" apply. */
  limit?: number;
  showFilters?: boolean;
  showBeforeAfter?: boolean;
  /**
   * Turns "show all" from a local expand into a link. Set on the homepage,
   * where the rest of the portfolio is a page rather than more DOM.
   */
  showAllHref?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  /** Reporting label for the cards, e.g. "home_featured". */
  placement?: string;
};

/**
 * The projects grid.
 *
 * One component, two jobs: a six-card teaser on the homepage that links onward,
 * and the full filterable gallery on /projects. Everything that differs is a
 * prop, because the alternative — a second copy of this file for the homepage —
 * is how two grids end up drifting apart.
 *
 * Still fetches in the browser, as it always did. The rows are public,
 * the section shows skeletons while they arrive, and moving the query to the
 * server would make every page that mounts this dynamic for no visible gain.
 */
export function ProjectsSection({
  featuredOnly = false,
  limit,
  showFilters = true,
  showBeforeAfter = true,
  showAllHref,
  eyebrow = "مشاريعنا",
  title = "معرض أعمالنا الفاخرة",
  subtitle = "نطرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية",
  placement,
}: ProjectsSectionProps = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getProjects().then(({ projects: rows, failed }) => {
      if (cancelled) return;

      if (failed) {
        setStatus("error");
        return;
      }

      setProjects(rows);
      setStatus("ready");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const pool = featuredOnly ? selectFeatured(projects) : projects;

  // Only offer filters that actually match something.
  const availableCategories = Array.from(new Set(pool.map((project) => project.category)));
  const categories = ["all", ...availableCategories];

  const filtered =
    activeCategory === "all" ? pool : pool.filter((project) => project.category === activeCategory);

  // Two ways to hold back cards, and they are mutually exclusive: a hard limit
  // when there is a page to send people to, otherwise the local expand.
  const cap = showAllHref ? limit : showAll ? undefined : limit ?? INITIAL_VISIBLE;
  const visible = typeof cap === "number" ? filtered.slice(0, cap) : filtered;
  const hiddenCount = filtered.length - visible.length;

  return (
    <section id="projects" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

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

        {status === "ready" && pool.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground">سيتم إضافة المشاريع قريباً.</p>
        )}

        {status === "ready" && pool.length > 0 && (
          <>
            {showFilters && (
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
            )}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 0.08} y={30}>
                  <ProjectCard project={project} placement={placement} />
                </Reveal>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="mt-8 text-center text-muted-foreground">لا توجد مشاريع في هذا التصنيف.</p>
            )}

            {showAllHref ? (
              <div className="mt-8 text-center">
                <Link
                  href={showAllHref}
                  className="inline-flex items-center gap-2 glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Plus className="w-4 h-4 text-gold" aria-hidden="true" />
                  عرض كل المشاريع
                </Link>
              </div>
            ) : (
              hiddenCount > 0 && (
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
              )
            )}
          </>
        )}

        {/* Before / after used to be a section of its own, arguing the same
            point as the gallery above it. Off on the homepage, which already
            has enough to say. */}
        {showBeforeAfter && <BeforeAfterBlock />}
      </div>
    </section>
  );
}

function BeforeAfterBlock() {
  const [active, setActive] = useState(0);
  const project = beforeAfterProjects[active];

  return (
    <div id="before-after" className="mt-14 pt-10 border-t border-border">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="inline-block text-xs font-bold tracking-[0.3em] text-gold uppercase mb-2">
              قبل و بعد
            </span>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-foreground">شاهد التحول بنفسك</h3>
          </div>

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
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-6">
        <BeforeAfterSlider
          key={project.title}
          before={project.before}
          after={project.after}
          className="h-64 sm:h-80 lg:h-[420px] rounded-3xl"
        />
        <p className="text-center text-muted-foreground text-xs mt-3">
          اسحب المقبض أو استخدم أسهم لوحة المفاتيح لروية الفرق
        </p>
      </Reveal>
    </div>
  );
}
