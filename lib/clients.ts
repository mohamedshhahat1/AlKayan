/**
 * Client names for the hero's trusted-by marquee.
 *
 * THESE ARE FICTIONAL PLACEHOLDERS. They were invented for the design and none
 * of them is a client of الكيان. Replace every entry with a client that has
 * actually agreed to be named before this reaches customers — a contractor
 * listing developers it has never worked for is a false endorsement, and the
 * named developer is the one party guaranteed to notice.
 *
 * One exported list rather than an array inline in the JSX, so swapping them is
 * a one-file edit and nobody has to read the hero to find out where they came
 * from.
 *
 * List each name once. ClientMarquee renders the list twice itself to close
 * its loop, so repeating entries here does not lengthen the strip evenly — it
 * makes those names appear four times against everyone else's two. The last
 * four entries were repeats of the first four and have been removed.
 */
export const heroClients = [
  "شركة الدهانات الفاخرة",
  "مجموعة البورسلان الدولية",
  "شركة أنظمة السمارت هوم",
  "مؤسسة الحجر الطبيعي",
  "شركة الرخام الملكي",
  "مجموعة الإضاءة الحديثة",
  "شركة الخشب الطبيعي",
  "مؤسسة الألمنيوم الذهبي",
] as const;
