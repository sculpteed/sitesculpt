import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { Studio } from '@/features/studio/Studio';
import { requireActiveSubscription } from '@/lib/auth';

/**
 * /studio
 *
 * Gated:
 * 1. Must be signed in (Clerk) — otherwise redirect to /sign-up
 * 2. Must have an active Stripe subscription — otherwise redirect to /pricing
 *
 * DEV_SKIP_PAYWALL=1 bypasses the subscription check locally.
 */
export default async function StudioPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-up?redirect_url=/pricing');
  }

  const sub = await requireActiveSubscription();
  if (!sub) {
    redirect('/pricing?from=studio');
  }

  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
