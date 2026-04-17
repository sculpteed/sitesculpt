'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import {
  motion,
  useInView,
  type UseInViewOptions,
} from 'motion/react';
import Lenis from 'lenis';

// ─── SmoothScroll ───────────────────────────────────────────────────────────
// Wrap the entire page for buttery scroll. Used on homepage, studio, pricing.

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let rafId: number;
    const raf = (time: number): void => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}

// ─── FadeIn ─────────────────────────────────────────────────────────────────
// Scroll-triggered fade + slide up. The building block for everything.

export function FadeIn({
  children,
  delay = 0,
  y = 20,
  duration = 0.65,
  amount = 0.3,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  amount?: UseInViewOptions['amount'];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerGroup ───────────────────────────────────────────────────────────
// Parent that staggers its children's entrance.

export function StaggerGroup({
  children,
  stagger = 0.06,
  amount = 0.15,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  amount?: UseInViewOptions['amount'];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── ScaleOnHover ───────────────────────────────────────────────────────────
// Subtle lift + scale on hover for cards, buttons, links.

export function ScaleOnHover({
  children,
  className,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── PageTransition ─────────────────────────────────────────────────────────
// Wrap page content for a fade-in-up on mount. Gives that "arriving" feel.

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── GlowPulse ──────────────────────────────────────────────────────────────
// Subtle pulsing glow behind an element — premium ambient effect.

export function GlowPulse({
  children,
  color = 'var(--color-accent, #e8b874)',
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative ${className ?? ''}`}
      animate={{
        boxShadow: [
          `0 0 20px 0px ${color}00`,
          `0 0 40px 8px ${color}18`,
          `0 0 20px 0px ${color}00`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
