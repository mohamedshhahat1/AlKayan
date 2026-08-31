"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { SectionHeading } from "@/components/reveal";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { categoryLabel, getProjects, selectFeatured, type Project } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

/**
 * The homepage's projects section: a scroll-driven circular gallery.
 *
 * This replaced the six-card grid on the homepage, so it carries what the grid
 * carried here — the heading, the id the header's /#projects anchor points at,
 * and the link on to /projects. The grid itself is unchanged and still owns
 * /projects, where the filters, the before/after block and the per-project
 * cards live.
 *
 * Structure follows the upstream demo: a tall element supplies the scroll range
 * and a full-height child is pinned inside it. The rows come from the same
 * `projects` query the grid uses, ordered by the same selectFeatured(), so the
 * homepage and /projects can never show two different ideas of "featured".
 *
 * Fetches in the browser for the same reason the grid does: the rows are public,
 * and making every page that mounts this dynamic buys nothing.
 */

/** How many cards the ring holds before they start to overlap. */
const MAX_ITEMS = 10;

/**
 * Shown until the query resolves, and kept if it comes back empty.
 *
 * This is now the only projects section on the homepage, so an empty ring would
 * leave a viewport-tall hole rather than read as an empty database — and an
 * unconfigured Supabase returns no rows at all. These are labelled by type of
 * work rather than given project names, and the hint line says they are samples,
 * so nothing here claims to be delivered work that isn't.
 */
