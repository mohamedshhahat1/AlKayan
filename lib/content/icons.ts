import {
  Award, Box, Briefcase, Building, Building2, Clock3, Cpu, DoorOpen,
  Droplets, FileText, Flower2, Gem, Grid3x3, Home, KeyRound, Layers,
  MessageSquare, Paintbrush, Palette, PencilRuler, RefreshCw, Ruler,
  ShieldCheck, Sofa, Stethoscope, Store, Sun, TreePine, Trees, Users,
  UtensilsCrossed, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons an editor may choose from, keyed by the name stored in the
 * database.
 *
 * An explicit allow-list, not a dynamic lookup into lucide-react. Two reasons,
 * and both matter:
 *
 *   Bundle. lucide-react's index re-exports well over a thousand components.
 *   Resolving a name against it at runtime defeats tree-shaking and would pull
 *   the whole catalogue into the client bundle to render thirty-three icons.
 *
 *   Design. The icon set is part of the visual system — one stroke weight, one
 *   drawing style. An editor typing a name that happens to exist should not be
 *   able to drop a filled or hand-drawn icon into a grid built from outlines.
 *   Adding to the set is a deliberate act: import it here and it is available.
 *
 * This replaces the arrangement in lib/services.ts, where the icon component
 * was a field on the service. That was the stronger design while the catalogue
 * was a TypeScript constant — a component reference cannot be misspelled — and
 * it stops being possible once the catalogue lives in Postgres.
 *
 * Keep the list sorted, and keep it in step with lib/content/defaults.ts:
 * every icon named there must appear here.
 */
const ICONS = {
  Award, Box, Briefcase, Building, Building2, Clock3, Cpu, DoorOpen,
  Droplets, FileText, Flower2, Gem, Grid3x3, Home, KeyRound, Layers,
  MessageSquare, Paintbrush, Palette, PencilRuler, RefreshCw, Ruler,
  ShieldCheck, Sofa, Stethoscope, Store, Sun, TreePine, Trees, Users,
  UtensilsCrossed, Wrench, Zap,
} satisfies Record<string, LucideIcon>;

/** Every name this project will render. Handy when documenting the tables. */
export const iconNames = Object.keys(ICONS).sort();

/**
 * Resolves a stored icon name to a component.
 *
 * Falls back to a neutral square rather than throwing or rendering nothing: a
 * typo in one row of `services` should cost that row its icon, not take down
 * the section around it — and an empty slot inside a bordered tile reads as a
 * rendering bug, where a plain box reads as a choice nobody has made yet.
 */
export function resolveIcon(name: string): LucideIcon {
  return ICONS[name as keyof typeof ICONS] ?? Box;
}
