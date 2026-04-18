import { PAGE_PRESETS } from './pages';
import { getToneById } from './tones';
import type { UserData } from './userData';
import type { Palette } from '@/features/pipeline/types';

export interface GuidedInput {
  brandName: string;
  description: string;
  toneId: string | null;
  paletteMode: 'ai' | 'custom';
  customPalette: Palette;
  includedPages: string[];
  userData: UserData;
  hasAttachedImage?: boolean;
  hasAttachedVideo?: boolean;
}

/** Compile structured guided input into the brief text. User-provided data
 *  (team, pricing, testimonials) is injected verbatim so the model  it
 *  rather than inventing. */
export function compilePrompt(input: GuidedInput): string {
  const parts: string[] = [];

  // ─── Identity ─────────────────────────────────────────────────────────
  if (input.brandName.trim()) {
    parts.push(`Brand name: ${input.brandName.trim()}.`);
  } else {
    parts.push(`Brand name: not provided — invent something short and memorable.`);
  }

  parts.push(`What it is: ${input.description.trim()}.`);

  // ─── Tone ─────────────────────────────────────────────────────────────
  const tone = getToneById(input.toneId);
  if (tone) {
    parts.push(`Tone: ${tone.label}. ${tone.hint}`);
  }

  // ─── Palette ──────────────────────────────────────────────────────────
  if (input.paletteMode === 'custom') {
    const c = input.customPalette;
    parts.push(
      `Color palette: user-locked. Use these EXACT hex values in the scene palette and throughout the visual prompt: background ${c.background}, foreground ${c.foreground}, accent ${c.accent}. The cinematic keyframe must read as this palette.`,
    );
  } else {
    parts.push(
      `Color palette: art-director's choice. Derive a palette that best matches the brand, tone, audience, and any attached reference media. Return hex values in the scene palette JSON. Prioritize emotional fit over trendiness.`,
    );
  }

  // ─── Attached media ───────────────────────────────────────────────────
  if (input.hasAttachedImage) {
    parts.push(
      `Reference: user attached an image. Let its mood, color, and composition inform the visual prompt and the palette.`,
    );
  }
  if (input.hasAttachedVideo) {
    parts.push(
      `Reference: user attached a video. Let its motion style and atmosphere inform the motion prompt and the palette.`,
    );
  }

  // ─── Requested pages ──────────────────────────────────────────────────
  if (input.includedPages.length > 0) {
    const pageLines = input.includedPages
      .map((id) => PAGE_PRESETS.find((p) => p.id === id))
      .filter((p): p is (typeof PAGE_PRESETS)[number] => Boolean(p))
      .map((p) => `- ${p.label}: ${p.hint}`);
    parts.push(
      `REQUIRED SECTIONS (you MUST include one section for each of these, using the most appropriate layout id):\n${pageLines.join('\n')}`,
    );
  }

  // ─── User-provided structured data ────────────────────────────────────
  const dataBlock = renderUserData(input.userData);
  if (dataBlock) {
    parts.push(
      `USER-PROVIDED REAL DATA (use this VERBATIM — do not paraphrase, do not invent alternatives):\n\n${dataBlock}`,
    );
  }

  // ─── Anti-fabrication contract ────────────────────────────────────────
  parts.push(
    `ANTI-FABRICATION RULES (hard constraints):
- Do NOT invent specific numbers, percentages, user counts, or metrics. If the user provided metrics above, use them verbatim. Otherwise write placeholder language like "[Your key metric]" or "[traction number]".
- Do NOT invent team members, credentials, titles, or bios. If the user provided team members above, use them verbatim. Otherwise use placeholder text like "[Founder name]" and "[role]".
- Do NOT invent customer company names or logos. If the user provided customer logos above, use them verbatim. Otherwise omit the logo-strip section entirely.
- Do NOT invent testimonials or quotes. If the user provided testimonials above, use them verbatim. Otherwise use placeholder language like "[Customer name]" with a generic positive phrase.
- Do NOT invent pricing tiers, prices, or feature lists. If the user provided pricing above, use it verbatim. Otherwise write clear placeholder tiers like "[Tier name]" / "[Price]" / "[feature]".
- Do NOT invent contact details (email, phone, address). If the user provided contact info above, use it. Otherwise use "[your email]" placeholders.
- If you cannot populate a requested section with real or clearly-placeholder data, STILL include the section with placeholders — do NOT drop the section silently.`,
  );

  return parts.join('\n\n');
}

