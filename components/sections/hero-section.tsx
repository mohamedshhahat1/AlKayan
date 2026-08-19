"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
import { ClientMarquee } from "@/components/ui/client-marquee";
import { heroClients } from "@/lib/clients";
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
 * Layer 1 — emergency fallback, and nothing more.
 *
 * Under normal conditions this is never seen: the poster sits directly on top
 * of it, is preloaded from <head>, and is opaque. It exists for the case where
 * the poster itself fails to load, so that a failed image and a failed video
 * together still leave something deliberate on screen rather than a bare box.
 *
 * Built from the palette in tailwind.config.ts — navy.light at the top through
 * navy.deep to navy.deepest at the edges. A gradient rather than an image on
 * purpose: it costs nothing to transfer and cannot itself fail to load, which
 * is the only useful property for a last resort.
 */
const HERO_FALLBACK_GRADIENT =
  "radial-gradient(125% 95% at 50% 0%, #132A4D 0%, #0B1F3A 45%, #081830 100%)";

/**
 * Background states.
 *
 * "loading" — the <video> is in the document and fetching, and the poster is
 *             fully opaque on top of the gradient. This is the initial state,
 *             so the element ships in the server-rendered HTML and the browser
 *             can start the download while it is still parsing the page.
 * "playing" — playback confirmed by the browser. Only now does the poster fade
 *             out and the footage fade in.
 * "static"  — no video, permanently. Reduced motion, Save-Data, a load error,
 *             an autoplay refusal and `NEXT_PUBLIC_HERO_VIDEO_URL=off` all land
 *             here. The <video> is removed and the poster simply stays.
 */
type BackgroundState = "loading" | "playing" | "static";

/** Declared locally so the code does not depend on how a given TS lib version types this. */
type SaveDataNavigator = Navigator & {
  connection?: { saveData?: boolean };
};

