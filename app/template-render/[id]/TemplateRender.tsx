'use client';

import type { TemplateConfig } from '@/features/studio/templates-config';

interface Props {
  config: TemplateConfig;
  bgUrl: string | null;
}

/**
 * Renders the hero overlay on top of the background image.
 * Canvas is 1376x768 — matches Draftly's template JPEG dimensions.
 */
export function TemplateRender({ config, bgUrl }: Props) {
  const isDark = config.theme === 'dark';
  const isCream = config.theme === 'cream';
  const textColor = isDark ? '#F4EFE6' : '#141210';
  const mutedColor = isDark ? 'rgba(244,239,230,0.7)' : 'rgba(20,18,16,0.7)';
  const navBgColor = isDark ? 'rgba(10,10,20,0.45)' : 'rgba(255,255,255,0.55)';
  const navBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(20,18,16,0.08)';
  const bgFallback = isDark ? '#0a0a14' : isCream ? '#F4EFE6' : '#eef5ff';

  const headlineFontFamily =
    config.headlineFont === 'serif'
      ? '"Cormorant Garamond", "DM Serif Display", Georgia, serif'
      : config.headlineFont === 'display'
        ? '"Space Grotesk", Inter, sans-serif'
        : '"Inter", "Geist", sans-serif';

  // Split headline if there's an accent word (render with color/italic)
  const renderHeadline = (): React.ReactNode => {
    if (!config.headlineAccent) return config.headline;
    const idx = config.headline.lastIndexOf(config.headlineAccent);
    if (idx === -1) return config.headline;
    const before = config.headline.slice(0, idx);
    const after = config.headline.slice(idx + config.headlineAccent.length);
    return (
      <>
        {before}
        <span
          style={{
            fontStyle: config.headlineFont === 'serif' ? 'italic' : 'normal',
            background:
              config.headlineFont !== 'serif'
                ? `linear-gradient(135deg, ${config.accentColor}, ${config.accentColor}aa)`
                : 'none',
            WebkitBackgroundClip: config.headlineFont !== 'serif' ? 'text' : 'initial',
            WebkitTextFillColor:
              config.headlineFont !== 'serif' ? 'transparent' : 'inherit',
            color: config.headlineFont === 'serif' ? config.accentColor : 'inherit',
          }}
        >
          {config.headlineAccent}
        </span>
        {after}
      </>
    );
  };

  const centered = config.layout === 'centered';

  return (
    <div
      style={{
        width: 1376,
        height: 768,
        position: 'relative',
        overflow: 'hidden',
        background: bgFallback,
        fontFamily: '"Inter", "Geist", system-ui, sans-serif',
        color: textColor,
      }}
    >
      {/* AI background */}
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bgUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : null}

      {/* Subtle gradient for legibility (dark themes get bottom darken) */}
      {isDark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,10,20,0.35) 0%, rgba(10,10,20,0.15) 50%, rgba(10,10,20,0.55) 100%)',
          }}
        />
      )}

      {/* Floating nav pill */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          padding: '10px 14px 10px 20px',
          borderRadius: 999,
          background: navBgColor,
          border: `1px solid ${navBorder}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: isDark
            ? '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'
            : '0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.3) inset',
          zIndex: 10,
          fontSize: 13,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            letterSpacing: '-0.01em',
            fontSize: 15,
            color: textColor,
            paddingRight: 4,
          }}
        >
          {config.brandName}
        </div>
        {config.nav.map((item) => (
          <div
            key={item}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: mutedColor,
              letterSpacing: '-0.005em',
            }}
          >
            {item}
          </div>
        ))}
        <button
          style={{
            background: config.accentColor,
            color: isDark ? '#0a0a14' : '#fff',
            fontWeight: 600,
            fontSize: 12.5,
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            marginLeft: 4,
          }}
        >
          {config.navCta}
        </button>
      </div>

      {/* Hero content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: centered ? 'center' : 'flex-start',
          justifyContent: 'center',
          textAlign: centered ? 'center' : 'left',
          padding: centered ? '0 80px' : '0 100px',
          paddingLeft: config.layout === 'split-left' ? 100 : undefined,
          paddingRight: config.layout === 'split-right' ? 100 : undefined,
          maxWidth: config.layout !== 'centered' ? '55%' : undefined,
        }}
      >
        <h1
          style={{
            fontFamily: headlineFontFamily,
            fontSize: config.headlineFont === 'serif' ? 68 : 64,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            fontWeight: config.headlineFont === 'serif' ? 500 : 700,
            color: textColor,
            margin: 0,
            marginBottom: 18,
            maxWidth: 780,
            textShadow: isDark ? '0 2px 40px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {renderHeadline()}
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.55,
            color: mutedColor,
            margin: 0,
            marginBottom: 28,
            maxWidth: 560,
            textShadow: isDark ? '0 1px 20px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {config.subtext}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: centered ? 'center' : 'flex-start',
            marginBottom: config.stats || config.smallLabel ? 36 : 0,
          }}
        >
          <button
            style={{
              background: config.accentColor,
              color: isDark ? '#0a0a14' : '#fff',
              fontWeight: 600,
              fontSize: 14,
              padding: '14px 24px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${config.accentColor}33`,
            }}
          >
            {config.primaryCta}
          </button>
          {config.secondaryCta && (
            <button
              style={{
                background: 'transparent',
                color: textColor,
                fontWeight: 500,
                fontSize: 14,
                padding: '14px 24px',
                borderRadius: 999,
                border: `1px solid ${isDark ? 'rgba(244,239,230,0.2)' : 'rgba(20,18,16,0.15)'}`,
                cursor: 'pointer',
              }}
            >
              {config.secondaryCta}
            </button>
          )}
        </div>
        {config.smallLabel && (
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: mutedColor,
              fontWeight: 500,
              marginTop: 8,
            }}
          >
            {config.smallLabel}
          </div>
        )}
        {config.stats && (
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 16,
              justifyContent: centered ? 'center' : 'flex-start',
            }}
          >
            {config.stats.map((s) => (
              <div key={s.label} style={{ textAlign: centered ? 'center' : 'left' }}>
                <div
                  style={{
                    fontFamily: headlineFontFamily,
                    fontSize: 28,
                    fontWeight: 600,
                    color: textColor,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: mutedColor,
                    marginTop: 6,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
