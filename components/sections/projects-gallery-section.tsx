"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { categoryLabel, getProjects, selectFeatured, type Project } from "@/lib/projects";
import { siteConfig } from "@/lib/site-config";

/**
 * The homepage's circular project gallery.
 *
 * Wraps <CircularGallery /> the way the upstream demo does — a tall element
 * that provides the scroll range, with a sticky full-height child pinned inside
 * it — and feeds it the same `projects` rows the grid above uses, so there is
 * no second, hand-maintained list of work.
 *
 * Fetches in the browser like ProjectsSection does, for the same reason: the
 * rows are public and making every page that mounts this dynamic buys nothing.
 */

/** How many cards the ring holds before the cards start overlapping. */
const MAX_ITEMS = 10;

/**
 * Shown until the query resolves, and kept if it comes back empty.
 *
 * This section is a full viewport in the middle of the homepage, so an empty
 * ring would read as a broken layout rather than as an empty database — and an
 * unconfigured Supabase returns no rows at all.
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
    common: "تصميم ثلاثي الأبعاد",
    binomial: "تصاميم 3D",
    photo: {
      url: "https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "عرض ثلاثي الأبعاد لوحدة سكنية",
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
    common: "واجهة تجارية",
    binomial: "تشطيب تجاري",
    photo: {
      url: "https://images.pexels.com/photos/17174768/pexels-photo-17174768.jpeg?auto=compress&cs=tinysrgb&w=900",
      text: "واجهة وحدة تجارية بعد التنفيذ",
      pos: "50% 50%",
      by: siteConfig.name,
    },
  },
];

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

  for (const project of selectFeatured(projects)) {
    if (items.length >= MAX_ITEMS) break;

    const url = typeof project.hero_image === "string" ? project.hero_image.trim() : "";
    if (!url || seen.has(url)) continue;
    seen.add(url);

    items.push({
      common: project.title,
      // Second line: category, plus the location when there is one.
      binomial: [categoryLabel(project.category), project.location]
        .filter(Boolean)
        .join(" · "),
      photo: {
        url,
        // Alt text. The English title when it exists, since the Arabic title is
        // already announced as the card's group label.
        text: project.title_en?.trim() || project.title,
        by: siteConfig.name,
      },
    });
  }

  return items;
}

/**
 * The ring's radius, by viewport width.
 *
 * The published default of 600px assumes a desktop viewport: with a 2000px
 * perspective the front card is scaled to roughly 430px, so on a phone it would
 * be clipped by both edges of the screen. Measured on resize rather than with a
 * CSS media query because the value is a number passed to a transform.
 */
function useResponsiveRadius(): number {
  const [radius, setRadius] = useState(600);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setRadius(width < 640 ? 300 : width < 1024 ? 440 : 600);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return radius;
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
  // section, instead of onto the scroll through the whole homepage.
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(fallbackItems);
  const radius = useResponsiveRadius();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;

    getProjects().then(({ projects }) => {
      if (cancelled) return;

      const mapped = toGalleryItems(projects);
      // Keep the fallback rather than emptying the ring on a failed or
      // unconfigured query.
      if (mapped.length > 0) setItems(mapped);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="projects-gallery"
      aria-labelledby="projects-gallery-heading"
      className="bg-background text-foreground"
    >
      {/* The tall element: its height is the scroll range the rotation is
          mapped onto. Shorter on phones, where 300vh of pinned section is a lot
          of thumb. */}
      <div ref={scrollAreaRef} className="relative h-[220vh] sm:h-[300vh]">
        {/* Pinned for as long as the element above is being scrolled through. */}
        <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
          {/* top-24 clears the fixed header (see lib/header-offset.ts).
              pointer-events-none so the copy never eats a scroll or a click
              meant for the ring behind it. */}
          <div className="pointer-events-none absolute top-24 z-10 px-4 text-center sm:top-28">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.3em] text-gold sm:text-sm">
              معرض المشاريع
            </span>
            <h2
              id="projects-gallery-heading"
              className="text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl"
            >
              أعمالنا في عرض دائري
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">مرر لأسفل لتدوير المعرض</p>
          </div>

          <CircularGallery
            items={items}
            radius={radius}
            // 0 holds the ring still for anyone on reduced motion; scrolling
            // still turns it, because that is a direct response to input.
            autoRotateSpeed={prefersReducedMotion ? 0 : 0.02}
            scrollTargetRef={scrollAreaRef}
            creditLabel="تصوير:"
            aria-label="معرض مشاريع دائري"
            className="h-full w-full"
          />

          <Link
            href="/projects"
            className="absolute bottom-12 z-10 inline-flex items-center gap-2 rounded-full border border-border glass-light px-7 py-3 text-sm font-bold text-foreground transition-all duration-300 hover:border-gold/30 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft className="h-4 w-4 text-gold" aria-hidden="true" />
            عرض كل المشاريع
          </Link>
        </div>
      </div>
    </section>
  );
}
