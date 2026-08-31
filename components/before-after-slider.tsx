"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BeforeAfterSliderProps = {
  before: string;
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

/** Held until an image reports its real shape. Landscape, like most photographs. */
const DEFAULT_RATIO = 3 / 2;

/**
 * The shape of an <img> that has just loaded, or null if it reported nothing.
 *
 * Guarded because a decode failure fires load with 0x0 in some browsers, and
 * dividing by that would put NaN into the container's aspect-ratio.
 */
function naturalRatio(image: HTMLImageElement): number | null {
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) return null;

  return naturalWidth / naturalHeight;
}

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt = "قبل",
  afterAlt = "بعد",
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  // The pair's shape, measured off the first image to arrive. Until then the
  // box holds the 3:2 most photographs are, so it never has zero height and the
  // page does not reflow around a collapsed slider.
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const containerRef = useRef<HTMLDivElement>(null);

  // A new pair is usually a new shape, and the old one must not be kept while
  // its image loads. Call sites that remount on change (key={pair.id}) get this
  // for free; the project page, which swaps the props in place, does not.
  useEffect(() => {
    setRatio(DEFAULT_RATIO);
  }, [before, after]);

  const setFromClientX = useCallback((clientX: number) => {
    const element = containerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => setFromClientX(event.clientX);
    const stop = () => setDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, setFromClientX]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 10 : 2;
    switch (event.key) {
      case "ArrowRight":
        setPosition((value) => clamp(value + step));
        break;
      case "ArrowLeft":
        setPosition((value) => clamp(value - step));
        break;
      case "Home":
        setPosition(0);
        break;
      case "End":
        setPosition(100);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  const rounded = Math.round(position);

  return (
    <div
      ref={containerRef}
      onPointerDown={(event) => {
        setDragging(true);
        setFromClientX(event.clientX);
      }}
      className={cn(
        "relative mx-auto overflow-hidden glass select-none touch-none cursor-ew-resize",
        className
      )}
      style={{
        aspectRatio: ratio,
        // Full width, except that the box may not grow taller than --ba-h — so
        // a portrait pair narrows instead of running down the page. Sizing the
        // box to the photograph rather than the photograph to a fixed box is
        // the whole point: object-cover in a box of the wrong shape was cutting
        // the top and bottom off the landscape pairs and most of the portrait
        // ones. Callers set --ba-h per breakpoint; the fallback is for any that
        // forget.
        width: `min(100%, calc(var(--ba-h, 26rem) * ${ratio}))`,
      }}
    >
      <img
        src={after}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        onLoad={(event) => {
          const measured = naturalRatio(event.currentTarget);
          if (measured) setRatio(measured);
        }}
      />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={before}
          alt={beforeAlt}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      <span className="absolute top-4 right-4 z-10 glass-gold text-gold text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
        {beforeAlt}
      </span>
      <span className="absolute top-4 left-4 z-10 glass-gold text-gold text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full">
        {afterAlt}
      </span>

      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 z-10 w-1 bg-gold pointer-events-none"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      />

      <button
        type="button"
        role="slider"
        aria-label="مقارنة قبل وبعد"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={`${rounded}% من صورة ${beforeAlt}`}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          event.stopPropagation();
          setDragging(true);
        }}
        className="absolute top-1/2 z-20 w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center shadow-2xl shadow-gold/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-transparent cursor-ew-resize"
        style={{ left: `${position}%`, transform: "translate(-50%, -50%)", color: "#111111" }}
      >
        <span aria-hidden="true" className="text-lg font-bold">
          ⟷
        </span>
      </button>
    </div>
  );
}
