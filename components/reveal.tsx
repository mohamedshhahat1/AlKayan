"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  x = 0,
  scale = 1,
  once = true,
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
  /**
   * Heading level for the title.
   *
   * h2 everywhere by default, which is right when this heading introduces one
   * section of a longer page. On a route whose whole subject is this section —
   * /services, /projects, /about, /contact — it is the page's one h1 instead,
   * and the route says so.
   *
   * A level, not a look: both render with identical classes, so promoting a
   * heading changes the document outline and nothing on screen.
   */
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div className={cn(center ? "text-center mx-auto" : "text-right", "max-w-3xl", className)}>
      {eyebrow && (
        <Reveal>
          <span className="inline-block text-sm font-bold tracking-[0.3em] text-gold uppercase mb-4">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.1}>
        <Heading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight text-balance">
          {title}
        </Heading>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.2}>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}

type CounterProps = {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function Counter({ target, suffix = "", duration = 2, className }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = (now - start) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
