"use client";

import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "الرئيسية", href: "#hero" },
  { label: "من نحن", href: "#about" },
  { label: "الخدمات", href: "#services" },
  { label: "المشاريع", href: "#projects" },
  { label: "التصميمات", href: "#designs" },
  { label: "آراء العملاء", href: "#testimonials" },
  { label: "الأسئلة الشائعة", href: "#faq" },
  { label: "تواصل معنا", href: "#contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (v) => {
      setScrolled(v > 60);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "glass py-3 shadow-2xl shadow-black/20"
            : "bg-transparent py-5"
        )}
      >
        <div className="container-luxury flex items-center justify-between">
          {/* Logo - RTL: right side */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg gold-gradient-bg flex items-center justify-center shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-navy font-extrabold text-lg" style={{ color: "#0B1F3A" }}>
                  الك
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white leading-none tracking-tight">
                الكيان
              </span>
              <span className="text-[10px] text-gold tracking-[0.3em] uppercase mt-1">
                AL-KAYAN
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-200 hover:text-gold transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 right-1/2 translate-x-1/2 w-0 h-[2px] gold-gradient-bg group-hover:w-8 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex shimmer-btn gold-gradient-bg text-navy font-bold text-sm px-6 py-3 rounded-full hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 hover:scale-105"
              style={{ color: "#0B1F3A" }}
            >
              احجز معاينة مجانية
            </a>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg glass-light text-white"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-navy-light border-l border-gold/20 lg:hidden overflow-y-auto"
              style={{ backgroundColor: "#132a4d" }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gold-gradient-bg flex items-center justify-center">
                    <span className="font-extrabold text-lg" style={{ color: "#0B1F3A" }}>
                      الك
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-white">الكيان</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg glass-light text-white"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="px-4 py-3 text-base font-medium text-gray-200 hover:text-gold hover:bg-white/5 rounded-lg transition-colors duration-200"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="p-6">
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 gold-gradient-bg text-navy font-bold text-base px-6 py-4 rounded-full w-full"
                  style={{ color: "#0B1F3A" }}
                >
                  <Phone className="w-4 h-4" />
                  احجز معاينة مجانية
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
