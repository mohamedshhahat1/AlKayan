import {
  Award, Box, Briefcase, Building, Building2, Clock, Cpu, DollarSign,
  DoorOpen, Droplets, FileText, Flower2, Gem, Grid3x3, Headset, Home,
  KeyRound, Layers, MessageSquare, Paintbrush, Palette, PencilRuler,
  RefreshCw, Ruler, ShieldCheck, Sofa, Sparkles, Stethoscope, Store, Sun,
  Trees, TreePine, Users, UtensilsCrossed, Wrench, Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons an editor may choose from, keyed by the name stored in the
 * database.
 *
 * An explicit allow-list, not a dynamic lookup into lucide-react. Two reasons,
 * and both matter:
 *
 *   Bundle. `lucide-react`'s index re-exports well over a thousand components.
 *   Resolving a name against it at runtime defeats tree-shaking and would pull
 *   the entire catalogue into the client bundle — several hundred kilobytes to
 *   render thirty-six icons.
 *
 *   Design. The icon set is part of the visual system. An editor typing a name
 *   that happens to exist should not be able to introduce a hand-drawn or
 *   filled icon into a page built from one consistent stroke weight. Adding to
 *   the set is a deliberate act: import it here, and it becomes available.
 *
 * Keep this list sorted so a name is easy to find, and keep it in step with
 * lib/content/defaults.ts — every icon named there must appear here.
 */
const ICONS = {
  Award, Box, Briefcase, Building, Building2, Clock, Cpu, DollarSign,
  DoorOpen, Droplets, FileText, Flower2, Gem, Grid3x3, Headset, Home,
  KeyRound, Layers, MessageSquare, Paintbrush, Palette, PencilRuler,
  RefreshCw, Ruler, ShieldCheck, Sofa, Sparkles, Stethoscope, Store, Sun,
  Trees, TreePine, Users, UtensilsCrossed, Wrench, Zap,
} satisfies Record<string, LucideIcon>;

/** Every name this project will render. Useful when documenting the tables. */
export const iconNames = Object.keys(ICONS).sort();

/**
 * Resolves a stored icon name to a component.
 *
 * Falls back to a neutral square rather than throwing or rendering nothing: a
 * typo in one row of `services` should cost that row its icon, not take down
 * the section around it — and an empty slot in a grid of bordered tiles reads
 * as a rendering bug, where a plain box reads as a missing choice.
 */
export function resolveIcon(name: string): LucideIcon {
  return ICONS[name as keyof typeof ICONS] ?? Box;
}
