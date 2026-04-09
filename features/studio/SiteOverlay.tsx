'use client';

import { useStudioStore } from './store';

/**
 * Renders hero copy + sections overlaid on the flipbook/keyframe.
 * Copy is editable inline while the video is still cooking — the biggest
 * speed-UX win: users make the site theirs during the wait instead of staring.
 */
export function SiteOverlay() {
  const site = useStudioStore((s) => s.site);
  const scene = useStudioStore((s) => s.scene);
  const heroOverride = useStudioStore((s) => s.heroOverride);
  const setHeroOverride = useStudioStore((s) => s.setHeroOverride);

  if (!site) return null;

  const headline = heroOverride.headline ?? site.hero.headline;
  const subheadline = heroOverride.subheadline ?? site.hero.subheadline;
  const cta = heroOverride.ctaPrimary ?? site.hero.ctaPrimary;

  const paletteStyle: React.CSSProperties = scene
    ? {
        // Use accent for CTA tint
        '--accent': scene.palette.accent,
      } as React.CSSProperties
    : {};

  return (
    <div
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-8 md:p-16"
      style={paletteStyle}
    >
      {/* Top: brand mark */}
      <div className="pointer-events-auto flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/90 backdrop-blur">
          {site.brandName}
        </span>
      </div>

      {/* Bottom: editable hero */}
      <div className="pointer-events-auto max-w-3xl space-y-4">
        <h1
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            setHeroOverride({ headline: e.currentTarget.textContent ?? undefined })
          }
          className="text-5xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl outline-none focus:[text-shadow:0_0_0_#fff] md:text-7xl"
        >
          {headline}
        </h1>
        <p
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) =>
            setHeroOverride({ subheadline: e.currentTarget.textContent ?? undefined })
          }
          className="max-w-xl text-lg text-white/85 drop-shadow-md outline-none md:text-xl"
        >
          {subheadline}
        </p>
        <div className="flex gap-3">
          <button
            className="rounded-md px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
            style={{ backgroundColor: scene?.palette.accent ?? '#ffffff' }}
          >
            {cta}
          </button>
          {site.hero.ctaSecondary ? (
            <button className="rounded-md border border-white/30 bg-black/30 px-5 py-2.5 text-sm font-medium text-white backdrop-blur hover:bg-white/10">
              {site.hero.ctaSecondary}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
