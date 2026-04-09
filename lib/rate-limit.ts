// Rate limit interface. v1 (local dev) always allows. v2 will swap in a real
// limiter (Upstash Redis keyed by session cookie + fingerprint) for the public
// "1 free generation per session" quota.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: number;
}

export async function checkRateLimit(_key: string): Promise<RateLimitResult> {
  return { allowed: true, remaining: Infinity };
}
