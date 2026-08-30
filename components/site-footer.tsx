"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { BrandLogo, BrandWordmark } from "@/components/brand";
import { siteConfig } from "@/lib/site-config";
import { navLinks } from "@/lib/navigation";
import { isAnalyticsConfigured, resetConsent, trackPhoneClick } from "@/lib/analytics";

/**
 * The services listed here are labels, not links to eight separate pages: they
 * describe what the company does and all point at /services. Kept as text
 * rather than trimmed to the five nav routes, because "تشطيبات داخلية فاخرة"
 * is what someone scanning a footer is actually looking for.
 */
const services = [
  "تشطيبات داخلية فاخرة",
  "تصميم داخلي",
  "تصميم خارجي وواجهات",
  "مقاولات عامة",
  "إشراف هندسي",
  "ترميم وتجديد",
  "تنسيق حدائق",
  "أنظمة ذكية",
];

const socials = [
  { href: siteConfig.social.facebook, label: "فيسبوك", Icon: Facebook },
  { href: siteConfig.social.instagram, label: "انستغرام", Icon: Instagram },
].filter((item) => Boolean(item.href));

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-navy-deepest">
      <div className="container-luxury py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            {/* Nothing here labels the company, so the wordmark carries the
                accessible name and the mark beside it is decorative. */}
            <div className="flex items-center gap-3 mb-5">
              <BrandLogo alt="" className="h-14 shrink-0" />
              <BrandWordmark alt={siteConfig.name} imgClassName="h-7" tone="on-dark" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{siteConfig.shortDescription}</p>

            <ul className="flex items-center gap-3 mt-6">
              <li>
                <WhatsAppLink
                  placement="footer"
                  aria-label="واتساب"
                  className="w-10 h-10 rounded-full glass-on-dark flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </WhatsAppLink>
              </li>
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full glass-on-dark flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-links">
            <h2 id="footer-links" className="text-white font-bold mb-5">
              روابط سريعة
            </h2>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-white font-bold mb-5">خدماتنا</h2>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-sm text-gray-400 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-white font-bold mb-5">تواصل معنا</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={siteConfig.contact.telHref}
                  onClick={() => trackPhoneClick({ placement: "footer" })}
                  dir="ltr"
                  className="text-gray-400 hover:text-gold transition-colors"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={siteConfig.contact.mailtoHref}
                  className="text-gray-400 hover:text-gold transition-colors break-all"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={siteConfig.contact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gold transition-colors"
                >
                  {siteConfig.contact.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-400">
                  {siteConfig.hours.days}
                  <br />
                  {siteConfig.hours.time}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {year} {siteConfig.legalName}. جميع الحقوق محفوظة.
          </p>

          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-500">{siteConfig.contact.addressShort}</p>

            {/* Consent has to be revocable to mean anything. Hidden entirely
                when no analytics are configured — there would be nothing to
                change. */}
            {isAnalyticsConfigured && (
              <button
                type="button"
                onClick={resetConsent}
                className="text-xs text-gray-500 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
              >
                إعدادات التحليلات
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
