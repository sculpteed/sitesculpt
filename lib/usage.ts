// Monthly generation usage ledger — per-customer counts stored in the
// filesystem cache. This is Starter-quota enforcement without a database.
//
// In v2/production, swap this for a KV store (Vercel KV / Upstash Redis)
// since serverless filesystems aren't persistent.

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const USAGE_ROOT = path.resolve(process.cwd(), '.cache', 'usage');

function currentMonthKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}_${m}`;
}

/**
 * Hash the customer id for the filename so we don't put raw Stripe IDs on
 * disk. The hash is deterministic so lookups still work.
 */
function customerFile(customerId: string): string {
  const hash = createHash('sha256').update(customerId).digest('hex').slice(0, 20);
  return path.join(USAGE_ROOT, `${hash}.json`);
}

type Ledger = Record<string, number>; // YYYY_MM → count

async function readLedger(customerId: string): Promise<Ledger> {
  try {
    const raw = await fs.readFile(customerFile(customerId), 'utf8');
    return JSON.parse(raw) as Ledger;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeLedger(customerId: string, ledger: Ledger): Promise<void> {
  await fs.mkdir(USAGE_ROOT, { recursive: true });
  await fs.writeFile(customerFile(customerId), JSON.stringify(ledger, null, 2));
}

/** Current month's generation count for this customer. */
export async function getMonthlyUsage(customerId: string): Promise<number> {
  const ledger = await readLedger(customerId);
  return ledger[currentMonthKey()] ?? 0;
}

/** Increment the monthly count after a successful generation kickoff. */
export async function recordGeneration(customerId: string): Promise<number> {
  const ledger = await readLedger(customerId);
  const key = currentMonthKey();
  const next = (ledger[key] ?? 0) + 1;
  ledger[key] = next;
  await writeLedger(customerId, ledger);
  return next;
}

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number;
}

/**
 * Check whether this customer can run another generation this month.
 * Pro tier (Infinity limit) always passes.
 */
export async function checkQuota(
  customerId: string,
  monthlyQuota: number,
): Promise<QuotaCheck> {
  if (!Number.isFinite(monthlyQuota)) {
    return { allowed: true, used: 0, limit: Number.POSITIVE_INFINITY };
  }
  const used = await getMonthlyUsage(customerId);
  return { allowed: used < monthlyQuota, used, limit: monthlyQuota };
}
