import { getSiteContent } from "@/lib/content/fetch";
import { getProjects, type Project } from "@/lib/projects";
import type { Service, ServiceGroup } from "@/lib/content/types";
import { arabicLabelsOverlap } from "@/lib/arabic";

/**
 * The three service-group pages.
 *
 * ## Why groups and not one page per service
 *
 * There are 26 services in the catalogue, and each row holds a title and a
 * four-word description — "تصاميم عصرية وجودة عالية". That is enough to label a
 * card and nowhere near enough to carry a page. Twenty-six URLs built out of
 * twenty-six short phrases would be thin doorway pages: near-identical, no
 * substance of their own, and precisely what Google's spam policies name.
 *
 * The three groups the business already organises its catalogue by are a real
 * division of the work, and a group page has genuine material to stand on: the
 * seven to eleven services it contains, the execution process, and the projects
 * that actually included that work. Nothing on these pages is invented — the
 * only prose written for them is the intro, and it says what the service list
 * below it already says.
 *
 * If the `services` table ever grows a real long-form description column, a
 * per-service page becomes worth building. Until then this is the honest depth.
 */

export type GroupCopy = {
  /** Page <h1>. Names the work, not the group's internal label. */
  heading: string;
  /**
   * <title>, without the site name and without a separator of its own — the
   * layout template appends " | الكيان للتشطيبات". A pipe here as well produced
   * "…| تصميم 2D و 3D | الكيان للتشطيبات", which reads as a broken tag and runs
   * past the width Google will render.
   */
  title: string;
  description: string;
  /** Lead paragraph. Restates the service list below it; claims nothing more. */
  intro: string;
};

/**
 * Editorial copy per group slug.
 *
 * Keyed by the slug rather than positional, and every group falls back to text
 * generated from its own service titles (see `fallbackCopy`) — so an editor
 * adding a fourth group in Supabase gets a working page rather than a crash or
 * an empty one.
 *
 * Each intro below is a summary of that group's actual rows. No timescale, no
 * price, no client, no location, no claim of scale appears here that is not
 * already published elsewhere on the site.
 */
const COPY: Record<string, GroupCopy> = {
  finishing: {
    heading: "خدمات التشطيبات — شقق وفلل ومكاتب ومحلات",
    title: "تشطيب شقق وفلل ومكاتب ومحلات",
    description:
      "أعمال التشطيب الكاملة للوحدات السكنية والتجارية والإدارية: تشطيب شقق وفلل ومكاتب ومحلات وعيادات ومطاعم، من المعاينة والتصميم حتى تسليم المفتاح.",
    intro:
      "ننفذ أعمال التشطيب الكاملة للوحدات السكنية والتجارية والإدارية: من تشطيب الشقق والفلل إلى المكاتب والمحلات والعيادات والمطاعم والكافيهات ومقرات الشركات. يبدأ العمل بمعاينة الموقع وتحديد المتطلبات، ويمر بمراحل التصميم والعرض، وينتهي بتسليم المفتاح.",
  },
  design: {
    heading: "خدمات التصميم الداخلي والخارجي",
    title: "تصميم داخلي وخارجي وتصور 3D",
    description:
      "تصميم داخلي وخارجي بمخططات 2D دقيقة وتصور 3D يتيح رؤية المشروع قبل التنفيذ، ويشمل الواجهات والمداخل وتنسيق الحدائق والمناظر.",
    intro:
      "نصمم المساحة قبل تنفيذها. تبدأ المرحلة بمخططات 2D دقيقة للمساحة، ثم تصور 3D يتيح لك رؤية النتيجة واقعياً قبل بدء أي عمل. يشمل التصميم الجانب الداخلي والخارجي معاً: الواجهات والمداخل وتنسيق الحدائق والمناظر.",
  },
  specialized: {
    heading: "الأعمال المتخصصة وبنود التنفيذ",
    title: "أعمال متخصصة: كهرباء وسباكة ودهانات",
    description:
      "بنود التنفيذ المتخصصة: الإضاءة والسباكة والجبس بورد والدهانات والأرضيات والرخام والنجارة والألمنيوم وأنظمة المنزل الذكي والترميم والصيانة.",
    intro:
      "البنود الفنية التي تتكوّن منها أي عملية تشطيب، ننفذها ضمن المشروع المتكامل أو كأعمال مستقلة: أنظمة الإضاءة والكهرباء، السباكة، الجبس بورد، الدهانات، الأرضيات والرخام، النجارة والألمنيوم، وأنظمة المنزل الذكي، إضافة إلى أعمال الترميم والصيانة.",
  },
};

