'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ─── Questions ───────────────────────────────────────────────────────────────

type PlanKey = 'free' | 'starter' | 'pro' | 'agency';

interface Option {
  label: string;
  description: string;
  weight: Partial<Record<PlanKey, number>>;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 'who',
    title: 'Who are you building for?',
    subtitle: 'This determines what features we surface first.',
    options: [
      {
        label: 'Myself',
        description: 'Personal site, side project, portfolio',
        weight: { free: 3, starter: 2 },
      },
      {
        label: 'A startup',
        description: 'Launching a product, landing page, MVP',
        weight: { starter: 3, pro: 2 },
      },
      {
        label: 'An agency or studio',
        description: 'Shipping sites for clients at scale',
        weight: { pro: 2, agency: 3 },
      },
      {
        label: 'An enterprise team',
        description: 'Internal tools, multiple stakeholders, SSO',
        weight: { agency: 3, pro: 1 },
      },
    ],
  },
  {
    id: 'frequency',
    title: 'How often will you ship new sites?',
    subtitle: 'Drives the right monthly generation limit for you.',
    options: [
      {
        label: 'Just trying it out',
        description: 'One or two for now, see what it does',
        weight: { free: 4 },
      },
      {
        label: 'A few a month',
        description: 'Casual use, experimenting with ideas',
        weight: { starter: 4, pro: 1 },
      },
      {
        label: 'Weekly',
        description: 'Active creator, multiple projects running',
        weight: { pro: 4, starter: 1 },
      },
      {
        label: 'Daily',
        description: 'Shipping constantly for self or clients',
        weight: { agency: 4, pro: 2 },
      },
    ],
  },
  {
    id: 'priority',
    title: 'What matters most in the output?',
    subtitle: 'Different plans tune for different priorities.',
    options: [
      {
        label: 'Fast iteration',
        description: 'Lots of drafts, low commitment per shot',
        weight: { free: 2, starter: 3 },
      },
      {
        label: 'Highest possible quality',
        description: 'Cinematic, sharper video, more frames',
        weight: { pro: 4, agency: 2 },
      },
      {
        label: 'Full code ownership',
        description: 'Export to Next.js and own the project',
        weight: { free: 2, starter: 2, pro: 2, agency: 2 },
      },
      {
        label: 'Everything above',
        description: 'No compromises, I want all of it',
        weight: { pro: 3, agency: 3 },
      },
    ],
  },
  {
    id: 'team',
    title: 'Any team or client needs?',
    subtitle: 'Last one — shapes the advanced features.',
    options: [
      {
        label: 'Just me',
        description: 'Solo builder, no collaboration yet',
        weight: { free: 3, starter: 3 },
      },
      {
        label: 'Small team (2–5)',
        description: 'A few collaborators, shared project history',
        weight: { pro: 4 },
      },
      {
        label: 'Large team with SSO',
        description: 'Org-wide access, audit logs, permissions',
        weight: { agency: 4 },
      },
      {
        label: 'White-label for clients',
        description: 'Resell sitesculpt under your own brand',
        weight: { agency: 5 },
      },
    ],
  },
];

// ─── Plans ───────────────────────────────────────────────────────────────────

