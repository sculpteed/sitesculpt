import { NextRequest, NextResponse } from 'next/server';
import { envStatus, env } from '@/lib/env';
import { stripe } from '@/lib/stripe';
import { setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout/success?session_id=cs_...
 *
 * Stripe redirects here after a successful Checkout. We look up the session
 * to get the customer id, set the signed session cookie, and redirect the
 * browser to /studio. This is the ONLY place we mint a cookie.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing?error=missing_session', req.url));
  }

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.redirect(new URL('/pricing?error=unpaid', req.url));
    }
    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;
    if (!customerId) {
      return NextResponse.redirect(new URL('/pricing?error=no_customer', req.url));
    }

    await setSessionCookie(customerId);
    return NextResponse.redirect(new URL('/studio?welcome=1', env().NEXT_PUBLIC_APP_URL));
  } catch (err) {
    console.error('[checkout/success] failed', err);
    return NextResponse.redirect(new URL('/pricing?error=lookup_failed', req.url));
  }
}
