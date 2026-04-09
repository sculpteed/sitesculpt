'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  useScroll,
  type UseInViewOptions,
} from 'motion/react';

// ─── Reveal ─────────────────────────────────────────────────────────────────
// Scroll-triggered fade-in + slide-up. Every section gets wrapped in this so
// content feels like it's arriving rather than sitting there.

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  amount?: UseInViewOptions['amount'];
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  amount = 0.2,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerChildren ────────────────────────────────────────────────────────
// Wrap a grid/list to have each child fade in with a delay. The child must
// use <StaggerItem> to opt in.

interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  amount?: UseInViewOptions['amount'];
  className?: string;
}

export function Stagger({ children, stagger = 0.08, amount = 0.15, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: { opacity: 1 },
        show: {
          opacity: 1,
          transition: { staggerChildren: stagger, delayChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── CountUp ────────────────────────────────────────────────────────────────
// Animated number counter for stat-grid values. Parses a numeric value out of
// a string (e.g. "97%" → 97, "<2 min" → 2, "140K+" → 140) and counts up from 0
// when the element enters the viewport, preserving the surrounding formatting.

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

export function CountUp({ value, duration = 1.5, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  // Parse the first number out of the string (handles "97%", "<2 min", "140K+", etc.)
  const match = value.match(/(-?\d+\.?\d*)/);
  const target = match ? parseFloat(match[0]) : 0;
  const prefix = match ? value.slice(0, match.index!) : '';
  const suffix = match ? value.slice(match.index! + match[0].length) : value;

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    Number.isInteger(target) ? String(Math.round(v)) : v.toFixed(1),
  );
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (!inView || target === 0) return;
    const controls = animate(count, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, target, duration, count]);

  // If target is 0, just render the value statically (e.g. "0 bytes sent")
  if (target === 0) {
    return <span ref={ref} className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ─── Marquee ────────────────────────────────────────────────────────────────
// Infinite horizontal scroll for logo strips. Duplicates the children and
// animates the container's x-position for a seamless loop.

export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: ReactNode;
  speed?: number; // seconds per full loop
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.div
        className="flex shrink-0 gap-14 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center gap-14">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-14">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ─── HeroParallax ───────────────────────────────────────────────────────────
// Wraps hero text in a container that moves slower than scroll — classic
// parallax effect that makes the hero feel like it has depth.

export function HeroParallax({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── HoverLift ──────────────────────────────────────────────────────────────
// Subtle hover scale+shadow for interactive cards (pricing tiers, team
// members, feature grids).

export function HoverLift({
  children,
  className,
  scale = 1.015,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
