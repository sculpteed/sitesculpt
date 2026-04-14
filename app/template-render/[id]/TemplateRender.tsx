'use client';

import type { TemplateConfig } from '@/features/studio/templates-config';

interface Props {
  config: TemplateConfig;
  bgUrl: string | null;
}

/**
 * Renders the hero overlay on top of the background image at 1376x768.
 * Supports distinct siteStyle variants so every template feels different.
 */
export function TemplateRender({ config, bgUrl }: Props) {
  const style = config.siteStyle ?? 'floating-pill';
  const isDark = config.theme === 'dark';
  const isCream = config.theme === 'cream';
  const textColor = isDark ? '#F4EFE6' : '#141210';
  const mutedColor = isDark ? 'rgba(244,239,230,0.7)' : 'rgba(20,18,16,0.7)';
  const subtleColor = isDark ? 'rgba(244,239,230,0.45)' : 'rgba(20,18,16,0.5)';
  const bgFallback = isDark ? '#0a0a14' : isCream ? '#F4EFE6' : '#eef5ff';
  const navPillBg = isDark ? 'rgba(10,10,20,0.45)' : 'rgba(255,255,255,0.55)';
  const navPillBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(20,18,16,0.08)';
  const navPillShadow = isDark
    ? '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset'
    : '0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.3) inset';

  const headlineFontFamily =
    config.headlineFont === 'serif'
      ? '"Cormorant Garamond", "DM Serif Display", Georgia, serif'
      : config.headlineFont === 'display'
        ? '"Space Grotesk", Inter, sans-serif'
        : '"Inter", "Geist", sans-serif';

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
      {bgUrl && (
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
      )}

      {/* Legibility overlay */}
      {isDark && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,10,20,0.25) 0%, rgba(10,10,20,0.1) 50%, rgba(10,10,20,0.4) 100%)',
          }}
        />
      )}

      {/* ─── NAV VARIANTS ────────────────────────────────────────────────── */}
      {style === 'floating-pill' && (
        <FloatingPillNav
          config={config}
          textColor={textColor}
          mutedColor={mutedColor}
          bg={navPillBg}
          border={navPillBorder}
          shadow={navPillShadow}
        />
      )}
      {style === 'editorial-split' && (
        <EditorialSplitNav
          config={config}
          textColor={textColor}
          mutedColor={mutedColor}
        />
      )}
      {style === 'minimal-top-bar' && (
        <MinimalTopBarNav
          config={config}
          textColor={textColor}
          mutedColor={mutedColor}
        />
      )}
      {style === 'centered-split-nav' && (
        <CenteredSplitNav
          config={config}
          textColor={textColor}
          mutedColor={mutedColor}
        />
      )}
      {style === 'boutique-corner' && (
        <BoutiqueCornerNav
          config={config}
          textColor={textColor}
          mutedColor={mutedColor}
        />
      )}

      {/* ─── HERO CONTENT ────────────────────────────────────────────────── */}
      <HeroContent
        config={config}
        style={style}
        textColor={textColor}
        mutedColor={mutedColor}
        subtleColor={subtleColor}
        isDark={isDark}
        headlineFontFamily={headlineFontFamily}
        renderHeadline={renderHeadline}
      />
    </div>
  );
}

// ─── Nav variants ────────────────────────────────────────────────────────────

