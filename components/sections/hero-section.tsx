"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Shadow used on the hero copy.
 *
 * Two layers on purpose: a wide soft blur lifts the text off the busiest parts
 * of the background, and a tight dark one keeps the glyph edges crisp. A single
 * large shadow at the same total strength reads as a grey halo.
 */
const HEADING_SHADOW = "0 2px 4px rgba(8,24,48,0.35), 0 8px 28px rgba(8,24,48,0.45)";
const BODY_SHADOW = "0 1px 3px rgba(8,24,48,0.4), 0 4px 16px rgba(8,24,48,0.35)";

/**
 * What sits behind the hero when there is no footage on screen.
 *
 * The stock photograph that used to live here has been removed, but something
 * still has to be behind the copy: this layer is what a visitor sees on
 * reduced motion, in data-saver mode, when autoplay is refused, when the video
 * fails to load, and for the moment before playback begins. A bare box would
 * make all of those look broken.
 *
 * Hand-built from the palette in tailwind.config.ts — navy.light at the top
 * where the light in the footage falls, down through navy.deep to
 * navy.deepest at the edges. It is a gradient rather than an image on purpose:
 * it costs nothing to transfer, paints on the first frame, and cannot itself
 * fail to load.
 */
const HERO_FALLBACK_GRADIENT =
  "radial-gradient(125% 95% at 50% 0%, #132A4D 0%, #0B1F3A 45%, #081830 100%)";

/**
 * Background states.
 *
 * "poster"  — the fallback layer is on screen and no video has been requested
 *             yet. Also the server-rendered state, so the hero paints without
 *             ever waiting on a video.
 * "loading" — the <video> is mounted and fetching.
 * "playing" — playback confirmed by the browser; cross-fade it in.
 * "static"  — no video, permanently. Reduced motion, Save-Data, a network
 *             error and an autoplay refusal all land here, and the fallback
 *             layer simply stays where it is.
 */
type BackgroundState = "poster" | "loading" | "playing" | "static";

/** Declared locally so the code does not depend on how a given TS lib version types these. */
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type SaveDataNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

/**
 * Says why the hero is showing the fallback instead of footage.
 *
 * Every fallback path here is intentional and every one of them is silent,
 * which makes "the video isn't playing" almost impossible to diagnose from the
 * outside — the correct behaviour and the broken behaviour look identical. In
 * development, announce it. Stripped from production builds.
 */
