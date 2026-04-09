import { NextRequest } from 'next/server';
import { envStatus, env } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { getCustomerIdFromCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/billing
 *
 * Creates a Stripe Customer Portal session for the current user so they can
 * manage (cancel, update card, download invoices) their subscription
 * through Stripe's hosted page.
 *
 * Response: { url } — client redirects.
 */
export async function POST(_req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const customerId = await getCustomerIdFromCookie();
  if (!customerId) {
    return Response.json({ error: 'No active session' }, { status: 401 });
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env().NEXT_PUBLIC_APP_URL}/studio`,
  });

  return Response.json({ url: session.url });
}
