/**
 * Shapes for every piece of editable site content.
 *
 * One rule runs through all of these: an icon is stored as a *name*, never as
 * a component. The database can only hold a string, and the string is resolved
 * against a fixed allow-list in lib/content/icons.ts. That keeps the icon set a
 * deliberate design decision rather than whatever an editor happens to type,
 * and it stops the whole lucide-react catalogue being pulled into the bundle.
 *
 * This supersedes the note in lib/services.ts about icons being "part of the
 * data rather than looked up by name". That was the right call while the
 * catalogue was a TypeScript constant — a component reference cannot be wrong.
 * It stops being available the moment the catalogue lives in Postgres.
 */

export type IconName = string;

/** A row that can be reordered and taken off the site without being deleted. */
type Listed = {
  id: string;
  sort_order: number;
};

export type ServiceGroup = Listed & {
  slug: string;
  label: string;
};

export type Service = Listed & {
  group_slug: string;
  icon: IconName;
  title: string;
  description: string;
};

/** The four strengths on /about. Longer prose than a service card. */
export type AboutFeature = Listed & {
  icon: IconName;
  title: string;
  description: string;
};

/**
 * The three figures beside the About intro.
 *
 * `value` is free text ("+15", "100%"), not a number: these are typeset as
 * given and never counted up, unlike `Stat` below.
 */
export type AboutStat = Listed & {
  value: string;
  label: string;
};

export type ProcessStep = Listed & {
  icon: IconName;
  title: string;
  description: string;
};

/** A counter on the social-proof band. Animated from zero, so `target` is numeric. */
export type Stat = Listed & {
  /** Emoji rather than an icon name — these are pictorial, not UI icons. */
  emoji: string;
  target: number;
  suffix: string;
  label: string;
};

export type Faq = Listed & {
  question: string;
  answer: string;
};

export type DesignCategory = Listed & {
  slug: string;
  label: string;
};

export type DesignImage = Listed & {
  category_slug: string;
  image_url: string;
};

export type BeforeAfterPair = Listed & {
  title: string;
  before_image: string;
  after_image: string;
};

/** An option in the booking form's service dropdown. */
export type ServiceOption = Listed & {
  label: string;
};

/** A line in the footer's services column. */
export type FooterService = Listed & {
  label: string;
};

/**
 * A name in the hero's trusted-by marquee.
 *
 * List each client once. ClientMarquee renders the list twice itself to close
 * its loop; repeating a row here makes that name appear four times against
 * everyone else's two.
 */
export type HeroClient = Listed & {
  name: string;
};

/**
 * The eyebrow / title / subtitle triple above a section, keyed by section.
 * `subtitle` is nullable because some blocks deliberately have none.
 */
export type SectionHeading = {
  section: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
};

/**
 * Loose strings that do not belong to a list: contact details, opening hours,
 * warranty terms, hero copy, CTA labels.
 *
 * A key/value table rather than a column per string. There are dozens of them
 * and they are added to whenever a section gains a line of copy; a wide table
 * would need a migration every time, and a migration is exactly the thing this
 * work exists to avoid.
 */
export type SiteSettings = Record<string, string>;

/** Everything the site needs, resolved and ready to render. */
export type SiteContent = {
  settings: SiteSettings;
  headings: Record<string, SectionHeading>;
  serviceGroups: ServiceGroup[];
  services: Service[];
  aboutFeatures: AboutFeature[];
  aboutStats: AboutStat[];
  processSteps: ProcessStep[];
  stats: Stat[];
  faqs: Faq[];
  designCategories: DesignCategory[];
  designImages: DesignImage[];
  beforeAfter: BeforeAfterPair[];
  serviceOptions: ServiceOption[];
  footerServices: FooterService[];
  heroClients: HeroClient[];
};
