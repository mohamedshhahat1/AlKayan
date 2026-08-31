"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { Lightbox, type LightboxImage } from "@/components/lightbox";
import { fittedBox, useNaturalRatio } from "@/hooks/use-natural-ratio";
import {
  categoryLabel,
  formatExecutionDate,
  hasBeforeAfter,
  projectGallery,
  projectSlug,
  type Project,
} from "@/lib/projects";
import { trackOnce, trackProjectView } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

/**
 * A single project.
 *
 * This is the old modal's content, unpicked and given a URL. Every block below
 * — the hero, the four info cards, the gallery, before/after, the service and
 * material chips, the testimonial — is the markup that was already there, with
 * the same classes; what changed is that it is now a page, so it can be linked,
 * shared, indexed and measured, and the gallery can open the Lightbox the
 * project already ships instead of being a grid of dead images.
 *
 * A client component because of the lightbox and the view event. The page that
 * renders it stays a server component and does the data fetching and metadata.
 */
export function ProjectDetail({ project }: { project: Project }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { ratio: heroRatio, onLoad: onHeroLoad } = useNaturalRatio(project.hero_image);

  const slug = projectSlug(project);
  const gallery = projectGallery(project);
  const executionDate = formatExecutionDate(project.execution_date);

  const lightboxImages: LightboxImage[] = gallery.map((src, index) => ({
    src,
    alt: `${project.title} — صورة ${index + 1}`,
  }));

  /**
   * One project_view per project per page load.
   *
   * An effect is the only place this can honestly live — the page may be
   * arrived at from a card, a search result or a shared link — but effects run
   * twice under React StrictMode in development, and any re-render of an
   * ancestor could run it again. trackOnce keys on the slug and holds the
   * decision for the lifetime of the page.
   */
  useEffect(() => {
    trackOnce(`project_view:${slug}`, () => {
      trackProjectView({ id: project.id, slug, name: project.title }, "project_detail");
    });
  }, [project.id, project.title, slug]);

  return (
    <article className="relative py-8 lg:py-12">
      <div className="container-luxury">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          <ArrowRight className="w-4 h-4 text-gold" aria-hidden="true" />
          كل المشاريع
        </Link>

        {/* Hero. The modal's header, unchanged apart from the rounded corners it
            needs now that it sits in a page rather than filling a dialog. */}
        <Reveal className="mt-5">
          {/* --fit-h is a ceiling, not a height: the box takes the hero's own
              shape, so a landscape photograph fills the width and a portrait one
              narrows instead of running the length of the page. It was h-96 at
              full width — near 3:1 — which cut half the height off every 3:2
              photograph in the table. */}
          <div
            className="relative mx-auto overflow-hidden rounded-3xl [--fit-h:20rem] sm:[--fit-h:28rem] lg:[--fit-h:34rem]"
            style={fittedBox(heroRatio)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.hero_image}
              // Named, not decorative. The h1 below sits on top of this image
              // but describes the project, not the photograph — and this is the
              // one image on the page a search engine has any reason to rank.
              alt={`${project.title} — ${categoryLabel(project.category)} من تنفيذ ${siteConfig.name}`}
              // The LCP element on every project page: it fills the top of the
              // viewport and nothing above it paints later. Left to the default
              // it competes with the gallery thumbnails below the fold.
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
              onLoad={onHeroLoad}
            />
            <div className="absolute inset-0 bg-image-scrim" />
            <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
              <span className="glass-gold text-gold text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">
                {categoryLabel(project.category)}
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white">{project.title}</h1>
              {project.title_en && (
                <p className="mt-2 text-sm text-gray-300" dir="ltr">
                  {project.title_en}
                </p>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 space-y-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {project.location && <InfoCard icon={MapPin} label="الموقع" value={project.location} />}
            {project.area_sqm != null && (
              <InfoCard icon={Maximize} label="المساحة" value={`${project.area_sqm} م²`} />
            )}
            {project.duration_days != null && (
              <InfoCard icon={Clock} label="المدة" value={`${project.duration_days} يوم`} />
            )}
            {executionDate && (
              <InfoCard icon={Calendar} label="تاريخ التنفيذ" value={executionDate} />
            )}
          </div>

          {/* Only rendered if the column exists and is filled in — `description`
              is not in the schema today, and nothing is invented for it. */}
          {project.description && (
            <p className="text-sm sm:text-base leading-8 text-muted-foreground max-w-3xl">
              {project.description}
            </p>
          )}

          {gallery.length > 1 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5">معرض الصور</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`تكبير الصورة ${index + 1}`}
                    className="zoom-container rounded-xl overflow-hidden glass block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`${project.title} — صورة ${index + 1}`}
                      loading="lazy"
                      // A thumbnail in a uniform grid is the one place a crop
                      // is right — the lightbox shows the whole image. 3:2 is
                      // the shape of nearly every row, so h-56 (nearer 16:9)
                      // was trimming them for nothing.
                      className="zoom-image w-full aspect-[3/2] object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasBeforeAfter(project) && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5">قبل و بعد</h2>
              <BeforeAfterSlider
                before={project.before_image}
                after={project.after_image}
                className="[--fit-h:26rem] sm:[--fit-h:28rem] rounded-2xl"
              />
              <p className="text-center text-muted-foreground text-xs mt-3">
                اسحب المقبض أو استخدم أسهم لوحة المفاتيح لرؤية الفرق
              </p>
            </div>
          )}

          {project.services_included && project.services_included.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5">الخدمات المضمنة</h2>
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
              <h2 className="text-xl font-bold text-foreground mb-5">الخامات المستخدمة</h2>
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
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          title={project.title}
        />
      )}
    </article>
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
