"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/lenis";

export type LightboxImage = {
  /** Full-size source shown in the viewer. */
  src: string;
  /** Smaller source for the thumbnail strip. Falls back to src. */
  thumb?: string;
  alt: string;
};

type LightboxProps = {
  images: LightboxImage[];
  /** Index of the open image, or null when closed. The parent owns this. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Optional caption, e.g. the category name. */
  title?: string;
};

/** Minimum horizontal travel before a touch counts as a swipe, in pixels. */
const SWIPE_THRESHOLD = 50;

/** Must match the duration-300 transition classes below. */
const TRANSITION_MS = 300;

/**
 * Marks the image and every control. A click landing inside one of these does
 * not dismiss the viewer; anything else is backdrop.
 *
 * An allowlist rather than a comparison against the event's currentTarget: the
 * root is completely covered by the bar, the stage and the strip, so it is
 * almost never the direct target of a click and such a check silently never
 * fires.
 */
const KEEP_OPEN_ATTRIBUTE = "data-lightbox-keep-open";

/**
 * Full-screen image viewer.
 *
 * Deliberately controlled rather than self-managing: the parent already knows
 * which collection is on screen, and duplicating the index here would mean two
 * sources of truth to reconcile every time the category changes. Passing null
 * closes it.
 */
export function Lightbox({ images, index, onIndexChange, onClose, title }: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbRowRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  /** Whatever was focused before opening, so focus can be handed back. */
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isOpen = index !== null;
  const total = images.length;

  useEffect(() => setMounted(true), []);

  /**
   * Play the exit transition, then unmount.
   *
   * Every dismissal inside the component goes through here rather than calling
   * onClose directly. onClose clears the parent's index, which removes this
   * subtree on the very next render — so calling it straight away means there
   * is nothing left on screen to animate.
   */
  const beginClose = useCallback(() => {
    if (closeTimer.current !== null) return;

    setEntered(false);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      onClose();
    }, TRANSITION_MS);
  }, [onClose]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    []
  );

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      // Modulo twice so a negative step wraps to the end rather than going out
      // of range: -1 % 6 is -1 in JS, not 5.
      onIndexChange(((next % total) + total) % total);
    },
    [onIndexChange, total]
  );

  const goNext = useCallback(() => {
    if (index !== null) goTo(index + 1);
  }, [goTo, index]);

  const goPrevious = useCallback(() => {
    if (index !== null) goTo(index - 1);
  }, [goTo, index]);

  // Fade each image in on arrival rather than swapping it instantly.
  useEffect(() => setImageLoaded(false), [index]);

  // Enter transition. Painting one frame in the closed state first is what
  // gives the browser something to animate from.
  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Scroll lock and focus handling. lockScroll only freezes overflow, so the
  // page keeps its scroll position and is exactly where it was on release.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    lockScroll();
    closeButtonRef.current?.focus();

    return () => {
      unlockScroll();
      // Hands focus back to the thumbnail that opened the viewer, so keyboard
      // users resume where they left off instead of at the top of the document.
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Keyboard: only bound while open, so it cannot capture keys from the page.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        beginClose();
        return;
      }

      // Direction follows the page: the document is dir="rtl", the thumbnail
      // strip runs right to left, so the left key moves towards the next image.
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrevious();
        return;
      }

      if (event.key !== "Tab") return;

      // Focus trap.
      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, goNext, goPrevious, beginClose]);

  // Warm the neighbours so stepping through feels instant. Browser-cached, no
  // DOM involved.
  useEffect(() => {
    if (index === null || total === 0) return;

    for (const offset of [-1, 1]) {
      const neighbour = images[((index + offset) % total + total) % total];
      if (!neighbour) continue;

      const preloader = new window.Image();
      preloader.src = neighbour.src;
    }
  }, [images, index, total]);

  // Keep the active thumbnail centred in the strip. scrollIntoView rather than
  // arithmetic on scrollLeft, whose sign and origin differ between browsers in
  // an RTL container.
  useEffect(() => {
    if (index === null) return;

    const activeThumb = thumbRowRef.current?.children[index];
    activeThumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    // Dragging left pulls the next image in, matching the RTL strip.
    if (deltaX < 0) goNext();
    else goPrevious();
  };

  const onBackdropClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(`[${KEEP_OPEN_ATTRIBUTE}]`)) return;

    beginClose();
  };

  if (!mounted || index === null) return null;

  const current = images[index];
  if (!current) return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `معرض الصور — ${title}` : "معرض الصور"}
      data-lenis-prevent
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onBackdropClick}
      className={`fixed inset-0 z-[90] flex flex-col transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
    >
      {/* Top bar: counter, title, close. */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto" {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}>
          <span
            dir="ltr"
            className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium tabular-nums"
            aria-live="polite"
          >
            {index + 1} / {total}
          </span>
          {title ? <span className="hidden sm:block text-white/70 text-sm">{title}</span> : null}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={beginClose}
          aria-label="إغلاق معرض الصور"
          {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}
          className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Stage. min-h-0 lets this flex child shrink so the strip is never pushed
          off-screen on short viewports. The empty area either side of a
          portrait image is backdrop and closes on click. */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-20">
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          onLoad={() => setImageLoaded(true)}
          {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}
          className={`max-w-full max-h-full object-contain rounded-lg sm:rounded-xl transition-all duration-300 ${
            imageLoaded && entered ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />

        {total > 1 ? (
          <>
            {/* Next sits on the left: in RTL the sequence advances leftwards. */}
            <button
              type="button"
              onClick={goNext}
              aria-label="الصورة التالية"
              {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goPrevious}
              aria-label="الصورة السابقة"
              {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {/* Thumbnail strip.

          Two elements on purpose. Putting justify-center on the scrolling
          element itself centres the row but overflows it in both directions,
          and a scroll container cannot reach content that starts before its
          own start edge — the first thumbnails become unreachable. An inner
          w-max row with mx-auto centres while it fits and becomes a no-op once
          it does not, so both cases work without a breakpoint. */}
      {total > 1 ? (
        <div
          className="flex-shrink-0 w-full overflow-x-auto overscroll-contain"
          {...{ [KEEP_OPEN_ATTRIBUTE]: "" }}
        >
          <div
            ref={thumbRowRef}
            className="flex items-center gap-2 sm:gap-3 w-max mx-auto px-4 sm:px-6 py-4"
          >
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                onClick={() => onIndexChange(i)}
                aria-label={`عرض الصورة ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  i === index
                    ? "ring-2 ring-gold opacity-100 scale-105"
                    : "opacity-50 hover:opacity-90"
                }`}
              >
                <img
                  src={image.thumb ?? image.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
}
