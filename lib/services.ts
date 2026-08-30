import { getSiteContent } from "@/lib/content/fetch";

/**
 * Server-side questions about the service catalogue.
 *
 * The catalogue itself used to live here as a TypeScript constant. It now
 * lives in Supabase (see lib/content), because a contractor's list of services
 * is exactly the kind of thing that changes without a developer present.
 *
 * What is left is the one question that has to be answered on the server,
 * where the React context is not available.
 */

/**
 * Is this the title of a real, published service?
 *
 * Used to vet the ?service= query parameter before it is prefilled into the
 * booking form. The value arrives from a URL, so it is attacker-controlled:
 * an unrecognised one is dropped rather than rendered, which is what keeps a
 * crafted link from putting arbitrary text into the form — and into the lead
 * that text would otherwise be submitted with.
 *
 * Async now, because the catalogue is a database read. Matching against
 * published services only is deliberate: a service an editor has taken off the
 * site should not still be selectable through an old link.
 */
export async function isKnownService(title: string): Promise<boolean> {
  const { services } = await getSiteContent();
  return services.some((service) => service.title === title);
}
