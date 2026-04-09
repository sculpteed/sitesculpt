import { NextRequest } from 'next/server';
import { z } from 'zod';
import { env, envStatus } from '@/lib/env';
import { stripe, getTiers, type TierId } from '@/lib/stripe';
import { getCustomerIdFromCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  tier: z.enum(['starter', 'pro']),
});

/**
 * POST /api/checkout
 *
 * Body: { tier: 'starter' | 'pro' }
 * Response: { url }  ← client redirects to this Stripe Checkout URL
 *
 * If the user already has a cookie with a Stripe customer id, we reuse it
 * (so repeat signups don't create duplicate Stripe customers).
 */
export async function POST(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid tier' }, { status: 400 });
  }
  const tierId: TierId = parsed.data.tier;
  const tier = getTiers().find((t) => t.id === tierId);
  if (!tier) {
    return Response.json({ error: 'Unknown tier' }, { status: 400 });
  }

  const existingCustomerId = await getCustomerIdFromCookie();
  const appUrl = env().NEXT_PUBLIC_APP_URL;

  // In subscription mode, Stripe creates a customer automatically. We only
  // attach an existing customer if we've seen this browser before.
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: tier.priceId, quantity: 1 }],
    ...(existingCustomerId ? { customer: existingCustomerId } : {}),
    success_url: `${appUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing?cancelled=1`,
    billing_address_collection: 'auto',
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { tier: tierId },
    },
  });

  if (!session.url) {
    return Response.json({ error: 'Stripe returned no URL' }, { status: 500 });
  }

  return Response.json({ url: session.url });
}
