import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";
import { headerOffsetClass } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";
import { isKnownService } from "@/lib/services";

export const metadata: Metadata = pageMetadata({
  title: "تواصل معنا",
  description:
    "معاينة واستشارة مجانية ورد من فريقنا خلال 24 ساعة. احجز استشارتك عبر النموذج، أو تواصل معنا هاتفياً أو عبر واتساب.",
  path: "/contact",
});

type ContactPageProps = {
  searchParams: { service?: string | string[] };
};

/**
 * The contact page.
 *
 * ?service= lets a service card carry its subject into the form, which is the
 * difference between "someone enquired" and "someone enquired about smart home
 * wiring". The value is checked against the real catalogue before it is used:
 * it arrives from a URL, so it is attacker-controlled, and an unrecognised one
 * is dropped rather than rendered.
 */
export default async function ContactPage({ searchParams }: ContactPageProps) {
  const requested = typeof searchParams.service === "string" ? searchParams.service : undefined;
  // Async because the catalogue is a Supabase read now, not a module constant.
  const defaultService = requested && (await isKnownService(requested)) ? requested : undefined;

  return (
    <div className={headerOffsetClass}>
      <ContactSection source="contact_page" defaultService={defaultService} />
    </div>
  );
}
