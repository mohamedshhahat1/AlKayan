"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { categoryLabel, projectSlug, type Project } from "@/lib/projects";
import { trackProjectView } from "@/lib/analytics";

/**
 * A project card.
 *
 * Lifted out of the projects section so the grid, and anything else that needs
 * to show a project, share one card. The markup and every class is the card the
 * section shipped with; the only change is what it is: a <Link> to the project's
 * own page rather than a <button> that opened a modal.
 *
 * That is the whole point of the refactor — a modal has no URL, so a project
 * could not be shared, linked, indexed or measured. Now it can be all four.
 *
 * The slug is URL-encoded because it may be Arabic, which is legal in a URL but
 * has to be percent-escaped to survive one.
 */
export function ProjectCard({
  project,
  placement = "projects_grid",
}: {
  project: Project;
  /** Which grid this card sits in, e.g. "home_featured". */
  placement?: string;
}) {
  const slug = projectSlug(project);

  return (
    <Link
      href={`/projects/${encodeURIComponent(slug)}`}
      onClick={() =>
        trackProjectView({ id: project.id, slug, name: project.title }, placement)
      }
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
    </Link>
  );
}
