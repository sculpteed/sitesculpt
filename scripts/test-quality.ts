/**
 * Quality test harness — runs the Claude-only portion of the pipeline on a
 * curated set of golden briefs and scores each output against automated
 * quality checks.
 *
 * Run: `npm run test:quality` (pass --runs 3 for multiple runs per brief)
 *
 * Cost: ~$0.002 per run (2 Claude calls). 12 briefs × 3 runs = ~$0.07.
 * Cheap enough to run every time you tune a prompt.
 *
 * Skips Sora entirely — that's for spot-check testing, not bulk QA.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { expandPrompt } from '@/features/pipeline/steps/expandPrompt';
import { composeSite } from '@/features/pipeline/steps/composeSite';
import { runChecks, summarize, type BriefResult } from '@/features/pipeline/quality/checks';
import { GOLDEN_BRIEFS, type GoldenBrief } from '@/features/pipeline/quality/golden-briefs';

// ─── CLI args ───────────────────────────────────────────────────────────────

function getArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1] ?? fallback;
  }
  return fallback;
}

const RUNS_PER_BRIEF = parseInt(getArg('runs', '3'), 10);
const FILTER = getArg('filter', '');
const OUTPUT_DIR = path.resolve(process.cwd(), 'test-results');

// ─── Runner ─────────────────────────────────────────────────────────────────

async function runBrief(brief: GoldenBrief, runIndex: number) {
  const started = Date.now();
  try {
    const [scene, site] = await Promise.all([
      expandPrompt(brief.compiled),
      composeSite(brief.compiled),
    ]);
    return {
      runIndex,
      elapsedMs: Date.now() - started,
      checks: runChecks(scene, site),
      scene,
      site,
    };
  } catch (err) {
    return {
      runIndex,
      elapsedMs: Date.now() - started,
      checks: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function statusIcon(brief: BriefResult): string {
  let passCount = 0;
  let errorCount = 0;
  for (const run of brief.runs) {
    if (run.error) {
      errorCount += 1;
      continue;
    }
    const hasErrors = run.checks.some((c) => !c.pass && c.severity === 'error');
    if (!hasErrors) passCount += 1;
  }
  if (errorCount > 0) return '✗';
  if (passCount === brief.runs.length) return '✓';
  return '⚠';
}

function formatBriefLine(brief: BriefResult): string {
  const icon = statusIcon(brief);
  let passCount = 0;
  for (const run of brief.runs) {
    if (!run.error) {
      const hasErrors = run.checks.some((c) => !c.pass && c.severity === 'error');
      if (!hasErrors) passCount += 1;
    }
  }
  const avgMs = Math.round(
    brief.runs.reduce((s, r) => s + r.elapsedMs, 0) / brief.runs.length,
  );
  const layouts = new Set<string>();
  for (const run of brief.runs) {
    if (run.site) {
      for (const sec of run.site.sections) {
        layouts.add(sec.layout);
      }
    }
  }
  const layoutsStr = [...layouts].join(',');
  return `  ${icon} ${brief.briefId.padEnd(24)} ${brief.category.padEnd(28)} ${passCount}/${brief.runs.length} pass · ${avgMs}ms avg · layouts: ${layoutsStr}`;
}

function formatFailures(brief: BriefResult): string[] {
  const lines: string[] = [];
  brief.runs.forEach((run, i) => {
    if (run.error) {
      lines.push(`    run ${i + 1}: ERROR — ${run.error}`);
      return;
    }
    const failed = run.checks.filter((c) => !c.pass);
    for (const f of failed) {
      const sev = f.severity === 'error' ? 'ERR ' : 'warn';
      lines.push(`    run ${i + 1} · ${sev} · ${f.name}: ${f.message ?? '(no details)'}`);
    }
  });
  return lines;
}

async function main(): Promise<void> {
  const briefs = FILTER
    ? GOLDEN_BRIEFS.filter((b) => b.id.includes(FILTER) || b.category.includes(FILTER))
    : GOLDEN_BRIEFS;

  if (briefs.length === 0) {
    console.error(`No briefs matched filter: ${FILTER}`);
    process.exit(1);
  }

  const totalGens = briefs.length * RUNS_PER_BRIEF;
  console.log(
    `sitesculpt quality test · ${briefs.length} briefs × ${RUNS_PER_BRIEF} runs = ${totalGens} generations`,
  );
  console.log(`estimated cost: ~$${(totalGens * 0.002).toFixed(2)} (Claude-only)\n`);

  const results: BriefResult[] = [];
  const overallStart = Date.now();

  for (const brief of briefs) {
    process.stdout.write(`  running ${brief.id}…`);
    const runs = [];
    for (let i = 0; i < RUNS_PER_BRIEF; i += 1) {
      const r = await runBrief(brief, i);
      runs.push(r);
      process.stdout.write('.');
    }
    process.stdout.write('\r\x1b[K'); // clear current line
    const briefResult: BriefResult = {
      briefId: brief.id,
      category: brief.category,
      runs,
    };
    results.push(briefResult);
    console.log(formatBriefLine(briefResult));
    const failures = formatFailures(briefResult);
    if (failures.length > 0) {
      for (const line of failures) console.log(line);
    }
  }

  const overallMs = Date.now() - overallStart;
  const sum = summarize(results);
  console.log('');
  console.log('─────────────────────────────────────────────────────────────');
  console.log(
    `summary: ${sum.passed}/${sum.total} passed (${(sum.passRate * 100).toFixed(0)}%) · ${sum.failedErrors} errors · ${sum.failedWarns} warns · ${(overallMs / 1000).toFixed(1)}s total`,
  );

  // Per-check failure breakdown
  const checkFails = new Map<string, number>();
  for (const brief of results) {
    for (const run of brief.runs) {
      for (const c of run.checks) {
        if (!c.pass) {
          checkFails.set(c.name, (checkFails.get(c.name) ?? 0) + 1);
        }
      }
    }
  }
  if (checkFails.size > 0) {
    console.log('\ntop failing checks:');
    const sorted = [...checkFails.entries()].sort((a, b) => b[1] - a[1]);
    for (const [name, count] of sorted) {
      console.log(`  ${count.toString().padStart(3)} × ${name}`);
    }
  }

  // Persist JSON for diffing across runs
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUTPUT_DIR, `${ts}.json`);
  await fs.writeFile(
    outPath,
    JSON.stringify(
      {
        timestamp: ts,
        totalMs: overallMs,
        summary: sum,
        briefs: results,
      },
      null,
      2,
    ),
  );
  console.log(`\nfull results written to ${path.relative(process.cwd(), outPath)}`);

  if (sum.failedErrors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('test-quality FAILED:', err);
  process.exit(1);
});
