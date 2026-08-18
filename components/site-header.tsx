"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { getScrollOffset } from "@/lib/header-offset";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo, BrandWordmark } from "@/components/brand";
import { CallCta } from "@/components/call-cta";

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

/**
 * Applied only while the header is transparent over the hero footage.
 * Deliberately a single tight layer — anything wider reads as a grey smear
 * behind small text rather than as separation.
 */
const NAV_SHADOW = "0 1px 2px rgba(8,24,48,0.45)";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active link tracking.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // At the very bottom, pin the last section.
      if (scrollY + viewport >= documentHeight - 2) {
        setActiveHref(navLinks[navLinks.length - 1].href);
        return;
      }

      const line = getScrollOffset();

      let current = navLinks[0].href;
      let closest = -Infinity;

      for (const link of navLinks) {
        const element = document.querySelector(link.href);
        if (!(element instanceof HTMLElement)) continue;

        const top = element.getBoundingClientRect().top;

        if (top <= line && top > closest) {
          closest = top;
          current = link.href;
        }
      }

      setActiveHref(current);
    };

    const onScrollOrResize = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", onScrollOrResize, {
      passive: true,
    });

    window.addEventListener("resize", onScrollOrResize, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);

      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
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
      className={`fixed top-0 right-0 left-0 z-50 h-[55px] sm:h-[60px] lg:h-[64px] transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-luxury h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Branding */}
        <a
          href="#hero"
          className="flex min-w-0 h-full items-center gap-3 sm:gap-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={`${siteConfig.name} — العودة إلى أعلى الصفحة`}
        >
          <BrandLogo
            alt=""
            className="h-11 shrink-0 sm:h-14 lg:h-16"
          />

          <BrandWordmark
            alt=""
            imgClassName="h-6 sm:h-7 lg:h-8"
            className="hidden min-[380px]:block"
          />
        </a>

        {/* Desktop navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden lg:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;

            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveHref(link.href)}
                className={`group relative px-3 xl:px-3.5 py-2 text-[0.95rem] font-medium rounded-lg antialiased transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold after:content-[''] after:absolute after:inset-x-3 xl:after:inset-x-3.5 after:bottom-1 after:h-px after:bg-gold after:origin-right after:transition-transform after:duration-300 after:ease-out ${
                  isActive
                    ? "text-gold after:scale-x-100"
                    : `${
                        scrolled
                          ? "text-foreground"
                          : "text-white"
                      } hover:text-gold after:scale-x-0 hover:after:scale-x-100`
                }`}
                style={{
                  textRendering: "optimizeLegibility",
                  textShadow: scrolled
                    ? undefined
                    : NAV_SHADOW,
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop CTA */}
          <CallCta className="hidden sm:flex" />

          {/* Mobile CTA */}
          <CallCta
            variant="icon"
            className="flex sm:hidden"
          />

          <ThemeToggle />

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={
              menuOpen ? "إغلاق القائمة" : "فتح القائمة"
            }
            className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl glass-light flex items-center justify-center text-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {menuOpen ? (
              <X
                className="w-5 h-5"
                aria-hidden="true"
              />
            ) : (
              <Menu
                className="w-5 h-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        id="mobile-nav"
        aria-label="التنقل للجوال"
        hidden={!menuOpen}
        data-lenis-prevent
        className="lg:hidden glass border-t border-border mt-3 max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain"
      >
        <ul className="container-luxury py-4 flex flex-col">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => {
                    setActiveHref(link.href);
                    setMenuOpen(false);
                  }}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`block px-2 py-3 text-[1.05rem] font-medium antialiased border-b border-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isActive
                      ? "text-gold"
                      : "text-foreground hover:text-gold"
                  }`}
                  style={{
                    textRendering: "optimizeLegibility",
                  }}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
