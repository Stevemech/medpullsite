#!/usr/bin/env tsx
/**
 * Cron-style runner for the follow-up sequence engine (p3-2).
 *
 *   npm run followups          # process due follow-ups once
 *
 * Schedule it (e.g. every 15 minutes) with cron:
 *   *\/15 * * * * cd /path/to/kanthi && npm run followups >> logs/followups.log 2>&1
 *
 * Safe to run as often as you like — it is idempotent and respects DRY_RUN,
 * the suppression list, and quiet hours via the p3-1 SMS module.
 */
import { runFollowups } from "../src/lib/followups";

async function main() {
  const startedAt = new Date();
  const summary = await runFollowups(startedAt);
  console.log(
    `[followups ${startedAt.toISOString()}] leads=${summary.leadsConsidered} ` +
      `sent=${summary.stepsSent} dryRun=${summary.stepsDryRun} ` +
      `skipped=${summary.stepsSkipped} failed=${summary.stepsFailed}`
  );
  for (const d of summary.details) {
    console.log(`  lead=${d.leadId} step=${d.step} -> ${d.status}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[followups] fatal:", err);
    process.exit(1);
  });
