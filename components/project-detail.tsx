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
import { CallCta } from "@/components/call-cta";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  categoryLabel,
  formatExecutionDate,
  hasBeforeAfter,
  projectGallery,
  projectSlug,
  type Project,
} from "@/lib/projects";
import { trackOnce, trackProjectView } from "@/lib/analytics";

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
          <div className="relative h-72 sm:h-96 overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.hero_image} alt="" className="w-full h-full object-cover" />
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
                      className="zoom-image w-full h-56 object-cover"
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
                className="h-72 sm:h-96 rounded-2xl"
              />
              <p className="text-center text-muted-foreground text-xs mt-3">
                اسحب المقبض أو استخدم أسهم لوحة المفاتيح لروية الفرق
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

          {/* CTA. Same card as the contact section, so the ask looks the same
              wherever it appears. The WhatsApp link carries the slug, which is
              how an enquiry gets attributed to the project that prompted it. */}
          <Reveal>
            <div className="glass rounded-3xl border border-gold/20 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 text-center lg:text-right">
              <div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-foreground">
                  أعجبك <span className="gold-gradient-text">هذا المشروع؟</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  تحدث معنا عن مشروعك — معاينة واستشارة مجانية
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                <CallCta className="flex justify-center" placement="project_detail" />

                <WhatsAppLink
                  placement="project_detail"
                  projectSlug={slug}
                  className="glass-light border border-border text-foreground font-bold text-sm px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:text-gold hover:border-gold/30 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-gold" />
                  واتساب
                </WhatsAppLink>
              </div>
            </div>
          </Reveal>
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