/** Copy for a group the map does not know, built from its own rows. */
function fallbackCopy(group: ServiceGroup, services: Service[]): GroupCopy {
  const names = services.slice(0, 6).map((service) => service.title).join("، ");
  const summary = names ? ` تشمل ${names}.` : "";

  return {
    heading: `خدمات ${group.label}`,
    title: `خدمات ${group.label}`,
    description: `خدمات ${group.label} من الكيان للتشطيبات.${summary}`.trim(),
    intro: `خدمات ${group.label} التي ننفذها.${summary}`.trim(),
  };
}

export type ServiceGroupPage = {
  group: ServiceGroup;
  services: Service[];
  copy: GroupCopy;
  /** Projects whose recorded scope overlaps this group. May be empty. */
  projects: Project[];
  /** The other groups, for sideways internal links. */
  siblings: ServiceGroup[];
};

/** Every group slug, for generateStaticParams and the sitemap. */
export async function getServiceGroupSlugs(): Promise<string[]> {
  const { serviceGroups } = await getSiteContent();

  return serviceGroups.map((group) => group.slug).filter(Boolean);
}

/**
 * Picks the projects that genuinely belong on a group's page.
 *
 * Matched on `services_included` — the list of work actually recorded against
 * each project — against the titles of this group's services. That is a fact
 * from the database, not a category guess: a project shows up under
 * "الأعمال المتخصصة" because someone recorded that those works were part of it.
 *
 * The comparison goes through `arabicLabelsOverlap` rather than string
 * equality, because the two tables were typed by different hands and disagree
 * on the definite article: the catalogue says "تشطيب الشقق", the projects say
 * "تشطيب شقق". Exact matching found one service out of twenty-six and left
 * every finishing page with no portfolio at all.
 *
 * Deliberately no fallback to "recent projects" when nothing matches. Padding
 * the page with unrelated work would tell a visitor, and a crawler, something
 * untrue about what that service has produced. An empty result renders no
 * section at all.
 */
function projectsForGroup(projects: Project[], services: Service[]): Project[] {
  const titles = services.map((service) => service.title);

  return projects
    .filter((project) =>
      (project.services_included ?? []).some((item) =>
        titles.some((title) => arabicLabelsOverlap(item, title))
      )
    )
    .slice(0, 6);
}

/**
 * Everything one service-group page needs, or null when the slug is unknown.
 *
 * A Supabase failure costs the projects strip and nothing else: getProjects
 * reports rather than throws, and the services come from the content layer,
 * which falls back to the shipped defaults.
 */
export async function getServiceGroupPage(slug: string): Promise<ServiceGroupPage | null> {
  const { serviceGroups, services } = await getSiteContent();

  const group = serviceGroups.find((candidate) => candidate.slug === slug);
  if (!group) return null;

  const groupServices = services
    .filter((service) => service.group_slug === group.slug)
    .sort((a, b) => a.sort_order - b.sort_order);

  const { projects } = await getProjects();

  return {
    group,
    services: groupServices,
    copy: COPY[group.slug] ?? fallbackCopy(group, groupServices),
    projects: projectsForGroup(projects, groupServices),
    siblings: serviceGroups.filter((candidate) => candidate.slug !== group.slug),
  };
}

/**
 * The service groups a project's recorded scope belongs to.
 *
 * The inverse of `projectsForGroup`, and it reads the same column: a project
 * links to "الأعمال المتخصصة" because its `services_included` names work that
 * belongs to that group, not because someone guessed from its category.
 *
 * Returns an empty array for a project with no recorded scope, and the caller
 * renders nothing — an "الخدمات المستخدمة" heading over no links is worse than
 * no heading.
 */
export async function groupsForProject(
  servicesIncluded: string[] | null | undefined
): Promise<ServiceGroup[]> {
  const scope = new Set((servicesIncluded ?? []).map((item) => item.trim()).filter(Boolean));
  if (scope.size === 0) return [];

  const { serviceGroups, services } = await getSiteContent();

  const recorded = Array.from(scope);
  const matchedSlugs = new Set(
    services
      .filter((service) => recorded.some((item) => arabicLabelsOverlap(item, service.title)))
      .map((service) => service.group_slug)
  );

  return serviceGroups.filter((group) => matchedSlugs.has(group.slug));
}