/**
 * Says why the hero is showing the poster instead of footage.
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

  /**
   * Starts as "loading" so the <video> is present in the server-rendered
   * markup and the fetch begins during HTML parse.
   *
   * Safe to derive from siteConfig here: it is resolved at build time from env
   * vars, so the server and the client compute the same initial value and
   * there is no hydration mismatch.
   */
  const [background, setBackground] = useState<BackgroundState>(
    siteConfig.hero.video ? "loading" : "static"
  );

  /**
   * Only ever true if the poster 404s or is corrupt. It uncovers the gradient
   * underneath, which is the one situation that layer exists for.
   */
  const [posterFailed, setPosterFailed] = useState(false);

  const posterImage = siteConfig.hero.poster;

  /**
   * Withdraw the video for visitors who should not receive it.
   *
   * This runs after the element already exists, which is a deliberate reversal.
   * Both signals — matchMedia and navigator.connection — are client-only, so
   * gating on them up front meant nothing could be fetched until hydration had
   * finished. Mounting first and tearing down here costs these visitors an
   * aborted request; gating first cost every visitor seconds of waiting.
   *
   * Either way the poster is already on screen and does not move, so there is
   * nothing for them to see happen.
   */
  useEffect(() => {
    if (!siteConfig.hero.video) {
      heroLog(
        "no video URL. NEXT_PUBLIC_HERO_VIDEO_URL is set to `off`, so the poster is showing by request."
      );
      return;
    }

    // A looping background is exactly the kind of motion the media query is
    // asking us to drop, and exactly the kind of payload Save-Data is asking
    // us not to send. The poster stays, and it is static, so both preferences
    // are honoured rather than approximated.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroLog(
        "dropping the video: this device has `prefers-reduced-motion: reduce` enabled. Keeping the poster. Turn off Reduce Motion in your OS accessibility settings to see the footage."
      );
      setBackground("static");
      return;
    }

    if ((navigator as SaveDataNavigator).connection?.saveData === true) {
      heroLog(
        "dropping the video: the browser is in data-saver mode (navigator.connection.saveData). Keeping the poster."
      );
      setBackground("static");
    }
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
      // The poster is already painted and opaque, so there is nothing to undo.
      heroLog(
        `the browser refused to autoplay the video (${
          error instanceof Error ? error.message : String(error)
        }). Keeping the poster.`
      );
      setBackground("static");
    });

    /**
     * Nothing below changes what the user sees — the poster is already in
     * place and stays put either way. It exists because a video that is
     * merely slow and a video that is never coming look identical on screen,
     * and the difference decides whether you re-encode the file or go looking
     * for a 404.
     */
    if (process.env.NODE_ENV !== "production") {
      const watchdog = window.setTimeout(() => {
        if (video.readyState < 3) {
          heroLog(
            "still waiting after 10s. Check this request in the Network tab. If the file plays fine in a desktop media player but stalls here, its index is probably at the end of the container — re-encode with `-movflags +faststart` so playback can begin on the first chunk instead of the last."
          );
        }
      }, 10000);
      return () => window.clearTimeout(watchdog);
    }
  }, [background]);

  const videoMounted = background === "loading" || background === "playing";
  const videoVisible = background === "playing";
  const posterVisible = Boolean(posterImage) && !posterFailed;

  return (
    // hero-viewport fills the screen with a 100vh -> 100dvh fallback pair.
    // fade-to-background dissolves the bottom edge into the About section so the
    // two never meet at a visible line. Both live in globals.css.
    <section
      ref={ref}
      id="hero"
      className="hero-viewport fade-to-background relative w-full overflow-hidden"
    >
      {/* LAYER 1 — emergency fallback.

          Covered by the poster under all normal conditions. Deliberately not
          inside the parallax wrapper: if it is ever visible then something has
          already gone wrong, and a sliding gradient does not improve that. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{ backgroundImage: HERO_FALLBACK_GRADIENT }}
      />

      {/* LAYER 2 — poster. Static, and outside the parallax wrapper.

          A real <img> rather than a CSS background, because a background-image
          is invisible to the browser's preload scanner: it cannot be fetched
          until the stylesheet has been parsed and the element it belongs to has
          been laid out. An <img> in the markup is discovered immediately, and
          the matching <link rel="preload"> in app/layout.tsx starts it earlier
          still — which is also what wins it the race against the video, ten
          times its size and requested from the same initial HTML.

          Nothing here transforms, animates or filters this element. It has no
          ken-burns class, and lifting it out of the motion.div below is what
          stops the scroll parallax from dragging it around while the video
          loads. Its ONLY state change is opacity, and only once the video is
          genuinely playing.

          next/image is deliberately not used: it wraps the element, defers the
          real src behind its own loader, and routes a static file that is
          already the correct size through the optimiser. */}
      {posterVisible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterImage}
          // Decorative. The copy on top of it already names the company, and
          // the footage that replaces it says nothing this does not.
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          onError={() => {
            heroLog(
              `failed to load the poster ${posterImage}. Check that the file exists in public/brand/. Falling back to the gradient.`
            );
            setPosterFailed(true);
          }}
          className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-500 ${
            videoVisible ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* LAYER 3 — video, on top of the poster and transparent until it plays.

          This is the only background layer that keeps the scroll parallax, so
          the hero still has the depth it was designed with while the poster
          stays nailed down. The two are therefore not in lockstep during the
          cross-fade; that is invisible in practice because the fade happens in
          the first moments, at the top of the page, where y and scale are still
          at their initial values. */}
      {videoMounted && (
        <motion.div style={{ y, scale }} className="absolute inset-0 z-[2]">
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
            // The whole point of shipping this element in the initial HTML is
            // to get the bytes moving early, so ask for the media itself and
            // not just its metadata.
            preload="auto"
            disablePictureInPicture
            // No `poster` attribute: layer 2 is the poster now, and duplicating
            // it here would only make the browser decode the same JPEG twice.
            //
            // src rather than a <source> child: error events from a child do
            // not bubble to onError, and this fallback has to be reliable.
            src={siteConfig.hero.video}
            // The single signal that flips the cross-fade. Not onLoadedData and
            // not onCanPlay — those fire while the frame is still frozen, and
            // revealing then would show a still image that never starts moving
            // if autoplay is subsequently refused.
            onPlaying={() => setBackground("playing")}
            onError={() => {
              heroLog(
                `failed to load ${siteConfig.hero.video}. Keeping the poster. Check that the file exists in public/brand/ and that the server is serving it.`
              );
              setBackground("static");
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              videoVisible ? "opacity-100" : "opacity-0"
            }`}
          />
        </motion.div>
      )}

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
          brighter than the poster the scrim above was tuned against. Gating it
          on playback means the poster is never darkened by it — it is at
          opacity 0 for the entire time the poster is on screen — and it fades
          in on the same 500ms curve as the footage, so there is no step. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-10 bg-navy-deepest transition-opacity duration-500 ${
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
          use the .hero-in CSS animation instead, which runs at first paint.

          The bottom padding reserves the client marquee's band. This copy is
          centred in a 100dvh section with a 560px floor, so on a short
          landscape phone the CTAs would otherwise sit inside the strip; the
          padding shrinks the box they are centred in rather than moving them,
          so nothing is off-centre on a tall screen. */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 h-full flex items-center justify-center pb-24 sm:pb-28 lg:pb-32"
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
            <span className="text-gold">شطب وانت مرتاح</span>
            <br />
            و
            <br />
            <span className="text-gold">استلم على المفتاح</span>
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

      {/* Client marquee — the hero's bottom edge.

          z-30 rather than z-20: .fade-to-background::after sits at z-15 and
          dissolves the bottom of this section into the page background, which
          would otherwise wash the strip out. That wash stays behind it, and it
          is useful there — it is part of what keeps the footage from competing
          with the names.

          The strip is full-bleed and always dark, in both themes, for the same
          reason the scrim above is: white text needs a dark backdrop, and the
          light-mode tokens resolve to a white wash that cannot carry it. */}
      <ClientMarquee
        clients={heroClients}
        label="TRUSTED BY OUR CLIENTS"
        className="absolute inset-x-0 bottom-0 z-30"
      />
    </section>
  );
}
