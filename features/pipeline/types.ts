// Contracts for the sitesculpt generation pipeline.
// These are the single source of truth — steps, API routes, and UI all import from here.

export type Aspect = '16:9' | '9:16' | '1:1';

export type StepName =
  | 'expandPrompt'
  | 'composeSite'
  | 'generateImage'
  | 'generateVideo'
  | 'extractFrames';

export interface Progress {
  state: 'pending' | 'running' | 'done' | 'error';
  /** Optional 0..1 progress for long-running steps (generateVideo) */
  pct?: number;
  /** Human-readable message, e.g. "Polling Sora (attempt 14)" */
  message?: string;
  error?: string;
}

// ─── Scene (output of expandPrompt) ──────────────────────────────────────────

export interface Palette {
  background: string; // hex
  foreground: string;
  accent: string;
}

/** Style tokens that control how the renderer varies its visual approach per
 *  generation. Claude picks these in expandPrompt based on the brief's tone
 *  and brand archetype. The renderer reads them to produce visually distinct
 *  output — same layout types, different visual expression. */
export interface DesignStyle {
  /** Hero composition variant */
  heroLayout: 'bottom-left' | 'centered' | 'split';
  /** Typography personality */
  typography: 'editorial' | 'geometric' | 'expressive';
  /** How the accent color is primarily used */
  accentUsage: 'text' | 'backgrounds' | 'borders';
  /** Section density / whitespace */
  density: 'spacious' | 'balanced' | 'compact';
}

export interface Scene {
  /** Cinematic prompt for gpt-image-1.5 */
  visualPrompt: string;
  /** Motion description for sora-2 image-to-video */
  motionPrompt: string;
  /** Theme colors derived from the brief */
  palette: Palette;
  /** One-line distilled concept used as hero sub-tagline fallback */
  concept: string;
  /** Style tokens that control rendering variation */
  style?: DesignStyle;
}

// ─── SiteStructure (output of composeSite) ───────────────────────────────────

/** Layout ids — keep in sync with features/studio/layouts.ts */
export type SectionLayout =
  | 'intro'
  | 'feature-grid'
  | 'split-image'
  | 'stat-grid'
  | 'quote'
  | 'numbered-steps'
  | 'faq-accordion'
  | 'logo-strip'
  | 'pricing-tiers'
  | 'team-grid'
  | 'testimonial-wall'
  | 'contact-block'
  | 'cta';

/**
 * A sub-item inside a section. Fields are intentionally loose so one type
 * covers features, stats, steps, FAQs, logos, team members, tiers, and
 * testimonials. Each layout reads the fields it cares about.
 *
 * Field usage per layout:
 *   feature-grid / numbered-steps: { name, description }
 *   stat-grid:                     { name (label), value (big number) }
 *   faq-accordion:                 { name (question), description (answer) }
 *   logo-strip:                    { name (company) }
 *   pricing-tiers:                 { name (tier name), value (price),
 *                                    description (tagline), features[], cta }
 *   team-grid:                     { name, role (as description), bio, avatarUrl }
 *   testimonial-wall:              { name, description (role/company),
 *                                    quote, avatarUrl }
 *   contact-block:                 { name (label), value (link or address) }
 */
export interface SectionItem {
  name: string;
  description?: string;
  value?: string;

  // Extended fields for the new layouts
  role?: string;
  bio?: string;
  quote?: string;
  avatarUrl?: string;
  features?: string[];
  cta?: string;
  highlighted?: boolean; // for pricing-tiers: which tier is recommended
}

export interface SiteSection {
  /** The layout template this section uses */
  layout: SectionLayout;
  /** Short eyebrow label that appears above the heading — Claude picks this
   *  per brand instead of the renderer hardcoding "Capabilities" every time. */
  label?: string;
  title: string;
  body: string;
  /** Optional CTA label */
  cta?: string;
  /** Sub-items (features, stats, steps, FAQs, logos, team, tiers, etc.) */
  items?: SectionItem[];
}

export interface SiteStructure {
  brandName: string;
  hero: {
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  sections: SiteSection[];
}

export interface PipelineResult {
  projectId: string;
  scene: Scene;
  site: SiteStructure;
  keyframePath: string;
  videoPath: string;
  frameCount: number;
}

export type ProgressCallback = (step: StepName, progress: Progress) => void;
