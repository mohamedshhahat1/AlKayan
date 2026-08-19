"use client";

import React, { useEffect, useRef, useState, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A single item on the ring.
 *
 * The field names are the published component's, which was written for a
 * wildlife gallery: `common` is the headline, `binomial` the line under it and
 * `photo.by` the credit. They are kept verbatim so this file stays a paste of
 * its source and can be re-pasted when it changes upstream; the mapping from
 * this project's own shapes happens at the call site instead — see
 * components/sections/projects-gallery-section.tsx.
 */
export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

export interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  /**
   * The element whose scroll-through drives the rotation: one full turn is
   * mapped onto the distance the viewport travels through it.
   *
   * Added for this codebase. Upstream always measured whole-document scroll,
   * which is right when the gallery *is* the page — as in its demo, a 500vh
   * wrapper and nothing else — but wrong for one section of a long homepage,
   * where scrolling past it would advance the ring by only a few degrees. Omit
   * this prop and the original whole-document behaviour is used unchanged.
   */
  scrollTargetRef?: { current: HTMLElement | null };
  /**
   * Text before the photo credit. Defaults to the original English label so
   * the component behaves as published when it is not passed.
   */
  creditLabel?: string;
}

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** Whole-document scroll progress, 0 to 1. The published behaviour. */
function documentScrollProgress(): number {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  return scrollableHeight > 0 ? clamp01(window.scrollY / scrollableHeight) : 0;
}

/**
 * How far the viewport has travelled through `element`, 0 to 1.
 *
 * 0 while its top edge is still below the top of the viewport, 1 once its
 * bottom edge has reached it — i.e. exactly the window during which a sticky
 * child of that element is pinned.
 */
function elementScrollProgress(element: HTMLElement | null): number {
  if (!element) return 0;

  const rect = element.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) return 0;

  return clamp01(-rect.top / travel);
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius = 600,
      autoRotateSpeed = 0.02,
      scrollTargetRef,
      creditLabel = "Photo by:",
      ...props
    },
    ref
  ) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    // ReturnType<typeof setTimeout> rather than NodeJS.Timeout: this runs in the
    // browser, where setTimeout returns a number, and the Node type is only in
    // scope here by accident of @types/node being installed.
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Effect to handle scroll-based rotation
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const scrollProgress = scrollTargetRef
          ? elementScrollProgress(scrollTargetRef.current)
          : documentScrollProgress();

        setRotation(scrollProgress * 360);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [scrollTargetRef]);

    // Effect for auto-rotation when not scrolling
    useEffect(() => {
      // A speed of 0 means "hold still" — used for prefers-reduced-motion — so
      // do not keep a requestAnimationFrame loop alive to add nothing to the
      // rotation on every frame.
      if (autoRotateSpeed === 0) return;

      const autoRotate = () => {
        if (!isScrolling) {
          setRotation((prev) => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, autoRotateSpeed]);

    // Guarded: an empty array would make this NaN and every transform invalid.
    const anglePerItem = items.length > 0 ? 360 / items.length : 0;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full h-full flex items-center justify-center", className)}
        style={{ perspective: "2000px" }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(
              relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
            );
            const opacity = Math.max(0.3, 1 - normalizedAngle / 180);

            return (
              <div
                key={item.photo.url}
                role="group"
                aria-label={item.common}
                className="absolute w-[300px] h-[400px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-150px",
                  marginTop: "-200px",
                  opacity: opacity,
                  transition: "opacity 0.3s linear",
                }}
              >
                <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden group border border-border bg-card/70 dark:bg-card/30 backdrop-blur-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element -- the
                      ring positions its own fixed-size cards in 3D; next/image
                      adds a wrapper and sizing of its own for no benefit here,
                      and the rest of the galleries on this site are plain img
                      tags too. */}
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: item.photo.pos || "center" }}
                  />
                  {/* Replaced text-primary-foreground with text-white for consistent color */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                    {/* h3, not h2: this sits under the section's own h2, and a
                        ring of ten h2s would flatten the page outline. */}
                    <h3 className="text-xl font-bold">{item.common}</h3>
                    <em className="text-sm italic opacity-80">{item.binomial}</em>
                    <p className="text-xs mt-2 opacity-70">
                      {creditLabel} {item.photo.by}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
