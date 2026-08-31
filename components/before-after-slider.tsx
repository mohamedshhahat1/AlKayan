"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { fittedBox, useNaturalRatio } from "@/hooks/use-natural-ratio";

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

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt = "قبل",
  afterAlt = "بعد",
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  // The pair's shape, measured off the after image. Both halves are the same
  // photograph of the same room, so one measurement sizes the box for both.
  const { ratio, onLoad } = useNaturalRatio(before, after);
  const containerRef = useRef<HTMLDivElement>(null);

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
      style={fittedBox(ratio)}
    >
      <img
        src={after}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        onLoad={onLoad}
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
