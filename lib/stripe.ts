import Stripe from 'stripe';
import { env } from '@/lib/env';

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;
  // Use the SDK's default API version — avoids version-drift headaches.
  client = new Stripe(env().STRIPE_SECRET_KEY, {
    typescript: true,
  });
  return client;
}

// ─── Tier helpers ────────────────────────────────────────────────────────────

export type TierId = 'starter' | 'pro';

export interface Tier {
  id: TierId;
  name: string;
  priceId: string;
  price: number; // monthly USD
  tagline: string;
  features: string[];
  /** Monthly generation quota. Infinity = unlimited. */
  monthlyQuota: number;
  recommended?: boolean;
}

export function getTiers(): Tier[] {
  const e = env();
  return [
    {
      id: 'starter',
      name: 'Starter',
      priceId: e.STRIPE_PRICE_STARTER,
      price: 19,
      monthlyQuota: 20,
      tagline: 'For solo founders and side projects.',
      features: [
        '20 generations / month',
        'All 9 layout templates',
        'Export real Next.js projects',
        'Auto-save across sessions',
        'Inline copy editing',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      priceId: e.STRIPE_PRICE_PRO,
      price: 49,
      monthlyQuota: Infinity,
      tagline: 'For studios and high-volume builders.',
      recommended: true,
      features: [
        'Unlimited generations',
        'Longer cinematic motion (8s)',
        'Higher-resolution keyframes',
        'Custom palette locking',
        'Priority generation queue',
      ],
    },
  ];
}

export function tierById(id: TierId): Tier | undefined {
  return getTiers().find((t) => t.id === id);
}

export function tierByPriceId(priceId: string): Tier | undefined {
  return getTiers().find((t) => t.priceId === priceId);
}

// ─── Subscription status ─────────────────────────────────────────────────────

export interface SubscriptionStatus {
  active: boolean;
  customerId?: string;
  tier?: TierId;
  currentPeriodEnd?: number; // unix seconds
  cancelAtPeriodEnd?: boolean;
}

/**
 * Check if a Stripe customer has any active subscription.
 * Called on every protected request — ~150ms latency.
 * In v2, cache in a KV store with a short TTL.
 */
export async function getSubscriptionStatus(customerId: string): Promise<SubscriptionStatus> {
  const c = stripe();
  const subs = await c.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 5,
  });

  // Active or trialing counts as "subscribed"
  const active = subs.data.find(
    (s) => s.status === 'active' || s.status === 'trialing',
  );
  if (!active) {
    return { active: false, customerId };
  }

  const item = active.items.data[0];
  const tier = item ? tierByPriceId(item.price.id) : undefined;

  return {
    active: true,
    customerId,
    tier: tier?.id,
    currentPeriodEnd: (active as Stripe.Subscription & { current_period_end?: number })
      .current_period_end,
    cancelAtPeriodEnd: active.cancel_at_period_end,
  };
}