function heroLog(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[hero] ${message}`);
  }
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const [background, setBackground] = useState<BackgroundState>("poster");

  /**
   * Optional still. Empty by default — the hero is footage over a gradient.
   *
   * Set NEXT_PUBLIC_HERO_POSTER_URL to put an image back. Use a frame exported
   * from the video rather than a different photograph: the still and the first
   * frame of playback then match, and the handover is invisible.
   */
  const posterImage = siteConfig.hero.poster;

  /**
   * Decide whether to fetch the video at all, and never during first paint.
   *
   * The delay is shorter than it was. It originally protected a photographic
   * poster that was the LCP element and worth loading first; the gradient that
   * replaced it paints on the first frame and costs nothing, so the video is
   * the only thing left worth waiting for. Still deferred rather than eager:
   * a multi-megabyte request in front of the font and the JS bundle helps
   * nobody, and a visitor who bounces in under a second never pays for it.
   */
  useEffect(() => {
    if (!siteConfig.hero.video) {
      heroLog(
        "no video URL. NEXT_PUBLIC_HERO_VIDEO_URL is set to `off`, so the gradient is showing by request."
      );
      setBackground("static");
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as SaveDataNavigator).connection?.saveData === true;

    // A looping background is exactly the kind of motion the media query is
    // asking us to drop, and exactly the kind of payload Save-Data is asking
    // us not to send.
    if (prefersReducedMotion) {
      heroLog(
        "skipping the video: this device has `prefers-reduced-motion: reduce` enabled. Turn off Reduce Motion in your OS accessibility settings to see it."
      );
      setBackground("static");
      return;
    }

    if (saveData) {
      heroLog("skipping the video: the browser is in data-saver mode (navigator.connection.saveData).");
      setBackground("static");
      return;
    }

    const idleWindow = window as IdleWindow;
    const start = () => setBackground((current) => (current === "poster" ? "loading" : current));

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(start, { timeout: 1500 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(start, 800);
    return () => window.clearTimeout(timer);
  }, []);

  /**
   * iOS honours `muted` as a property, not as the attribute React writes, and
   * an unmuted video is never allowed to autoplay. Set it directly, then ask.
   */
  useEffect(() => {
    if (background !== "loading") return;

    const video = videoRef.current;
    if (!video) return;

    heroLog(`requesting ${siteConfig.hero.video}`);

    video.muted = true;

    void video.play().catch((error: unknown) => {
      // Low power mode, a data saver, or a policy we cannot detect up front.
      // The fallback is already painted, so there is nothing to undo.
      heroLog(
        `the browser refused to autoplay the video (${
          error instanceof Error ? error.message : String(error)
        }). Keeping the gradient.`
      );
      setBackground("static");
    });

    /**
     * Nothing below changes what the user sees — the fallback is already in
     * place and stays put either way. It exists because a video that is
     * merely slow and a video that is never coming look the same on screen,
     * and the difference decides whether you re-encode the file or replace
     * the URL.
     */
    if (process.env.NODE_ENV !== "production") {
      const watchdog = window.setTimeout(() => {
        if (video.readyState < 3) {
          heroLog(
            "still waiting after 10s. The URL is reachable but slow, or it is not returning playable video. Check the Network tab for this request: a 403 or an HTML response means the host is refusing to serve the file to this origin, and the fix is to self-host it in public/brand/."
          );
        }
      }, 10000);
      return () => window.clearTimeout(watchdog);
    }
  }, [background]);

  const videoMounted = background === "loading" || background === "playing";
  const videoVisible = background === "playing";

  return (
    // hero-viewport fills the screen with a 100vh -> 100dvh fallback pair.
    // fade-to-background dissolves the bottom edge into the About section so the
    // two never meet at a visible line. Both live in globals.css.
    <section
      ref={ref}
      id="hero"
      className="hero-viewport fade-to-background relative w-full overflow-hidden"
    >
      {/* Background layers, parallaxed and zoomed as one. */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        {/* The fallback layer.

            Always rendered and never unmounted. It is what paints first, and
            it is the fallback for every way the video can fail — which is why
            a dead video URL cannot break this hero.

            Ken Burns and the photographic filter apply only when an actual
            photograph has been configured. Panning a gradient does nothing but
            occupy the compositor, and the drift is dropped once footage is
            playing regardless: two things moving at once is one too many. */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
            posterImage && !videoVisible ? "ken-burns" : ""
          }`}
          style={{
            backgroundImage: posterImage ? `url(${posterImage})` : HERO_FALLBACK_GRADIENT,
            // Small, deliberately conservative lift, and only for photographs.
            // Saturation does most of the work on marble and wood; brightness
            // past ~1.1 blows out window highlights.
            filter: posterImage ? "brightness(1.07) contrast(1.06) saturate(1.12)" : undefined,
          }}
        />

        {videoMounted && (
          <video
            ref={videoRef}
            // Purely decorative: the footage carries nothing the copy above it
            // does not already say, and it is silent, so there is no audio
            // track to caption.
            aria-hidden="true"
            tabIndex={-1}
            autoPlay
            muted
            loop
            playsInline
            // The element only exists once we have decided to play it, so
            // there is no point fetching anything less than we need.
            preload="auto"
            // Omitted entirely when unset. An empty poster attribute makes
            // some browsers paint a transparent frame over the gradient.
            poster={posterImage || undefined}
            disablePictureInPicture
            // src rather than a <source> child: error events from a child do
            // not bubble to onError, and this fallback has to be reliable.
            src={siteConfig.hero.video}
            onPlaying={() => setBackground("playing")}
            onError={() => {
              heroLog(
                `failed to load ${siteConfig.hero.video}. Keeping the gradient. If this is the Pexels /download/ URL, the host may be refusing the request — self-host the file and set NEXT_PUBLIC_HERO_VIDEO_URL=/brand/hero.mp4.`
              );
              setBackground("static");
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoVisible ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </motion.div>

      {/* Readability scrim.

          Shaped rather than flat: heaviest at the top where the fixed header
          sits, light across the middle band so the interior detail shows, and
          rising again at the bottom to hand off to .fade-to-background.

          This does not use the --hero-overlay-* tokens. Those resolve to a
          white wash in light mode, which cannot carry white text. A navy scrim
          in both themes is the standard treatment for a media-led hero. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,24,48,0.62) 0%, rgba(8,24,48,0.34) 22%, rgba(8,24,48,0.18) 45%, rgba(8,24,48,0.26) 68%, rgba(8,24,48,0.45) 100%)",
        }}
      />

      {/* One extra flat layer, and only while footage is playing.

          Video walks through frames nobody has approved, some of them much
          brighter than the background the gradient above was tuned against.
          Gating it on playback means the fallback keeps exactly the treatment
          it was designed with. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-10 bg-navy-deepest transition-opacity duration-1000 ${
          videoVisible ? "opacity-25" : "opacity-0"
        }`}
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
