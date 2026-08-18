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
  //
  // A scroll scan rather than an IntersectionObserver. The observer version
  // could only express "somewhere inside a band", and several sections occupy
  // that band at once, so it needed a tiebreak that was wrong as often as it
  // was right. Comparing positions directly answers the actual question: which
  // section has most recently passed under the header.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const scrollY = window.scrollY;
      const viewport = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // At the very bottom, the last section may be too short to ever reach the
      // header line, so it would otherwise never light up. Pin it.
      if (scrollY + viewport >= documentHeight - 2) {
        setActiveHref(navLinks[navLinks.length - 1].href);
        return;
      }

      const line = getScrollOffset();

      // Of every section already at or above the line, take the one furthest
      // down the page. "Furthest down" rather than "first found" is what makes
      // #faq work: it is nested inside #contact, so both qualify at the same
      // time and the deeper, later one is the honest answer.
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

    // Coalesced into one measurement per frame. Reading getBoundingClientRect
    // on every scroll event would force a layout flush per event.
    const onScrollOrResize = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

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
        scrolled ? "glass py-2 sm:py-2.5 lg:py-3 border-b border-border" : "bg-transparent py-3 sm:py-3.5 lg:py-3"
      }`}
    >
      <div className="container-luxury flex items-center justify-between gap-3 sm:gap-4">
        {/* The link is already labelled, so both assets are decorative: alt=""
            stops a screen reader reading the company name three times over. */}
        <a
          href="#hero"
          className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={`${siteConfig.name} — العودة إلى أعلى الصفحة`}
        >
          <BrandLogo alt="" className="h-11 shrink-0 sm:h-14 lg:h-16" />
          {/* Below 380px the row still has to hold the call button, the theme
              toggle and the hamburger. The wordmark is the one element that
              can drop without losing an action. */}
          <BrandWordmark alt="" imgClassName="h-6 sm:h-7 lg:h-8" className="hidden min-[380px]:block" />
        </a>

        <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeHref === link.href;

            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                // Set eagerly so the underline moves on click rather than
                // arriving a second later with the scroll. The scan corrects it
                // if the target turns out not to reach the top of the page.
                onClick={() => setActiveHref(link.href)}
                // The underline is an ::after rule rather than a border so it
                // can scale from 0 without ever affecting layout height.
                // origin-right because the document is RTL: the line should
                // grow the way the text reads.
                className={`group relative px-3 xl:px-3.5 py-2 text-[0.95rem] font-medium rounded-lg antialiased transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold after:content-[''] after:absolute after:inset-x-3 xl:after:inset-x-3.5 after:bottom-1 after:h-px after:bg-gold after:origin-right after:transition-transform after:duration-300 after:ease-out ${
                  isActive
                    ? "text-gold after:scale-x-100"
                    : `${
                        scrolled ? "text-foreground" : "text-white"
                      } hover:text-gold after:scale-x-0 hover:after:scale-x-100`
                }`}
                style={{
                  textRendering: "optimizeLegibility",
                  textShadow: scrolled ? undefined : NAV_SHADOW,
                }}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop CTA, unchanged. */}
          <CallCta className="hidden sm:flex" />

          {/* Same action, same config, sized for a thumb. It appears only
              where the pill above is hidden, so the number is never offered
              twice in one row. */}
          <CallCta variant="icon" className="flex sm:hidden" />

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="lg:hidden w-11 h-11 rounded-xl glass-light flex items-center justify-center text-foreground hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* No call CTA at the foot of this list any more. Calling is now a
          permanent, one-tap action in the bar above, so repeating it here was
          the same number offered twice. */}
      <nav
        id="mobile-nav"
        aria-label="التنقل للجوال"
        hidden={!menuOpen}
        data-lenis-prevent
        className="lg:hidden glass border-t border-border mt-3 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
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
                  aria-current={isActive ? "page" : undefined}
                  // No white here and no shadow: the mobile panel is a glass
                  // surface, not the footage.
                  className={`block px-2 py-3 text-[1.05rem] font-medium antialiased border-b border-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    isActive ? "text-gold" : "text-foreground hover:text-gold"
                  }`}
                  style={{ textRendering: "optimizeLegibility" }}
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
