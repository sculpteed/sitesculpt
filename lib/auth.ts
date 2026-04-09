import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/lib/stripe';

const COOKIE_NAME = 'ss_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Session cookie payload — just a Stripe customer id. The cookie is signed
 * with SESSION_SECRET so users can't tamper with it; HTTP-only so JS can't
 * read it. The actual subscription state is verified via Stripe on each
 * protected request.
 */

function sign(value: string): string {
  return createHmac('sha256', env().SESSION_SECRET).update(value).digest('hex');
}

function encode(customerId: string): string {
  return `${customerId}.${sign(customerId)}`;
}

function decode(cookieValue: string): string | null {
  const idx = cookieValue.lastIndexOf('.');
  if (idx === -1) return null;
  const value = cookieValue.slice(0, idx);
  const signature = cookieValue.slice(idx + 1);
  const expected = sign(value);
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return null;
  try {
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return value;
}

// ─── Server-side helpers ─────────────────────────────────────────────────────

export async function setSessionCookie(customerId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encode(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCustomerIdFromCookie(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decode(raw);
}

/**
 * Read the cookie AND verify the subscription is still active with Stripe.
 * Returns null if there's no cookie, tampered cookie, or inactive sub.
 */
export async function requireActiveSubscription(): Promise<SubscriptionStatus | null> {
  const customerId = await getCustomerIdFromCookie();
  if (!customerId) return null;
  try {
    const status = await getSubscriptionStatus(customerId);
    return status.active ? status : null;
  } catch (err) {
    console.error('[auth] subscription verify failed', err);
    return null;
  }
}
