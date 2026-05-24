import { and, eq } from 'drizzle-orm';
import { l as db, G as diagnosticRuns } from '../nitro/nitro.mjs';

async function loadRecentGponRxAlerts(limit = 20) {
  const runs = await db.query.diagnosticRuns.findMany({
    where: and(eq(diagnosticRuns.runType, "gpon-rx-refresh"), eq(diagnosticRuns.success, true)),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: Math.max(limit, 1)
  });
  return runs.flatMap((run) => {
    const result = run.result;
    return (result.alerts || []).map((alert) => ({
      ...alert,
      diagnosticRunId: run.id,
      createdAt: run.createdAt
    }));
  }).slice(0, limit);
}

export { loadRecentGponRxAlerts as l };
