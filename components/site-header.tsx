"use client";

import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { lockScroll, unlockScroll } from "@/lib/lenis";

const navLinks = [
  { href: "#hero", label: "الرئيسية" },
  { href: "#about", label: "من نحن" },
  { href: "#services", label: "خدماتنا" },
  { href: "#projects", label: "مشاريعنا" },
  { href: "#designs", label: "التصاميم" },
  { href: "#testimonials", label: "آراء العملاء" },
  { href: "#faq", label: "الأسئلة الشائعة" },
  { href: "#contact", label: "تواصل معنا" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape and stop the page scrolling behind the open menu. Body
  // overflow alone does not stop Lenis — see lib/lenis.ts.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    lockScroll();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3 border-b border-white/10" : "bg-transparent py-5"
      }`}
    >
      <div className="container-luxury flex items-center justify-between gap-4">
        <a
          href="#hero"
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
          aria-label={`${siteConfig.name} — العودة إلى أعلى الصفحة`}
        >
          <span className="flex items-center justify-center w-11 h-11 rounded-xl gold-gradient-bg text-navy-deep font-extrabold text-lg">
            {siteConfig.monogram}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold gold-gradient-text">{siteConfig.name}</span>
            <span className="text-[10px] tracking-[0.25em] text-gray-400">{siteConfig.nameEn}</span>
          </span>
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 text-sm text-gray-300 hover:text-gold transition-colors duration-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.contact.telHref}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full gold-gradient-bg text-navy-deep text-sm font-bold hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span dir="ltr">{siteConfig.contact.phone}</span>
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="lg:hidden w-11 h-11 rounded-xl glass-light flex items-center justify-center text-white hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="التنقل للجوال"
        hidden={!menuOpen}
        data-lenis-prevent
        className="lg:hidden glass border-t border-white/10 mt-3 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
      >
        <ul className="container-luxury py-4 flex flex-col">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-3 text-gray-200 hover:text-gold border-b border-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a
              href={siteConfig.contact.telHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full gold-gradient-bg text-navy-deep font-bold"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">{siteConfig.contact.phone}</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
