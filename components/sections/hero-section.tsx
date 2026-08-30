"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { useSetting } from "@/lib/content/context";

/**
 * Brand constants, written as literals rather than tokens.
 *
 * Everything in this section sits on a charcoal scrim over photography, and
 * that scrim stays charcoal in both themes. Theme-following tokens would turn
 * this copy dark-on-dark the moment the light palette is enabled, so the hero
 * pins its own values. This is the one section that should not use ink/gold
 * utilities.
 */
const IVORY = "#F3F0E8";
const GOLD = "#C9A15A";
const GOLD_LIGHT = "#E5C98A";
const CHARCOAL = "#171717";

/**
 * Shadow used on the hero copy.
 *
 * Two layers on purpose: a wide soft blur lifts the text off the busiest parts
 * of the photo, and a tight dark one keeps the glyph edges crisp. A single
 * large shadow at the same total strength reads as a grey halo.
 */
const HEADING_SHADOW = "0 2px 4px rgba(17,17,17,0.4), 0 8px 28px rgba(17,17,17,0.5)";
const BODY_SHADOW = "0 1px 3px rgba(17,17,17,0.45), 0 4px 16px rgba(17,17,17,0.4)";

export function HeroSection() {
  const imageUrl = useSetting("hero.image_url", "");
  const eyebrow = useSetting("hero.eyebrow", "للتشطيبات والمقاولات العامة");
  const headlineLead = useSetting("hero.headline_lead", "من الفكرة …");
  const headlineConnector = useSetting("hero.headline_connector", "إلى");
  const headlineAccent = useSetting("hero.headline_accent", "تسليم المفتاح");
  const tagline = useSetting("hero.tagline", "نبني مساحات أفضل لحياتك");
  const subheadline = useSetting("hero.subheadline", "");
  const ctaPrimary = useSetting("hero.cta_primary", "احجز معاينة");
  const ctaSecondary = useSetting("hero.cta_secondary", "تصفح أعمالنا");

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  /*
   * Restrained parallax: 18% travel, no scale.
   *
   * This was 50% with a 1.15 scale on top of the 1.18 the Ken Burns keyframes
   * already apply. Two compounding scales meant the browser was resampling the
   * photo well past its natural size, and half a viewport of drift is the
   * "excessive parallax" the brief rules out.
   */
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    // hero-viewport fills the screen with a 100vh -> 100dvh fallback pair.
    // fade-to-background dissolves the bottom edge into the next section so the
    // two never meet at a visible line. Both live in globals.css.
    <section
      ref={ref}
      id="hero"
      className="hero-viewport fade-to-background relative w-full overflow-hidden bg-navy-deep"
    >
      {/* Background image with parallax + Ken Burns cinematic zoom.
          bg-cover crops to fill at any ratio and bg-center keeps the subject
          put, so widening the window never letterboxes or stretches it. */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat ken-burns"
          style={{
            // The seeded URL asks Pexels for w=2560 rather than 1920: the layer
            // is also scaled up by the Ken Burns keyframes, so at 1920 the
            // browser was upscaling on any large or retina screen. That was the
            // softness, not compression. Worth keeping in mind when swapping
            // this image from the dashboard.
            backgroundImage: `url(${imageUrl})`,
            // Conservative lift. Saturation does most of the work on marble and
            // wood; brightness past ~1.1 blows out the window highlights here.
            filter: "brightness(1.07) contrast(1.06) saturate(1.12)",
          }}
        />
      </motion.div>

      {/* Readability scrim.

          Charcoal, matching the brand background, and shaped rather than flat:
          heaviest at the top where the fixed header sits, light across the
          middle so the interior detail shows, rising again at the bottom to
          hand off to .fade-to-background.

          Kept subtle per the brief — the middle band is at 0.18 so the
          photograph, not the overlay, is what the eye lands on. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.66) 0%, rgba(17,17,17,0.34) 22%, rgba(17,17,17,0.18) 45%, rgba(17,17,17,0.28) 68%, rgba(17,17,17,0.5) 100%)",
        }}
      />

      {/* Architectural line work.

          Two vertical hairlines and one horizontal rule, drawn from the facade
          geometry in the logo. They are static — they fade in once and then
          hold. The previous version animated pathLength, which has no effect on
          a div (it is an SVG geometry attribute), so only the opacity was ever
          moving. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            insetInlineStart: "26%",
            background: `linear-gradient(to bottom, transparent, ${GOLD}33, transparent)`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            insetInlineEnd: "32%",
            background: `linear-gradient(to bottom, transparent, ${GOLD}22, transparent)`,
          }}
        />
        <div
          className="absolute left-0 right-0 h-px top-1/2"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD}26, transparent)` }}
        />
      </motion.div>

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
          {/* The mark, above the headline. Only the symbol: the wordmark and
              descriptor would repeat the eyebrow and the h1 immediately below
              it, and the lockup's muted descriptor is the wrong weight against
              a photograph. */}
          <div className="hero-in flex justify-center mb-6" style={{ animationDelay: "0.15s" }}>
            <LogoMark tone="current" className="h-20 w-20 sm:h-24 sm:w-24" style={{ color: GOLD, filter: "drop-shadow(0 4px 16px rgba(17,17,17,0.55))" }} />
          </div>

          {/* Eyebrow: the company descriptor from the logo itself, flanked by
              gold hairlines.

              No letter-spacing, unlike the English label this replaces:
              tracking forces Arabic glyphs apart and breaks the cursive joins,
              so للتشطيبات would render as disconnected letterforms. */}
          <div
            className="hero-in flex items-center justify-center gap-4 mb-6"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="h-px w-8 sm:w-12" style={{ background: `${GOLD}80` }} aria-hidden="true" />
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ color: GOLD, textShadow: BODY_SHADOW }}
            >
              {eyebrow}
            </span>
            <span className="h-px w-8 sm:w-12" style={{ background: `${GOLD}80` }} aria-hidden="true" />
          </div>

          {/* One gold phrase, not two of three lines. Gold is the accent that
              lands on the promise — the rest is ivory. */}
          <h1
            className="hero-in font-display text-display-xl text-balance mb-5"
            style={{ color: IVORY, textShadow: HEADING_SHADOW, animationDelay: "0.5s" }}
          >
            {headlineLead}
            <br />
            {headlineConnector}
            <br />
            <span style={{ color: GOLD }}>{headlineAccent}</span>
          </h1>

          <p
            className="hero-in font-display text-lg sm:text-xl lg:text-2xl mb-4"
            style={{ color: GOLD_LIGHT, textShadow: BODY_SHADOW, animationDelay: "0.7s" }}
          >
            {tagline}
          </p>

          <p
            className="hero-in text-base sm:text-lg max-w-2xl mx-auto mb-9 leading-relaxed text-balance"
            style={{ color: `${IVORY}d9`, textShadow: BODY_SHADOW, animationDelay: "0.85s" }}
          >
            {subheadline}
          </p>

          {/* Mobile gets full-width stacked CTAs rather than two shrunken
              pills: a 44px-tall full-bleed target is the right shape for a
              thumb, and it stops the labels from wrapping at 360px. */}
          <div
            className="hero-in flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
            style={{ animationDelay: "1s" }}
          >
            {/* Primary: flat gold fill, charcoal ink, lightening on hover.
                No shimmer, no scale, no shadow bloom. */}
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2.5 rounded-sm px-8 py-4 text-base font-bold transition-colors duration-400 ease-arch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ background: GOLD, color: CHARCOAL }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD_LIGHT;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = GOLD;
              }}
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              {ctaPrimary}
            </a>

            {/* Secondary: transparent, 1px gold border, light gold label. */}
            <a
              href="#projects"
              className="group inline-flex items-center justify-center gap-2.5 rounded-sm border px-8 py-4 text-base font-bold transition-colors duration-400 ease-arch hover:bg-[rgba(201,161,90,0.12)]"
              style={{ borderColor: GOLD, color: GOLD_LIGHT }}
            >
              {ctaSecondary}
              <ArrowLeft
                className="w-5 h-5 transition-transform duration-400 ease-arch group-hover:-translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
