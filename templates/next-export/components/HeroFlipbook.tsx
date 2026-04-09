'use client';

import { useEffect, useRef } from 'react';

interface HeroFlipbookProps {
  frameCount: number;
  scrollVh?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

/**
 * Standalone scroll flipbook for exported sitesculpt projects. Reads frames
 * from public/frames/ (0001.jpg, 0002.jpg …). Canvas + rAF easing + sliding
 * prefetch window. Zero runtime deps beyond React.
 */
export function HeroFlipbook({
  frameCount,
  scrollVh = 300,
  backgroundColor = '#000',
  children,
}: HeroFlipbookProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (frameCount === 0) return;
    const map = framesRef.current;
    for (let i = 1; i <= Math.min(8, frameCount); i += 1) {
      if (map.has(i)) continue;
      const img = new Image();
      img.src = `/frames/${String(i).padStart(4, '0')}.jpg`;
      img.decoding = 'async';
      map.set(i, img);
    }
  }, [frameCount]);

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

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || frameCount === 0) return;
    const onScroll = (): void => {
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight || 1;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const map = framesRef.current;

    const ensureLoaded = (idx: number): void => {
      const c = Math.max(1, Math.min(frameCount, idx));
      if (map.has(c)) return;
      const img = new Image();
      img.src = `/frames/${String(c).padStart(4, '0')}.jpg`;
      img.decoding = 'async';
      map.set(c, img);
    };

    const drawFrame = (idx: number): void => {
      const c = Math.max(1, Math.min(frameCount, idx));
      let img = map.get(c);
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let d = 1; d <= 8; d += 1) {
          const a = map.get(c - d);
          if (a && a.complete && a.naturalWidth > 0) { img = a; break; }
          const b = map.get(c + d);
          if (b && b.complete && b.naturalWidth > 0) { img = b; break; }
        }
      }
      if (!img || img.naturalWidth === 0) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }
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

    const stiffness = 0.2;
    let lastIdx = -1;
    const loop = (): void => {
      const delta = targetRef.current - currentRef.current;
      currentRef.current += delta * stiffness;
      const idx = Math.round(currentRef.current) + 1;
      if (idx !== lastIdx) {
        lastIdx = idx;
        for (let d = -1; d <= 3; d += 1) ensureLoaded(idx + d);
      }
      drawFrame(idx);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, backgroundColor]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        height: `${scrollVh}vh`,
        width: '100%',
        backgroundColor,
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {children}
      </div>
    </div>
  );
}
