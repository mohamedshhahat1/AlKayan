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
 * Latin script on purpose: the marquee renders LTR and styles these as brand
 * marks rather than as body copy, which is why they are not translated.
 */
export const heroClients = [
  "NileStone Developments",
  "Cairo Heights",
  "Capital Living",
  "Royal Habitat",
  "UrbanCraft",
  "Prime Residence",
  "El Mansoura Properties",
  "Grand Avenue",
  "ModernNest",
  "Vertex Construction",
  "Elite Homes Egypt",
  "Horizon Properties",
] as const;
