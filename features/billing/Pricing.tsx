'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';

export interface TierCard {
  id: 'starter' | 'pro';
  name: string;
  price: number;
  tagline: string;
  features: string[];
  recommended: boolean;
}

export function Pricing({ tiers }: { tiers: TierCard[] | null }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-warm">
      {/* Soft glow background */}
      <div
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,184,116,0.08) 0%, transparent 55%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
          <span className="text-sm font-medium tracking-tight text-warm">sitesculpt</span>
        </a>
      </nav>

      {/* Header */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-14 text-center sm:px-8 sm:pt-20">
        <h1 className="mb-5 font-serif text-4xl leading-[0.95] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
          Two plans.{' '}
          <em className="italic" style={{ color: '#f5d9a8' }}>
            Subscribe to sculpt.
          </em>
        </h1>
      </section>

      <Suspense fallback={null}>
        <PricingBody tiers={tiers} />
      </Suspense>
    </main>
  );
}

function PricingBody({ tiers }: { tiers: TierCard[] | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const cancelled = params.get('cancelled');
  const error = params.get('error');

  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cancelled) setMessage('Checkout cancelled — no charge was made.');
    else if (error === 'missing_session') setMessage('Missing session. Please try again.');
    else if (error === 'unpaid') setMessage('Payment not completed.');
    else if (error === 'no_customer') setMessage('Stripe did not return a customer id.');
    else if (error === 'lookup_failed') setMessage('Could not verify payment. Please contact support.');
  }, [cancelled, error]);

  const handleSubscribe = async (tierId: 'starter' | 'pro'): Promise<void> => {
    setLoadingTier(tierId);
    setMessage(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });
      if (!res.ok) {
        const { error: errMsg } = (await res.json().catch(() => ({ error: 'failed' }))) as {
          error?: string;
        };
        setMessage(`Checkout failed: ${errMsg ?? res.statusText}`);
        setLoadingTier(null);
        return;
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Network error');
      setLoadingTier(null);
    }
  };

  if (!tiers) {
    return (
      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 sm:px-8">
        <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] p-6 text-center">
          <p className="mb-2 text-[14px] text-warm">Billing not configured</p>
          <p className="text-[12px] text-warm-muted">
            Add <code className="font-mono">STRIPE_SECRET_KEY</code>,{' '}
            <code className="font-mono">STRIPE_PRICE_STARTER</code>,{' '}
            <code className="font-mono">STRIPE_PRICE_PRO</code>, and{' '}
            <code className="font-mono">SESSION_SECRET</code> to <code>.env.local</code>, then
            restart the dev server.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 sm:px-8">
      {message ? (
        <div className="mx-auto mb-8 max-w-xl rounded-md border border-[#e8b874]/30 bg-[var(--color-accent-soft)] px-4 py-3 text-center text-[13px] text-warm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {tiers.map((tier) => {
          const isLoading = loadingTier === tier.id;
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                tier.recommended
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-border)] bg-[rgba(243,234,217,0.012)]'
              }`}
            >
              {tier.recommended ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#e8b874] px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-[#0d0a08]">
                    Recommended
                  </span>
                </div>
              ) : null}
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-warm-subtle">
                {tier.id}
              </div>
              <h2 className="mb-2 font-serif text-3xl text-warm">{tier.name}</h2>
              <p className="mb-6 text-[13px] leading-relaxed text-warm-muted">{tier.tagline}</p>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-serif text-5xl text-warm">${tier.price}</span>
                <span className="text-[12px] text-warm-subtle">/ month</span>
              </div>

              <ul className="mb-8 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-warm-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#e8b874' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(tier.id)}
                disabled={isLoading}
                className={`mt-auto flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  tier.recommended
                    ? 'text-[#0d0a08] hover:opacity-90'
                    : 'border border-[var(--color-border-strong)] bg-transparent text-warm hover:border-[var(--color-accent)]'
                }`}
                style={
                  tier.recommended ? { backgroundColor: '#e8b874' } : undefined
                }
              >
                {isLoading ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                    <span>Redirecting to Stripe…</span>
                  </>
                ) : (
                  <span>Subscribe to {tier.name}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center text-[11px] text-warm-subtle">
        <p>Secure checkout by Stripe. Cancel anytime from the billing portal.</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-3 text-[12px] text-warm-muted underline-offset-4 hover:text-warm hover:underline"
        >
          ← Back to home
        </button>
      </div>
    </section>
  );
}
