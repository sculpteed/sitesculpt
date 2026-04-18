import { z } from 'zod';

const schema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY missing — set it in .env.local'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY missing — set it in .env.local'),
  OPENAI_IMAGE_MODEL: z.string().default('gpt-image-1.5'),
  OPENAI_VIDEO_MODEL: z.string().default('sora-2'),
  ANTHROPIC_MODEL: z.string().default('claude-opus-4-7'),

  // Stripe — required for subscription flow. Server-side keys only.
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY missing — set it in .env.local'),
  STRIPE_PRICE_STARTER: z
    .string()
    .min(1, 'STRIPE_PRICE_STARTER missing — the Stripe Price ID for the Starter tier'),
  STRIPE_PRICE_PRO: z
    .string()
    .min(1, 'STRIPE_PRICE_PRO missing — the Stripe Price ID for the Pro tier'),

  // Signing key for the auth cookie (any long random string is fine)
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 chars — generate with `openssl rand -hex 32`'),

  // Absolute URL of the app (used by Stripe for success/cancel redirects)
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default('http://localhost:3003'),

  // fal.ai — Flux image generation (better quality than GPT Image)
  FAL_API_KEY: z.string().optional(),

  // Vercel Blob — optional for local dev, required in production.
  // Get from: Vercel Dashboard → Storage → Create Blob Store → Tokens
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/**
 * Lazy, cached env accessor. Throws on first call if missing.
 * Call from server code only.
 */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ');
    throw new Error(`Invalid environment:\n  ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Check env without throwing. Used by API routes to return a clean error.
 */
export function envStatus(): { ok: true } | { ok: false; error: string } {
  try {
    env();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown env error' };
  }
}