function FloatingPillNav({ config, textColor, mutedColor, bg, border, shadow }: any) {
  return (
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
        background: bg,
        border: `1px solid ${border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: shadow,
        zIndex: 10,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 15, color: textColor, paddingRight: 4 }}>
        {config.brandName}
      </div>
      {config.nav.map((item: string) => (
        <div key={item} style={{ fontSize: 13, fontWeight: 500, color: mutedColor }}>
          {item}
        </div>
      ))}
      <button
        style={{
          background: config.accentColor,
          color: '#0a0a14',
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
  );
}

function EditorialSplitNav({ config, textColor, mutedColor }: any) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 32,
        left: 48,
        right: 48,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: textColor,
        }}
      >
        {config.brandName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {config.nav.map((item: string) => (
          <div
            key={item}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            {item}
          </div>
        ))}
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: textColor,
            padding: '6px 14px',
            border: `1px solid ${textColor}`,
            borderRadius: 0,
          }}
        >
          {config.navCta}
        </div>
      </div>
    </div>
  );
}

function MinimalTopBarNav({ config, textColor, mutedColor }: any) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 56px',
        zIndex: 10,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', color: textColor }}>
        {config.brandName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        {config.nav.map((item: string) => (
          <div
            key={item}
            style={{ fontSize: 13, fontWeight: 500, color: mutedColor }}
          >
            {item}
          </div>
        ))}
        <button
          style={{
            background: config.accentColor,
            color: '#0a0a14',
            fontWeight: 600,
            fontSize: 13,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            marginLeft: 8,
          }}
        >
          {config.navCta}
        </button>
      </div>
    </div>
  );
}

function CenteredSplitNav({ config, textColor, mutedColor }: any) {
  const leftNav = config.nav.slice(0, Math.ceil(config.nav.length / 2));
  const rightNav = config.nav.slice(Math.ceil(config.nav.length / 2));
  return (
    <div
      style={{
        position: 'absolute',
        top: 32,
        left: 48,
        right: 48,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 40,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 28, justifyContent: 'flex-end' }}>
        {leftNav.map((item: string) => (
          <div
            key={item}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 28,
          fontStyle: 'italic',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: textColor,
          textAlign: 'center',
        }}
      >
        {config.brandName}
      </div>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {rightNav.map((item: string) => (
          <div
            key={item}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            {item}
          </div>
        ))}
        <button
          style={{
            background: config.accentColor,
            color: '#0a0a14',
            fontWeight: 600,
            fontSize: 12,
            padding: '10px 20px',
            borderRadius: 999,
            border: 'none',
            letterSpacing: '0.04em',
            marginLeft: 8,
          }}
        >
          {config.navCta}
        </button>
      </div>
    </div>
  );
}

function BoutiqueCornerNav({ config, textColor, mutedColor }: any) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 48px',
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 32,
          fontStyle: 'italic',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: textColor,
        }}
      >
        {config.brandName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {config.nav.map((item: string) => (
          <div
            key={item}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            {item}
          </div>
        ))}
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: textColor,
            padding: '8px 14px',
            background: textColor === '#141210' ? 'transparent' : 'transparent',
            border: `1px solid ${textColor}`,
            marginLeft: 4,
          }}
        >
          {config.navCta}
        </div>
      </div>
    </div>
  );
}

// ─── Hero content ────────────────────────────────────────────────────────────

function HeroContent({
  config,
  style,
  textColor,
  mutedColor,
  subtleColor,
  isDark,
  headlineFontFamily,
  renderHeadline,
}: any) {
  const isSplitLeft = config.layout === 'split-left';

  // Large Apple-style centered for minimal-top-bar
  const isMinimalStyle = style === 'minimal-top-bar';
  const isBoutique = style === 'boutique-corner';
  const isSplitNav = style === 'centered-split-nav';

  const headlineSize = isMinimalStyle ? 72 : config.headlineFont === 'serif' ? 64 : 58;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isSplitLeft || isBoutique ? 'flex-start' : 'center',
        justifyContent: 'center',
        textAlign: isSplitLeft || isBoutique ? 'left' : 'center',
        padding: isSplitLeft ? '0 0 0 80px' : isBoutique ? '0 0 0 48px' : '0 80px',
        paddingRight: isSplitLeft ? '50%' : isBoutique ? '50%' : '80px',
      }}
    >
      <h1
        style={{
          fontFamily: headlineFontFamily,
          fontSize: headlineSize,
          lineHeight: config.headlineFont === 'serif' ? 1.05 : 1.0,
          letterSpacing: '-0.025em',
          fontWeight: config.headlineFont === 'serif' ? 500 : 700,
          color: textColor,
          margin: 0,
          marginBottom: 18,
          maxWidth: isSplitLeft || isBoutique ? 560 : 780,
          textShadow: isDark ? '0 2px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {renderHeadline()}
      </h1>
      <p
        style={{
          fontSize: 15.5,
          lineHeight: 1.55,
          color: mutedColor,
          margin: 0,
          marginBottom: 28,
          maxWidth: 520,
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
          justifyContent: isSplitLeft || isBoutique ? 'flex-start' : 'center',
          marginBottom: config.stats || config.smallLabel ? 32 : 0,
        }}
      >
        <button
          style={{
            background: config.accentColor,
            color: isDark ? '#0a0a14' : '#fff',
            fontWeight: 600,
            fontSize: 14,
            padding: '14px 24px',
            borderRadius: isBoutique || isSplitNav ? 0 : 999,
            border: 'none',
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
              borderRadius: isBoutique || isSplitNav ? 0 : 999,
              border: `1px solid ${isDark ? 'rgba(244,239,230,0.2)' : 'rgba(20,18,16,0.15)'}`,
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
            color: subtleColor,
            fontWeight: 500,
            marginTop: 4,
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
            justifyContent: isSplitLeft || isBoutique ? 'flex-start' : 'center',
          }}
        >
          {config.stats.map((s: any) => (
            <div
              key={s.label}
              style={{ textAlign: isSplitLeft || isBoutique ? 'left' : 'center' }}
            >
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
  );
}
