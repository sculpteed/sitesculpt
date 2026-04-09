import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { hashInput, type GenerateInput } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireActiveSubscription } from '@/lib/auth';
import { tierById } from '@/lib/stripe';
import { checkQuota, recordGeneration } from '@/lib/usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  prompt: z.string().min(3).max(2000),
  aspect: z.enum(['16:9', '9:16', '1:1']),
});

/**
 * POST /api/generate
 *
 * Body: { prompt, aspect }
 * Response: { projectId }
 *
 * Kicks off the pipeline in the background. Client then opens an SSE stream
 * at GET /api/jobs/{projectId} to watch progress.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  // Paywall — every generation requires an active subscription.
  const sub = await requireActiveSubscription();
  if (!sub || !sub.customerId) {
    return Response.json(
      {
        error: 'subscription_required',
        message: 'An active subscription is required to generate sites.',
      },
      { status: 402 },
    );
  }

  // Quota — Starter is capped at 20/month, Pro is unlimited.
  const tier = sub.tier ? tierById(sub.tier) : undefined;
  if (tier) {
    const quota = await checkQuota(sub.customerId, tier.monthlyQuota);
    if (!quota.allowed) {
      return Response.json(
        {
          error: 'quota_exceeded',
          message: `You've used all ${quota.limit} generations for this month on the ${tier.name} plan.`,
          used: quota.used,
          limit: quota.limit,
          tier: tier.id,
        },
        { status: 402 },
      );
    }
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // Append a unique seed so each generation produces a fresh variation
  // even if the brief is identical. Users who want exact cache hits can
  // re-open a project by ID instead of re-generating.
  const input: GenerateInput = {
    ...parsed.data,
    variationSeed: crypto.randomUUID().slice(0, 8),
  };

  const rl = await checkRateLimit(req.headers.get('x-forwarded-for') ?? 'local');
  if (!rl.allowed) {
    return Response.json({ error: 'Rate limit reached' }, { status: 429 });
  }

  const projectId = hashInput(input);

  // Lazy import so /api/generate stays fast on env errors
  const { runPipeline } = await import('@/features/pipeline');

  // Fire and forget — the SSE endpoint will watch status.json on disk
  void runPipeline(input).catch((err) => {
    console.error('[pipeline] failed', err);
  });

  // Record the generation for quota enforcement (Pro is Infinity, still logs)
  try {
    await recordGeneration(sub.customerId);
  } catch (err) {
    console.error('[usage] record failed', err);
  }

  return Response.json({ projectId });
}