// ─── User data formatter ────────────────────────────────────────────────────

function renderUserData(d: UserData): string {
  const blocks: string[] = [];

  if (d.team.length > 0) {
    blocks.push(
      `TEAM MEMBERS (${d.team.length}):\n${d.team
        .map(
          (m, i) =>
            `  ${i + 1}. ${m.name} — ${m.role}${m.bio ? `\n     bio: ${m.bio}` : ''}`,
        )
        .join('\n')}`,
    );
  }

  if (d.pricing.length > 0) {
    blocks.push(
      `PRICING TIERS (${d.pricing.length}):\n${d.pricing
        .map((t, i) => {
          const parts = [
            `  ${i + 1}. ${t.name} — ${t.price}${t.period ? t.period : ''}${t.highlighted ? ' (RECOMMENDED)' : ''}`,
          ];
          if (t.tagline) parts.push(`     tagline: ${t.tagline}`);
          if (t.features.length > 0) {
            parts.push(`     features:\n${t.features.map((f) => `       - ${f}`).join('\n')}`);
          }
          if (t.cta) parts.push(`     cta: ${t.cta}`);
          return parts.join('\n');
        })
        .join('\n')}`,
    );
  }

  if (d.testimonials.length > 0) {
    blocks.push(
      `TESTIMONIALS (${d.testimonials.length}):\n${d.testimonials
        .map(
          (t, i) =>
            `  ${i + 1}. "${t.quote}"\n     — ${t.name}${t.role ? `, ${t.role}` : ''}`,
        )
        .join('\n')}`,
    );
  }

  if (d.caseStudies.length > 0) {
    blocks.push(
      `CASE STUDIES (${d.caseStudies.length}):\n${d.caseStudies
        .map(
          (c, i) =>
            `  ${i + 1}. ${c.client}\n     challenge: ${c.challenge}\n     outcome: ${c.outcome}${c.metric ? `\n     metric: ${c.metric}` : ''}`,
        )
        .join('\n')}`,
    );
  }

  if (d.faqs.length > 0) {
    blocks.push(
      `FAQs (${d.faqs.length}):\n${d.faqs
        .map((f, i) => `  ${i + 1}. Q: ${f.question}\n     A: ${f.answer}`)
        .join('\n')}`,
    );
  }

  if (d.features.length > 0) {
    blocks.push(
      `FEATURES (${d.features.length}):\n${d.features
        .map((f, i) => `  ${i + 1}. ${f.name} — ${f.description}`)
        .join('\n')}`,
    );
  }

  if (d.metrics.length > 0) {
    blocks.push(
      `KEY METRICS (${d.metrics.length}):\n${d.metrics
        .map((m, i) => `  ${i + 1}. ${m.label}: ${m.value}`)
        .join('\n')}`,
    );
  }

  if (d.customerLogos.length > 0) {
    blocks.push(`CUSTOMER LOGOS: ${d.customerLogos.join(', ')}`);
  }

  const c = d.contact;
  if (c.email || c.phone || c.address || (c.social && c.social.length > 0)) {
    const lines: string[] = ['CONTACT:'];
    if (c.email) lines.push(`  email: ${c.email}`);
    if (c.phone) lines.push(`  phone: ${c.phone}`);
    if (c.address) lines.push(`  address: ${c.address}`);
    if (c.social && c.social.length > 0) {
      for (const s of c.social) lines.push(`  ${s.label}: ${s.url}`);
    }
    blocks.push(lines.join('\n'));
  }

  return blocks.join('\n\n');
}
