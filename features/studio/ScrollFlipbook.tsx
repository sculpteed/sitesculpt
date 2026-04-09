'use client';

import { useEffect, useRef } from 'react';

export interface ScrollFlipbookProps {
  /**
   * Function that returns the image URL for a 1-indexed frame number.
   * e.g. `(n) => \`/api/preview/abc123/frames/\${n}\``
   */
  frameUrl: (index: number) => string;
  frameCount: number;
  /** Relative scroll height in viewport units — how much scroll space the flipbook consumes. */
  scrollVh?: number;
  className?: string;
  /** Background color while frames are loading */
  backgroundColor?: string;
}

/**
 * Canvas-based scroll flipbook with critical-damped rAF easing and a sliding
 * prefetch window. This is what gives us smoother motion than Draftly's naive
 * Math.floor(progress * n) snap.
 *
 * Design notes:
 * - Frames are preloaded into an HTMLImageElement[] keyed by index.
 * - We prefetch a sliding window [current-1, current+3] around the scroll target.
 * - A rAF loop eases `currentFrameFloat` toward `targetFrameFloat` and redraws.
 * - Drawing is a single drawImage call with object-fit: cover math.
 */
export function ScrollFlipbook({
  frameUrl,
  frameCount,
  scrollVh = 400,
  className,
  backgroundColor = '#000000',
}: ScrollFlipbookProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Preload the first frame eagerly so we have something to draw immediately
  useEffect(() => {
    if (frameCount === 0) return;
    const map = framesRef.current;
    const seed = (idx: number) => {
      if (map.has(idx)) return;
      const img = new Image();
      img.src = frameUrl(idx);
      img.decoding = 'async';
      map.set(idx, img);
    };
    // Seed first 8 frames upfront
    for (let i = 1; i <= Math.min(8, frameCount); i += 1) seed(i);
  }, [frameCount, frameUrl]);

  // Resize canvas to match device pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resize = (): void => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Scroll listener: update targetFrame based on wrapper position in viewport
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || frameCount === 0) return;

    const onScroll = (): void => {
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // progress: 0 when wrapper top hits viewport top, 1 when wrapper bottom leaves viewport top
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
      targetRef.current = progress * (frameCount - 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [frameCount]);

  // rAF ease loop + draw + sliding prefetch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const map = framesRef.current;

    const ensureLoaded = (idx: number): void => {
      const clamped = Math.max(1, Math.min(frameCount, idx));
      if (map.has(clamped)) return;
      const img = new Image();
      img.src = frameUrl(clamped);
      img.decoding = 'async';
      map.set(clamped, img);
    };

    const drawFrame = (idx: number): void => {
      const clamped = Math.max(1, Math.min(frameCount, idx));
      // Find closest loaded frame so we always draw something
      let img = map.get(clamped);
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let delta = 1; delta <= 8; delta += 1) {
          img =
            map.get(clamped - delta)?.complete ? map.get(clamped - delta) : undefined;
          if (img && img.naturalWidth > 0) break;
          img = map.get(clamped + delta)?.complete ? map.get(clamped + delta) : undefined;
          if (img && img.naturalWidth > 0) break;
        }
      }
      if (!img || img.naturalWidth === 0) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
      // object-fit: cover
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    // Critical-damped spring: smooth & fast without overshoot
    const stiffness = 0.2;
    let lastTargetIdx = -1;

    const loop = (): void => {
      const target = targetRef.current;
      const delta = target - currentRef.current;
      currentRef.current += delta * stiffness;
      const idx = Math.round(currentRef.current) + 1; // 1-indexed

      // Prefetch sliding window
      if (idx !== lastTargetIdx) {
        lastTargetIdx = idx;
        for (let d = -1; d <= 3; d += 1) ensureLoaded(idx + d);
      }

      drawFrame(idx);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, frameUrl, backgroundColor]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: 'relative',
        height: `${scrollVh}vh`,
        width: '100%',
        backgroundColor,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'block',
        }}
      />
    </div>
  );
}
