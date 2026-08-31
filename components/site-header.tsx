"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import { isActiveRoute, navLinks } from "@/lib/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo, BrandWordmark } from "@/components/brand";
import { CallCta } from "@/components/call-cta";

/**
 * Applied only while the header is transparent over the hero footage.
 * Deliberately a single tight layer — anything wider reads as a grey smear
 * behind small text rather than as separation.
 */
const NAV_SHADOW = "0 1px 2px rgba(0,0,0,0.45)";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  /**
   * Whether to wear the glass treatment.
   *
   * The transparent header exists for one reason: the homepage hero is a
   * full-bleed video, and a solid bar across it would waste the shot. Every
   * other route starts with ordinary page background, where white nav text on
   * transparent is unreadable — so off the homepage the header is solid from
   * the first pixel rather than waiting for a scroll that may never come on a
   * short page.
   */
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The menu is a full-width overlay: leaving it open across a navigation would
  // hide the page just arrived at. Covers browser back/forward too, which no
  // onClick handler can.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
    /* glass-header rather than glass: this bar is pure black in dark mode, and
       it reads its own --header-bg token so darkening it does not darken every
       card on the site. See app/globals.css. */
    <header
      className={`fixed top-0 right-0 left-0 z-50 h-[55px] sm:h-[60px] lg:h-[64px] transition-all duration-500 ${
        solid
          ? "glass-header border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-luxury h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Branding */}
        <Link
          href="/"
          className="flex min-w-0 h-full items-center gap-3 sm:gap-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={`${siteConfig.name} — الصفحة الرئيسية`}
        >
          {/* These heights are the artwork's height, not a padded box's.
              The SVGs used to sit on their Illustrator artboards — a
              1920x1080 canvas holding a mark that filled 57% of it — so a
              h-16 box painted a 37px mark and the logo read as small however
              large the box was made. The canvases are now cropped to the
              artwork, so a height set here is the height that shows, and
              these values leave the bar some margin instead of running the
              mark edge to edge. */}
          <BrandLogo
            alt=""
            className="h-10 shrink-0 sm:h-12 lg:h-14"
          />

          <BrandWordmark
            alt=""
            imgClassName="h-5 sm:h-6 lg:h-7"
            className="hidden min-[380px]:block"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden lg:flex items-center gap-1"
        >
          {navLinks.map((link) => {
            const isActive = isActiveRoute(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative px-3 xl:px-3.5 py-2 text-[0.95rem] font-medium rounded-lg antialiased transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold after:content-[''] after:absolute after:inset-x-3 xl:after:inset-x-3.5 after:bottom-1 after:h-px after:bg-gold after:origin-right after:transition-transform after:duration-300 after:ease-out ${
                  isActive
                    ? "text-gold after:scale-x-100"
                    : `${
                        solid
                          ? "text-foreground"
                          : "text-white"
                      } hover:text-gold after:scale-x-0 hover:after:scale-x-100`
                }`}
                style={{
                  textRendering: "optimizeLegibility",
                  textShadow: solid
                    ? undefined
                    : NAV_SHADOW,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Desktop CTA */}
          {/* The number itself is on the button's title and one tap away
              on /contact; the header just needs the ask. */}
          <CallCta className="hidden sm:flex" label="اتصل بنا" placement="header" />

          {/* Mobile CTA */}
          <CallCta
            variant="icon"
            className="flex sm:hidden"
            placement="header_mobile"
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

      {/* Mobile navigation.

          Matches the bar it drops out of, so the two read as one surface
          rather than two slightly different blacks. */}
      <nav
        id="mobile-nav"
        aria-label="التنقل للجوال"
        hidden={!menuOpen}
        data-lenis-prevent
        className="lg:hidden glass-header border-t border-border mt-3 max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain"
      >
        <ul className="container-luxury py-4 flex flex-col">
          {navLinks.map((link) => {
            const isActive = isActiveRoute(pathname, link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  // Also closed by the pathname effect above; this covers
                  // tapping the route you are already on, which does not
                  // change the pathname.
                  onClick={() => setMenuOpen(false)}
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
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
