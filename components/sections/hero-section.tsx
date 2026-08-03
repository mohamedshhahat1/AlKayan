"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Calendar, ArrowLeft } from "lucide-react";

/**
 * Shadow used on the hero copy.
 *
 * Two layers on purpose: a wide soft blur lifts the text off the busiest parts
 * of the photo, and a tight dark one keeps the glyph edges crisp. A single
 * large shadow at the same total strength reads as a grey halo.
 */
const HEADING_SHADOW = "0 2px 4px rgba(8,24,48,0.35), 0 8px 28px rgba(8,24,48,0.45)";
const BODY_SHADOW = "0 1px 3px rgba(8,24,48,0.4), 0 4px 16px rgba(8,24,48,0.35)";

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
    // hero-viewport fills the screen with a 100vh -> 100dvh fallback pair.
    // fade-to-background dissolves the bottom edge into the About section so the
    // two never meet at a visible line. Both live in globals.css.
    <section
      ref={ref}
      id="hero"
      className="hero-viewport fade-to-background relative w-full overflow-hidden"
    >
      {/* Background image with parallax + Ken Burns cinematic zoom.
          bg-cover crops to fill at any ratio and bg-center keeps the subject
          put, so widening the window never letterboxes or stretches it. */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat ken-burns"
          style={{
            // w=2560 rather than 1920: the layer is also scaled up to 1.18 by
            // the Ken Burns keyframes and to 1.15 by the parallax, so at 1920
            // the browser was upscaling on any large or retina screen. That
            // was the softness, not the compression.
            backgroundImage:
              "url(https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&w=2560)",
            // Small, deliberately conservative lift. Saturation does most of
            // the work on marble and wood; brightness past ~1.1 blows out the
            // window highlights in this particular photo.
            filter: "brightness(1.07) contrast(1.06) saturate(1.12)",
          }}
        />
      </motion.div>

      {/* Readability scrim.

          Shaped rather than flat: heaviest at the top where the fixed header
          sits, light across the middle band so the interior detail shows, and
          rising again at the bottom to hand off to .fade-to-background.

          This no longer uses the --hero-overlay-* tokens. Those resolve to a
          white wash in light mode, which cannot carry white text. A navy scrim
          in both themes is the standard treatment for an image-led hero. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,24,48,0.62) 0%, rgba(8,24,48,0.34) 22%, rgba(8,24,48,0.18) 45%, rgba(8,24,48,0.26) 68%, rgba(8,24,48,0.45) 100%)",
        }}
      />

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

      {/* Content.

          The wrapper keeps its scroll-linked fade because a MotionValue in
          `style` renders at its current value on the server — it is never 0 on
          a cold load.

          The children below deliberately do NOT use framer initial/animate.
          That pattern writes opacity: 0 into the server HTML and only lifts it
          after hydration, which left the copy invisible until a refresh. They
          use the .hero-in CSS animation instead, which runs at first paint. */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 h-full flex items-center justify-center"
      >
        <div className="container-luxury text-center">
          <span
            className="hero-in inline-block text-xs sm:text-sm font-bold tracking-[0.4em] text-gold uppercase mb-4"
            style={{ textShadow: BODY_SHADOW, animationDelay: "0.3s" }}
          >
            ELITE CONSTRUCTION &amp; INTERIOR
          </span>

          {/* Three lines: gold, white, gold. The middle word carries no colour
              class — it inherits text-white from the h1. Both gold lines use
              solid --gold to match the back-to-top button; the gradient
              version reaches --gold-dark over a long line and reads duller. */}
          <h1
            className="hero-in text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-5 text-balance"
            style={{ textShadow: HEADING_SHADOW, animationDelay: "0.5s" }}
          >
            <span className="text-gold">من الفكرة …</span>
            <br />
            الي
            <br />
            <span className="text-gold">تسليم المفتاح …</span>
          </h1>

          <p
            className="hero-in text-base sm:text-lg text-white/85 max-w-2xl mx-auto mb-8 leading-relaxed text-balance"
            style={{ textShadow: BODY_SHADOW, animationDelay: "0.8s" }}
          >
            نصمم، ننفذ، ونشرف على جميع أعمال التشطيبات والمقاولات بأعلى معايير الجودة والاحترافية
          </p>

          <div
            className="hero-in flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animationDelay: "1s" }}
          >
            <a
              href="#contact"
              className="shimmer-btn gold-gradient-bg font-bold text-base px-8 py-3.5 rounded-full hover:shadow-2xl hover:shadow-gold/30 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{ color: "#0B1F3A" }}
            >
              <Calendar className="w-5 h-5" />
              احجز معاينة
            </a>
            {/* glass-on-dark + white, not glass-light + text-foreground: the
                scrim is navy in both themes now, so a theme-following label
                would turn navy-on-navy in light mode. */}
            <a
              href="#projects"
              className="glass-on-dark text-white font-bold text-base px-8 py-3.5 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              تصفح أعمالنا
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
