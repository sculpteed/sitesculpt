import type { Scene, SiteStructure, SectionLayout } from '@/features/pipeline/types';

export interface CheckResult {
  name: string;
  pass: boolean;
  severity: 'error' | 'warn';
  message?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// AI-slop / generic-marketing patterns. Anchored so they catch the offending
// phrase as the START of a field (or as the whole field) — avoids false
// positives where a buzzword appears mid-sentence in legit copy.
//
// The system prompt explicitly bans most of these by name; this gate
// enforces it post-generation so they trigger a retry instead of shipping.
const GENERIC_PATTERNS: RegExp[] = [
  // Filler openers
  /^welcome to\b/i,
  /^lorem ipsum/i,
  // Generic CTAs
  /^click here\b/i,
  /^learn more\.?$/i,
  /^get started\.?$/i,
  /^sign up (now|today)\.?$/i,
  /^read more\.?$/i,
  /^find out more\.?$/i,
  /^discover more\.?$/i,
  // Hyperbole openers
  /^the (best|ultimate|leading|#1) /i,
  /^your (one[- ]stop|ultimate|all[- ]in[- ]one) /i,
  /^the (future|next[- ]generation) of /i,
  // Marketing verb-stacking
  /^revolutioniz(e|ing) /i,
  /^transform your /i,
  /^elevate your /i,
  /^supercharge your /i,
  /^empower (your|every|teams|customers|users) /i,
  /^unlock (your|the|new) /i,
  // Generic value props
  /\bworld[- ]class\b/i,
  /\bcutting[- ]edge\b/i,
  /\bbest[- ]in[- ]class\b/i,
  /\bindustry[- ]leading\b/i,
  /\bnext[- ]level\b/i,
  /\bseamless(ly)?\b/i,
  // Buzzword stacking — three+ vague abstract nouns in close range
  /\bsolutions?\s+(for|that)\s+(every|all)\b/i,
  /^the .* (platform|solution|engine) for /i,
];

// Strings that should never appear in user-facing output (provider leaks).
const PROVIDER_LEAKS: string[] = [
  'Claude',
  'GPT-',
  'OpenAI',
  'Sora',
  'Anthropic',
  'gpt-image',
  'sora-2',
  'ffmpeg',
];

// Layouts that MUST have items[] populated to render meaningfully, with
// the minimum item count for each. Below the floor the section renders
// thin and reads as broken / placeholder. The pipeline retries the gen
// once when this fails.
const LAYOUT_ITEM_FLOORS: Partial<Record<SectionLayout, number>> = {
  'feature-grid': 3,        // bento needs hero + at least 2 in the rest grid
  'stat-grid': 3,           // 4-col grid reads sparse with <3
  'quote': 1,               // attribution
  'numbered-steps': 3,      // process implies multi-step
  'faq-accordion': 3,       // <3 reads incomplete
  'logo-strip': 6,          // marquee needs density; grid alt minimum 4 still ok
  'pricing-tiers': 2,       // single-tier sites are rare
  'team-grid': 2,           // solo founder uses feature-grid instead
  'testimonial-wall': 2,    // single testimonial uses 'quote' layout
};

export function runChecks(scene: Scene, site: SiteStructure): CheckResult[] {
  return [
    checkHeroHeadline(site),
    checkHeroSubheadline(site),
    checkBrandName(site),
    checkSectionCount(site),
    checkLayoutVariety(site),
    checkLayoutItemsPopulated(site),
    checkSectionVariety(site),
    checkNoGenericCopy(site),
    checkNoProviderLeaks(scene, site),
    checkPaletteValidHex(scene),
    checkBodyLengthRanges(site),
    checkSceneFieldsPopulated(scene),
  ];
}

// ─── Individual checks ──────────────────────────────────────────────────────

function checkHeroHeadline(site: SiteStructure): CheckResult {
  const len = site.hero.headline.length;
  if (len < 3 || len > 80) {
    return {
      name: 'hero.headline length',
      pass: false,
      severity: 'error',
      message: `headline is ${len} chars, want 3–80`,
    };
  }
  return { name: 'hero.headline length', pass: true, severity: 'error' };
}

function checkHeroSubheadline(site: SiteStructure): CheckResult {
  const len = site.hero.subheadline.length;
  if (len < 10 || len > 160) {
    return {
      name: 'hero.subheadline length',
      pass: false,
      severity: 'error',
      message: `subheadline is ${len} chars, want 10–160`,
    };
  }
  return { name: 'hero.subheadline length', pass: true, severity: 'error' };
}

function checkBrandName(site: SiteStructure): CheckResult {
  const len = site.brandName.trim().length;
  if (len === 0 || len > 40) {
    return {
      name: 'brandName length',
      pass: false,
      severity: 'error',
      message: `brandName is ${len} chars, want 1–40`,
    };
  }
  return { name: 'brandName length', pass: true, severity: 'error' };
}

function checkSectionCount(site: SiteStructure): CheckResult {
  const n = site.sections.length;
  // Draftly-style: short, focused. 5–8 is the sweet spot. >8 reads padded.
  if (n < 5 || n > 8) {
    return {
      name: 'section count',
      pass: false,
      severity: 'error',
      message: `${n} sections, want 5–8`,
    };
  }
  return { name: 'section count', pass: true, severity: 'error' };
}

function checkLayoutVariety(site: SiteStructure): CheckResult {
  const unique = new Set(site.sections.map((s) => s.layout));
  if (unique.size < 4) {
    return {
      name: 'layout variety',
      pass: false,
      severity: 'error',
      message: `only ${unique.size} unique layouts used (${[...unique].join(', ')}), want ≥4`,
    };
  }
  return {
    name: 'layout variety',
    pass: true,
    severity: 'error',
    message: `${unique.size} unique`,
  };
}

function checkSectionVariety(site: SiteStructure): CheckResult {
  // No two adjacent sections may use the same layout. Prevents the "two
  // feature-grids back-to-back" / "stat-grid then another stat-grid" slop
  // that makes generated sites read as templated.
  const offenders: string[] = [];
  for (let i = 1; i < site.sections.length; i += 1) {
    const prev = site.sections[i - 1];
    const cur = site.sections[i];
    if (prev && cur && prev.layout === cur.layout) {
      offenders.push(`${i - 1}+${i}: ${cur.layout}`);
    }
  }
  if (offenders.length > 0) {
    return {
      name: 'section variety',
      pass: false,
      severity: 'error',
      message: `adjacent same-layout: ${offenders.join(', ')}`,
    };
  }
  return { name: 'section variety', pass: true, severity: 'error' };
}

function checkLayoutItemsPopulated(site: SiteStructure): CheckResult {
  const offenders: string[] = [];
  for (const s of site.sections) {
    const floor = LAYOUT_ITEM_FLOORS[s.layout];
    if (floor === undefined) continue;
    const count = s.items?.length ?? 0;
    if (count < floor) {
      offenders.push(
        `${s.layout}("${s.title.slice(0, 20)}"): ${count}/${floor}`,
      );
    }
  }
  if (offenders.length > 0) {
    return {
      name: 'layouts have items',
      pass: false,
      severity: 'error',
      message: `below item floor: ${offenders.join(', ')}`,
    };
  }
  return { name: 'layouts have items', pass: true, severity: 'error' };
}

function checkNoGenericCopy(site: SiteStructure): CheckResult {
  // Promoted to error severity so generic SaaS slop forces a retry instead
  // of shipping. The system prompt teaches voice-first copy; this gate
  // makes sure the model actually obeys.
  const fields: string[] = [
    site.hero.headline,
    site.hero.subheadline,
    site.hero.ctaPrimary,
    ...(site.hero.ctaSecondary ? [site.hero.ctaSecondary] : []),
    ...site.sections.flatMap((s) => [s.title, s.body, s.cta ?? '']),
  ];
  for (const f of fields) {
    const trimmed = f.trim();
    if (!trimmed) continue;
    for (const re of GENERIC_PATTERNS) {
      if (re.test(trimmed)) {
        return {
          name: 'no generic copy',
          pass: false,
          severity: 'error',
          message: `generic phrase: "${trimmed.slice(0, 40)}"`,
        };
      }
    }
  }
  return { name: 'no generic copy', pass: true, severity: 'error' };
}

function checkNoProviderLeaks(scene: Scene, site: SiteStructure): CheckResult {
  const userFacing = [
    site.brandName,
    site.hero.headline,
    site.hero.subheadline,
    site.hero.ctaPrimary,
    site.hero.ctaSecondary ?? '',
    ...site.sections.flatMap((s) => [s.title, s.body, s.cta ?? '']),
    // scene.concept also appears in some UI
    scene.concept,
  ].join(' ');

  for (const leak of PROVIDER_LEAKS) {
    if (userFacing.includes(leak)) {
      return {
        name: 'no provider leaks',
        pass: false,
        severity: 'error',
        message: `found "${leak}" in user-facing text`,
      };
    }
  }
  return { name: 'no provider leaks', pass: true, severity: 'error' };
}

function checkPaletteValidHex(scene: Scene): CheckResult {
  const bad: string[] = [];
  for (const key of ['background', 'foreground', 'accent'] as const) {
    if (!HEX_RE.test(scene.palette[key])) {
      bad.push(`${key}=${scene.palette[key]}`);
    }
  }
  if (bad.length > 0) {
    return {
      name: 'palette valid hex',
      pass: false,
      severity: 'error',
      message: bad.join(', '),
    };
  }
  return { name: 'palette valid hex', pass: true, severity: 'error' };
}

function checkBodyLengthRanges(site: SiteStructure): CheckResult {
  const offenders: string[] = [];
  for (const s of site.sections) {
    const len = s.body.length;
    if (len < 10 || len > 350) {
      offenders.push(`${s.layout}("${s.title.slice(0, 16)}"): ${len} chars`);
    }
  }
  if (offenders.length > 0) {
    return {
      name: 'body length range',
      pass: false,
      severity: 'warn',
      message: offenders.join('; '),
    };
  }
  return { name: 'body length range', pass: true, severity: 'warn' };
}

function checkSceneFieldsPopulated(scene: Scene): CheckResult {
  const missing: string[] = [];
  if (scene.visualPrompt.length < 40) missing.push('visualPrompt too short');
  if (scene.motionPrompt.length < 10) missing.push('motionPrompt too short');
  if (!scene.concept.trim()) missing.push('concept empty');
  if (missing.length > 0) {
    return {
      name: 'scene fields populated',
      pass: false,
      severity: 'error',
      message: missing.join(', '),
    };
  }
  return { name: 'scene fields populated', pass: true, severity: 'error' };
}

// ─── Summary helpers ────────────────────────────────────────────────────────

export interface BriefResult {
  briefId: string;
  category: string;
  runs: RunResult[];
}

export interface RunResult {
  runIndex: number;
  elapsedMs: number;
  checks: CheckResult[];
  error?: string;
  scene?: Scene;
  site?: SiteStructure;
}

export function summarize(results: BriefResult[]): {
  total: number;
  passed: number;
  failedErrors: number;
  failedWarns: number;
  passRate: number;
} {
  let total = 0;
  let passed = 0;
  let failedErrors = 0;
  let failedWarns = 0;

  for (const brief of results) {
    for (const run of brief.runs) {
      total += 1;
      if (run.error) {
        failedErrors += 1;
        continue;
      }
      const errorFails = run.checks.filter((c) => !c.pass && c.severity === 'error').length;
      const warnFails = run.checks.filter((c) => !c.pass && c.severity === 'warn').length;
      if (errorFails === 0) passed += 1;
      else failedErrors += 1;
      failedWarns += warnFails;
    }
  }
  return {
    total,
    passed,
    failedErrors,
    failedWarns,
    passRate: total > 0 ? passed / total : 0,
  };
}