interface Plan {
  key: PlanKey;
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: 'free',
    name: 'Free',
    price: '$0',
    tagline: 'For anyone curious — no signup, no paywall.',
    features: [
      '1 generation per session',
      '720p cinematic motion',
      'Next.js code export',
      '30fps frame extraction',
      'Local auto-save',
    ],
  },
  starter: {
    key: 'starter',
    name: 'Starter',
    price: '$19',
    tagline: 'For solo builders shipping regularly.',
    features: [
      '50 generations / month',
      '1080p video output',
      'Next.js code export',
      'Cloud project history',
      'Priority queue',
      'Email support',
    ],
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    price: '$49',
    tagline: 'For pros who want cinematic quality.',
    features: [
      '250 generations / month',
      '4K cinematic motion',
      'Multi-shot video chaining',
      'Custom aspect ratios',
      'Team sharing (up to 5 seats)',
      'Priority queue + faster render',
      'Chat support',
    ],
  },
  agency: {
    key: 'agency',
    name: 'Agency',
    price: '$149',
    tagline: 'For agencies and white-label clients.',
    features: [
      'Unlimited generations',
      'Everything in Pro',
      'White-label exports',
      'API access',
      'Unlimited team seats',
      'SSO + audit logs',
      'Dedicated Slack channel',
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function GetStarted() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..N-1 questions, N = result
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = QUESTIONS.length;
  const atResult = step >= total;

  const recommended = useMemo<PlanKey>(() => {
    if (!atResult) return 'starter';
    const scores: Record<PlanKey, number> = { free: 0, starter: 0, pro: 0, agency: 0 };
    for (const q of QUESTIONS) {
      const ans = answers[q.id];
      if (ans === undefined) continue;
      const opt = q.options[ans];
      if (!opt) continue;
      for (const [k, v] of Object.entries(opt.weight)) {
        scores[k as PlanKey] += v ?? 0;
      }
    }
    const sorted = (Object.keys(scores) as PlanKey[]).sort((a, b) => scores[b] - scores[a]);
    return sorted[0] ?? 'starter';
  }, [atResult, answers]);

  const currentQ = step < total ? QUESTIONS[step] : null;

  const pick = (idx: number): void => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
    // Tiny delay so the selection animation is visible before advancing
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  const back = (): void => {
    if (step === 0) {
      router.push('/');
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const restart = (): void => {
    setAnswers({});
    setStep(0);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-warm">
      {/* Ambient warm gradient backdrop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(232,184,116,0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(232,184,116,0.05) 0%, transparent 70%), #0d0a08',
        }}
      />
      <div className="grain pointer-events-none fixed inset-0 -z-10 opacity-[0.05]" />

      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-warm hover:opacity-90"
        >
          <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
          sitesculpt
        </button>
        {!atResult ? (
          <button
            onClick={restart}
            className="text-[12px] text-warm-muted transition hover:text-warm sm:text-[13px]"
          >
            Start over
          </button>
        ) : null}
      </nav>

      {/* Progress */}
      {!atResult ? (
        <div className="relative z-20 mx-auto flex max-w-5xl items-center gap-3 px-6 pb-2 sm:px-8">
          <span className="font-mono text-[10px] tracking-wider text-warm-subtle">
            {String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <div className="h-[1px] flex-1 bg-[var(--color-border)]">
            <div
              className="h-full transition-[width] duration-500"
              style={{
                width: `${((step + 1) / total) * 100}%`,
                backgroundColor: '#e8b874',
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Body */}
      <section className="relative z-10 mx-auto flex min-h-[70vh] max-w-5xl flex-col items-stretch justify-center px-6 py-10 sm:px-8 sm:py-16">
        {currentQ ? (
          <QuestionView
            key={currentQ.id}
            question={currentQ}
            selected={answers[currentQ.id]}
            onPick={pick}
            onBack={back}
          />
        ) : (
          <ResultView
            plan={PLANS[recommended]}
            allPlans={Object.values(PLANS)}
            onRestart={restart}
            onContinue={() => router.push('/studio')}
          />
        )}
      </section>
    </main>
  );
}

// ─── Question view ───────────────────────────────────────────────────────────

function QuestionView({
  question,
  selected,
  onPick,
  onBack,
}: {
  question: Question;
  selected: number | undefined;
  onPick: (idx: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-fadein">
      <div className="mb-10 sm:mb-14">
        <h1 className="font-serif text-4xl leading-[1] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
          {question.title}
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-warm-muted sm:text-[15px]">
          {question.subtitle}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onPick(i)}
              className={`group flex flex-col items-start gap-1.5 rounded-xl border p-5 text-left transition ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] hover:border-[var(--color-border-strong)] hover:bg-[rgba(243,234,217,0.04)]'
              }`}
            >
              <span className="text-[15px] font-medium text-warm">{opt.label}</span>
              <span className="text-[13px] leading-relaxed text-warm-muted">{opt.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-warm-muted transition hover:text-warm"
        >
          ← Back
        </button>
        <span className="font-mono text-[10px] tracking-wider text-warm-subtle">
          Tap an answer to continue
        </span>
      </div>
    </div>
  );
}

// ─── Result view ─────────────────────────────────────────────────────────────

function ResultView({
  plan,
  allPlans,
  onRestart,
  onContinue,
}: {
  plan: Plan;
  allPlans: Plan[];
  onRestart: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="animate-fadein">
      <div className="mb-10 flex flex-col items-start gap-3 sm:mb-14">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle sm:text-[11px]">
          <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
          <span>Your recommended plan</span>
        </div>
        <h1 className="font-serif text-4xl leading-[1] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
          We think you&apos;d love{' '}
          <em className="italic" style={{ color: '#f5d9a8' }}>
            {plan.name}.
          </em>
        </h1>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-warm-muted sm:text-[15px]">
          {plan.tagline}
        </p>
      </div>

      {/* Recommended plan card */}
      <div
        className="mb-8 rounded-2xl border p-7 sm:p-8"
        style={{
          borderColor: '#e8b874',
          background: 'linear-gradient(160deg, rgba(232,184,116,0.08), rgba(232,184,116,0.02))',
        }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
              Recommended
            </div>
            <div className="mt-1 font-serif text-3xl text-warm sm:text-4xl">{plan.name}</div>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl text-warm sm:text-4xl">{plan.price}</div>
            <div className="text-[11px] text-warm-subtle">per month</div>
          </div>
        </div>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-warm-muted">
              <span className="mt-1 text-[var(--color-accent)]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onContinue}
            className="rounded-md px-5 py-2.5 text-[13px] font-medium text-[#0d0a08] transition hover:opacity-90"
            style={{ backgroundColor: '#e8b874' }}
          >
            Continue to studio →
          </button>
          <button
            onClick={onRestart}
            className="rounded-md border border-[var(--color-border-strong)] px-5 py-2.5 text-[13px] font-medium text-warm transition hover:bg-[rgba(243,234,217,0.04)]"
          >
            Retake quiz
          </button>
        </div>
      </div>

      {/* All plans compact */}
      <div className="mb-6 font-mono text-[10px] uppercase tracking-wider text-warm-subtle">
        Or compare all plans
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allPlans.map((p) => {
          const isRecommended = p.key === plan.key;
          return (
            <div
              key={p.key}
              className={`rounded-xl border p-5 ${
                isRecommended
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-border)] bg-[rgba(243,234,217,0.02)]'
              }`}
            >
              <div className="text-[13px] font-medium text-warm">{p.name}</div>
              <div className="mt-1 font-serif text-2xl text-warm">{p.price}</div>
              <div className="mt-2 text-[12px] leading-relaxed text-warm-muted">{p.tagline}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
