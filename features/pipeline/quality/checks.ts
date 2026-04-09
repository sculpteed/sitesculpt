import type { Scene, SiteStructure, SectionLayout } from '@/features/pipeline/types';

export interface CheckResult {
  name: string;
  pass: boolean;
  severity: 'error' | 'warn';
  message?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Words that are cliché / generic marketing slop — rejecting these as the
// SOLE content of a field catches the "Welcome to X" / "Learn more" pattern.
const GENERIC_PATTERNS: RegExp[] = [
  /^welcome to\b/i,
  /^lorem ipsum/i,
  /^click here\b/i,
  /^learn more\.?$/i,
  /^get started\.?$/i,
  /^sign up (now|today)\.?$/i,
  /^the best .* in the world/i,
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

// Layouts that MUST have items[] populated to render meaningfully.
const LAYOUTS_REQUIRING_ITEMS: SectionLayout[] = [
  'feature-grid',
  'stat-grid',
  'quote',
  'numbered-steps',
  'faq-accordion',
  'logo-strip',
];

export function runChecks(scene: Scene, site: SiteStructure): CheckResult[] {
  return [
    checkHeroHeadline(site),
    checkHeroSubheadline(site),
    checkBrandName(site),
    checkSectionCount(site),
    checkLayoutVariety(site),
    checkLayoutItemsPopulated(site),
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
  if (n < 5 || n > 10) {
    return {
      name: 'section count',
      pass: false,
      severity: 'error',
      message: `${n} sections, want 5–10`,
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

function checkLayoutItemsPopulated(site: SiteStructure): CheckResult {
  const offenders: string[] = [];
  for (const s of site.sections) {
    if (LAYOUTS_REQUIRING_ITEMS.includes(s.layout)) {
      const count = s.items?.length ?? 0;
      if (count === 0) {
        offenders.push(`${s.layout}("${s.title.slice(0, 20)}")`);
      }
    }
  }
  if (offenders.length > 0) {
    return {
      name: 'layouts have items',
      pass: false,
      severity: 'error',
      message: `missing items: ${offenders.join(', ')}`,
    };
  }
  return { name: 'layouts have items', pass: true, severity: 'error' };
}

function checkNoGenericCopy(site: SiteStructure): CheckResult {
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
          severity: 'warn',
          message: `generic phrase: "${trimmed.slice(0, 40)}"`,
        };
      }
    }
  }
  return { name: 'no generic copy', pass: true, severity: 'warn' };
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
