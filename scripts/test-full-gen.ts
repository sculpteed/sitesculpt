/**
 * Full-pipeline test harness. Builds a realistic brief with placeholder
 * data across every DataPanels field, compiles it through compilePrompt,
 * and runs the full pipeline (the model + image + the video model + frames) end-to-end.
 *
 * Cost: ~$0.44 per run (4s the video model + medium image + 2 the model s)
 * Time: ~3 minutes wall clock
 *
 * Run: `npm run test:full` or manually:
 *   unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL OPENAI_API_KEY && \
 *   npx tsx --env-file=.env.local scripts/test-full-gen.ts
 *
 * Output: logs progress per step, prints the final project id.
 * Then open http://localhost:3003/preview/<id> to see the result.
 */
import { runPipeline } from '@/features/pipeline';
import { compilePrompt } from '@/features/studio/compilePrompt';
import { emptyUserData } from '@/features/studio/userData';
import type { Progress, StepName } from '@/features/pipeline/types';

// ─── Placeholder brief ──────────────────────────────────────────────────────

const brandName = 'Haven';
const description =
  'A privacy-first habit tracker that runs entirely on-device. No cloud sync, no accounts, no telemetry. For people who want to build habits without surveillance.';

const userData = emptyUserData();

// 2 team members — real people the AI should use verbatim
userData.team = [
  {
    name: 'Ava Chen',
    role: 'Founder',
    bio: 'Built Haven after her previous habit tracker sold user data to advertisers.',
  },
  {
    name: 'Marco Silva',
    role: 'Engineer',
    bio: 'Privacy-first systems engineer. Previously worked on end-to-end encrypted messaging.',
  },
];

// 2 pricing tiers — verbatim data, the model must use these
userData.pricing = [
  {
    name: 'Free',
    price: 'Free',
    period: 'forever',
    tagline: 'Everything you need to start building habits today.',
    features: [
      'Unlimited habits',
      'Daily streak tracking',
      'On-device storage',
      'No account required',
    ],
    cta: 'Download',
  },
  {
    name: 'Pro',
    price: '$4',
    period: '/month',
    tagline: 'For people who want the full experience, one-time purchase.',
    features: [
      'Everything in Free',
      'Advanced analytics',
      'Export to CSV',
      'Priority updates',
      'Support indie development',
    ],
    cta: 'Upgrade',
    highlighted: true,
  },
];

// 1 testimonial
userData.testimonials = [
  {
    quote:
      "Finally a habit tracker that doesn't ask me to sign up or send my data anywhere. It just works.",
    name: 'Sam K.',
    role: 'Haven user, 3 months',
  },
];

// 3 FAQ pairs
userData.faqs = [
  {
    question: 'Is my data really private?',
    answer:
      'Yes. Haven stores everything locally on your device. There is no server, no account, no telemetry, and no analytics. We physically cannot see your data.',
  },
  {
    question: 'How do I back up my habits?',
    answer:
      'You can export a JSON file to iCloud, Dropbox, or anywhere you want. Restoring is one tap.',
  },
  {
    question: 'Why is Pro $4 instead of a subscription?',
    answer:
      "We hate subscriptions for single-purpose apps. One price, forever, no recurring charges.",
  },
];

// 4 features — verbatim, the model should use these in feature-grid
userData.features = [
  {
    name: 'On-device everything',
    description:
      'Your habits, streaks, and notes live in your pocket. Nothing goes to a server.',
  },
  {
    name: 'Zero accounts',
    description:
      'No email, no password, no signup. Open the app and start tracking.',
  },
  {
    name: 'Daily check-in',
    description:
      'A single daily moment to mark your habits and note what you noticed.',
  },
  {
    name: 'Export anytime',
    description:
      'Plain JSON export to any cloud storage. Your data belongs to you.',
  },
];

// 2 metrics
userData.metrics = [
  { label: 'Bytes sent to servers', value: '0' },
  { label: 'User accounts required', value: '0' },
];

// No customer logos (we should NOT fabricate any)
userData.customerLogos = [];

// Contact info
userData.contact = {
  email: 'hello@haven.app',
};

// ─── Compile and run ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const compiled = compilePrompt({
    brandName,
    description,
    toneId: 'minimal',
    paletteMode: 'ai',
    customPalette: { background: '#0d0a08', foreground: '#f3ead9', accent: '#e8b874' },
    includedPages: ['features', 'pricing', 'team', 'testimonials', 'faq', 'contact'],
    userData,
    hasAttachedImage: false,
    hasAttachedVideo: false,
  });

  console.log('─── Compiled brief ───────────────────────────────');
  console.log(compiled);
  console.log('─────────────────────────────────────────────────\n');
  console.log('Starting full pipeline (the model + image + the video model + frames)...\n');

  const onProgress = (step: StepName, p: Progress): void => {
    const pct = p.pct !== undefined ? ` ${Math.round(p.pct * 100)}%` : '';
    const msg = p.message ? ` · ${p.message}` : '';
    console.log(`  [${step}] ${p.state}${pct}${msg}`);
  };

  const started = Date.now();
  try {
    const result = await runPipeline(
      { prompt: compiled, aspect: '16:9' },
      onProgress,
    );
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log('\n─── Pipeline complete ───────────────────────────');
    console.log(`Project ID:    ${result.projectId}`);
    console.log(`Brand:         ${result.site.brandName}`);
    console.log(`Hero:          ${result.site.hero.headline}`);
    console.log(`Sections:      ${result.site.sections.length}`);
    console.log(`Layouts used:  ${[...new Set(result.site.sections.map((s) => s.layout))].join(', ')}`);
    console.log(`Palette:       ${result.scene.palette.background} / ${result.scene.palette.foreground} / ${result.scene.palette.accent}`);
    console.log(`Frame count:   ${result.frameCount}`);
    console.log(`Elapsed:       ${elapsed}s`);
    console.log('─────────────────────────────────────────────────');
    console.log(`\nOpen the preview:`);
    console.log(`  http://localhost:3003/preview/${result.projectId}\n`);
  } catch (err) {
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.error(`\nFAILED after ${elapsed}s:`, err);
    process.exit(1);
  }
}

void main();