const fallbackItems: GalleryItem[] = [
  {
    common: "فيلا سكنية",
    binomial: "تصميم خارجي",
    photo: {
      url: "https://images.pexels.com/photos/16573669/pexels-photo-16573669.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "واجهة فيلا سكنية بعد التنفيذ",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
  {
    common: "صالة استقبال",
    binomial: "تشطيب داخلي",
    photo: {
      url: "https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "صالة استقبال بعد التشطيب",
      pos: "50% 45%",
      by: siteConfig.name,
    },
  },
  {
    common: "مكتب إداري",
    binomial: "تشطيب مكاتب",
    photo: {
      url: "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "مكتب إداري بعد التشطيب",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
  {
    common: "مطبخ حديث",
    binomial: "تشطيب داخلي",
    photo: {
      url: "https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "مطبخ حديث بعد التشطيب",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
  {
    common: "غرفة معيشة",
    binomial: "تصميم داخلي",
    photo: {
      url: "https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "غرفة معيشة بعد التصميم",
      pos: "50% 45%",
      by: siteConfig.name,
    },
  },
  {
    common: "حديقة خارجية",
    binomial: "تنسيق حدائق",
    photo: {
      url: "https://images.pexels.com/photos/8134745/pexels-photo-8134745.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "تنسيق حديقة خارجية",
      pos: "50% 55%",
      by: siteConfig.name,
    },
  },
  {
    common: "واجهة تجارية",
    binomial: "تشطيب تجاري",
    photo: {
      url: "https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "واجهة وحدة تجارية بعد التنفيذ",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
  {
    common: "وحدة سكنية",
    binomial: "تشطيب متكامل",
    photo: {
      url: "https://images.pexels.com/photos/8142047/pexels-photo-8142047.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "وحدة سكنية بعد التشطيب المتكامل",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
];

/**
 * Every project, featured ones first.
 *
 * selectFeatured() still decides what "featured" means and what leads the ring,
 * so the homepage and /projects agree on that. But the ring holds MAX_ITEMS and
 * the table is smaller than that, so the projects nobody ticked follow the ones
 * who were rather than being dropped: a half-empty ring is a worse homepage
 * than one that shows the whole portfolio in a curated order.
 */
function orderedForGallery(projects: Project[]): Project[] {
  const featured = selectFeatured(projects);
  const chosen = new Set(featured.map((project) => project.id));

  return [...featured, ...projects.filter((project) => !chosen.has(project.id))];
}

/**
 * Projects to gallery items.
 *
 * De-duplicated by image URL because the component keys its cards on
 * `item.photo.url`, so two projects sharing a hero image would collide on the
 * same React key.
 */
function toGalleryItems(projects: Project[]): GalleryItem[] {
  const seen = new Set<string>();
  const items: GalleryItem[] = [];

  for (const project of orderedForGallery(projects)) {
    if (items.length >= MAX_ITEMS) break;

    const url = typeof project.hero_image === "string" ? project.hero_image.trim() : "";
    if (!url || seen.has(url)) continue;
    seen.add(url);

    items.push({
      common: project.title,
      // Second line: category, plus the location when there is one.
      binomial: [categoryLabel(project.category), project.location].filter(Boolean).join(" · "),
      photo: {
        url,
        // Alt text. The English title when there is one, since the Arabic title
        // is already announced as the card's group label.
        text: project.title_en?.trim() || project.title,
        by: siteConfig.name,
      },
    });
  }

  return items;
}

/**
 * The ring's dimensions, by viewport width.
 *
 * The published numbers — a 600px radius and 300x400 cards — assume a desktop
 * viewport, and the radius alone was made responsive first. That was not
 * enough: perspective scales the front card by p/(p-radius), so even at a
 * phone-sized radius of 300 the 300px card rendered 353px wide, all but filling
 * a 390px screen while its two neighbours were sliced in half by the pinned
 * container's overflow-hidden. The card has to shrink with the ring.
 *
 * Each row below keeps the front card wide enough to be the subject with the
 * neighbours reading as the rest of a ring. The phone card is taller than the
 * published 3:4 — a phone has height to spare and width it cannot lend, so the
 * ring earns its size vertically. It is still bounded by the shortest phones:
 * perspective renders the 320px card 364px tall, which a centred pinned area
 * would start level with the hint line — hence the pt on that area and the
 * notch the hint itself moves up by, which together clear it down to a 600px
 * viewport.
 *
 * Measured on resize rather than with a CSS media query because these are
 * numbers passed to a transform, not classes.
 */
type RingSize = { radius: number; cardWidth: number; cardHeight: number };

const DESKTOP_RING: RingSize = { radius: 600, cardWidth: 300, cardHeight: 400 };
const TABLET_RING: RingSize = { radius: 440, cardWidth: 250, cardHeight: 335 };
const PHONE_RING: RingSize = { radius: 240, cardWidth: 230, cardHeight: 320 };

function useResponsiveRing(): RingSize {
  const [size, setSize] = useState<RingSize>(DESKTOP_RING);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setSize(width < 640 ? PHONE_RING : width < 1024 ? TABLET_RING : DESKTOP_RING);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

/** True when the visitor has asked the OS for less animation. */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}

export function ProjectsGallerySection() {
  // Handed to the gallery so one full turn maps onto the scroll through this
  // section, rather than onto the scroll through the whole homepage.
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(fallbackItems);
  // Which of the two sets the ring is showing. Drives the hint line only.
  const [showingProjects, setShowingProjects] = useState(false);
  const ring = useResponsiveRing();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;

    getProjects().then(({ projects }) => {
      if (cancelled) return;

      const mapped = toGalleryItems(projects);
      // Keep the fallback rather than emptying the ring on a failed or
      // unconfigured query.
      if (mapped.length === 0) return;

      setItems(mapped);
      setShowingProjects(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // id="projects": inherited from the grid this replaced, which is what the
    // header's /#projects link and lib/navigation.ts expect to find here.
    <section id="projects" className="relative py-14 lg:py-20">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="مشاريعنا"
          title="معرض أعمالنا الفاخرة"
          subtitle="نظرة على بعض مشاريعنا التي نفذناها بأعلى معايير الجودة والاحترافية"
        />
      </div>

      {/* The tall element: its height is the scroll range the rotation maps
          onto. Shorter on phones, where 300vh of pinned section is a lot of
          thumb. */}
      <div ref={scrollAreaRef} className="relative mt-8 h-[220vh] sm:h-[300vh]">
        {/* Pinned for as long as the element above is being scrolled through. */}
        {/* pt on phones only: the ring is centred in this box, and on a short
            phone a centred card of the size below starts level with the hint
            line. The padding gives the hint its own band and pushes the ring
            into the space underneath it. */}
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden pt-12 sm:pt-0">
          {/* The top offsets clear the fixed header (see lib/header-offset.ts);
              the phone one is a notch tighter to leave the taller phone card
              its room. pointer-events-none so the hint never swallows a gesture
              meant for the ring behind it. */}
          <p className="pointer-events-none absolute top-20 z-10 px-4 text-center text-sm text-muted-foreground sm:top-28">
            {showingProjects
              ? "مرر لأسفل لتدوير المعرض"
              : "نماذج من تصاميمنا — مرر لأسفل لتدوير المعرض"}
          </p>

          <CircularGallery
            items={items}
            radius={ring.radius}
            cardWidth={ring.cardWidth}
            cardHeight={ring.cardHeight}
            // 0 holds the ring still for anyone on reduced motion; scrolling
            // still turns it, because that is a direct response to input.
            autoRotateSpeed={prefersReducedMotion ? 0 : 0.02}
            scrollTargetRef={scrollAreaRef}
            creditLabel="تصوير:"
            aria-label="معرض مشاريع دائري"
            className="h-full w-full"
          />
        </div>
      </div>

      {/* The homepage's only route to the portfolio now that the grid is gone.
          In flow, below the pinned area, so it is reachable by tab and by thumb
          instead of floating over a rotating ring. */}
      <div className="container-luxury mt-8 text-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Plus className="w-4 h-4 text-gold" aria-hidden="true" />
          عرض كل المشاريع
        </Link>
      </div>
    </section>
  );
}
