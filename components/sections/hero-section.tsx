"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ChevronDown, Calendar, ArrowLeft } from "lucide-react";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={ref} id="hero" className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background image with parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=1920)",
          }}
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-navy/80 via-navy/70 to-navy" style={{ background: "linear-gradient(180deg, rgba(11,31,58,0.85) 0%, rgba(11,31,58,0.7) 50%, rgba(11,31,58,1) 100%)" }} />

      {/* Animated architectural lines */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold to-transparent"
          style={{ backgroundColor: "rgba(212,175,55,0.2)" }}
        />
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          className="absolute top-0 right-1/3 w-px h-full"
          style={{ backgroundColor: "rgba(212,175,55,0.15)" }}
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
          className="absolute top-1/2 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: "rgba(212,175,55,0.4)",
              left: `${(i * 8 + 5) % 95}%`,
              top: `${(i * 13 + 10) % 90}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 h-full flex items-center justify-center"
      >
        <div className="container-luxury text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-block text-sm font-bold tracking-[0.4em] text-gold uppercase mb-6"
          >
            ELITE CONSTRUCTION & INTERIOR
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.1] mb-8 text-balance"
          >
            من الفكرة...
            <br />
            <span className="gold-gradient-text">إلى تسليم المفتاح</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-12 leading-relaxed text-balance"
          >
            نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#contact"
              className="shimmer-btn gold-gradient-bg font-bold text-base px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-gold/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{ color: "#0B1F3A" }}
            >
              <Calendar className="w-5 h-5" />
              احجز معاينة
            </a>
            <a
              href="#projects"
              className="glass-light text-white font-bold text-base px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 flex items-center gap-2 border border-white/20"
            >
              تصفح أعمالنا
              <ArrowLeft className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-400 tracking-widest">اكتشف المزيد</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-gold/40 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
