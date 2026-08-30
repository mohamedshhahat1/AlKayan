"use client";

import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Logo } from "@/components/brand/logo";
import { useSiteDetails } from "@/lib/content/context";
import { siteConfig } from "@/lib/site-config";

const quickLinks = [
  { href: "#hero", label: "الرئيسية" },
  { href: "#about", label: "من نحن" },
  { href: "#services", label: "خدماتنا" },
  { href: "#projects", label: "مشاريعنا" },
  { href: "#designs", label: "التصاميم" },
  { href: "#testimonials", label: "آراء العملاء" },
  { href: "#faq", label: "الأسئلة الشائعة" },
  { href: "#contact", label: "تواصل معنا" },
];

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
  const { contact, hours } = useSiteDetails();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-navy-deepest">
      <div className="container-luxury py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Logo
              variant="lockup"
              size="sm"
              className="mb-5"
              descriptorClassName="text-gray-400"
            />
            <p className="text-sm text-gray-400 leading-relaxed">{siteConfig.shortDescription}</p>

            {/* WhatsApp is always available, so the list always renders; the
                optional social profiles below it may be empty. */}
            <ul className="flex items-center gap-3 mt-6">
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="واتساب"
                  className="w-10 h-10 rounded-full glass-on-dark flex items-center justify-center text-gray-300 hover:text-gold hover:border-gold/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </a>
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
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-white font-bold mb-5">خدماتنا</h2>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="text-sm text-gray-400 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                  >
                    {service}
                  </a>
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
                  href={contact.telHref}
                  dir="ltr"
                  className="text-gray-400 hover:text-gold transition-colors"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={contact.mailtoHref}
                  className="text-gray-400 hover:text-gold transition-colors break-all"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <a
                  href={contact.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gold transition-colors"
                >
                  {contact.address}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-gray-400">
                  {hours.days}
                  <br />
                  {hours.time}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {year} {siteConfig.legalName}. جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-gray-500">{contact.addressShort}</p>
        </div>
      </div>
    </footer>
  );
}
