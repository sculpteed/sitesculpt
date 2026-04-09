'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';

/**
 * Lenis smooth scroll — wraps the preview route so scrolling feels like a
 * premium site. Lenis hijacks native scroll with a rAF-driven interpolation,
 * giving that Linear/Vercel/Framer buttery feel instead of the browser's
 * hard discrete scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
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
