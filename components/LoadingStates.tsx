'use client';

import { motion } from 'motion/react';

/**
 * Shimmer skeleton — animated gradient sweep that signals "loading" without
 * a spinner. Used behind keyframe generation, art direction, etc.
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div className="absolute inset-0 bg-[var(--color-bg-elevated,#15100c)]" />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(243,234,217,0.04) 40%, rgba(243,234,217,0.08) 50%, rgba(243,234,217,0.04) 60%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

/**
 * Pulsing dot row — three dots that bounce sequentially.
 * Shows alongside "Generating..." text so the user sees continuous motion.
 */
export function PulsingDots({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

/**
 * Animated border ring — a rotating conic gradient border that wraps
 * a container during loading. Premium feel, subtle, unmistakably "active."
 */
export function LoadingRing({
  children,
  active,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  if (!active) return <div className={className}>{children}</div>;
  return (
    <div className={`relative ${className ?? ''}`}>
      <motion.div
        className="absolute -inset-[1px] rounded-[inherit] opacity-60"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0%, var(--color-accent, #e8b874) 25%, transparent 50%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative rounded-[inherit] bg-[var(--color-bg,#0d0a08)]">
        {children}
      </div>
    </div>
  );
}

/**
 * Step progress indicator — shows which step is active with a dot that
 * pulses. Used in the funnel breadcrumb.
 */
export function StepDot({ active, done }: { active: boolean; done: boolean }) {
  if (done) {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent,#e8b874)]">
        <svg className="h-3 w-3 text-[#0d0a08]" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (active) {
    return (
      <motion.div
        className="h-6 w-6 rounded-full border-2 border-[var(--color-accent,#e8b874)]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    );
  }
  return <div className="h-6 w-6 rounded-full border border-[var(--color-border-strong,rgba(243,234,217,0.2))]" />;
}
