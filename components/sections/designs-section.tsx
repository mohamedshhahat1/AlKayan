"use client";

import { Reveal, SectionHeading } from "@/components/reveal";
import { Lightbox, type LightboxImage } from "@/components/lightbox";
import { useMemo, useState } from "react";
import { useContent, useDesignImages, useHeading } from "@/lib/content/context";

/**
 * The grid requests images at w=940. Re-point that parameter rather than
 * reusing one size everywhere: a 940px file is wasteful as an 80px thumbnail
 * and soft when blown up full-screen.
 *
 * Only rewrites a URL that actually carries `w=940` — the seeded Pexels URLs
 * do, but an editor pasting a link to their own storage will not, and that URL
 * must be passed through untouched rather than silently mangled.
 */
const atWidth = (url: string, width: number) =>
  url.includes("w=940") ? url.replace("w=940", `w=${width}`) : url;

export function DesignsSection() {
  const { designCategories } = useContent();
  const heading = useHeading("designs");

  const [active, setActive] = useState(() => designCategories[0]?.slug ?? "");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Falls back to the first category rather than asserting. The categories come
  // from the database and can change under the state that points at one.
  const activeCategory =
    designCategories.find((category) => category.slug === active) ?? designCategories[0];

  const images = useDesignImages(activeCategory?.slug ?? "");

  // Only the active category is passed to the viewer, which is what confines
  // next/previous to the current tab. Memoised so navigating between images
  // does not rebuild the array and re-render every thumbnail.
  const lightboxImages = useMemo<LightboxImage[]>(
    () =>
      images.map((image, i) => ({
        src: atWidth(image.image_url, 1600),
        thumb: atWidth(image.image_url, 240),
        alt: `${activeCategory?.label ?? ""} ${i + 1}`,
      })),
    [images, activeCategory]
  );

  const selectCategory = (id: string) => {
    setActive(id);
    // Indices refer to the previous array, so anything open is now meaningless.
    setOpenIndex(null);
  };

  return (
    <section id="designs" className="relative py-14 lg:py-20 overflow-hidden">
      <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4AF37, transparent)" }} />

      <div className="container-luxury">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          subtitle={heading.subtitle ?? undefined}
        />

        {/* Tabs */}
        <Reveal delay={0.15} className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {designCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.slug)}
                aria-pressed={activeCategory?.slug === category.slug}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  activeCategory?.slug === category.slug
                    ? "gold-gradient-bg text-on-gold"
                    : "glass-light text-muted-foreground hover:text-gold hover:border-gold/30"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Gallery */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, i) => (
            <Reveal key={image.id} delay={(i % 3) * 0.08} y={20}>
              {/* A button rather than a div: this is now interactive, so it has
                  to be reachable by keyboard and announced as an action. */}
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`عرض ${activeCategory?.label ?? ""} ${i + 1} بالحجم الكامل`}
                className="zoom-container relative w-full rounded-2xl overflow-hidden glass group cursor-pointer text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <img
                  src={image.image_url}
                  alt={`${activeCategory?.label ?? ""} ${i + 1}`}
                  className="zoom-image w-full h-40 sm:h-48 lg:h-52 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(11,31,58,0.8) 100%)" }}>
                  <span className="text-white text-sm font-bold">{activeCategory?.label}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox
        images={lightboxImages}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        title={activeCategory?.label ?? ""}
      />
    </section>
  );
}
