import { d as defineEventHandler, k as getRouterParam, c as createError, r as readBody, X as importModeSchema, U as getDriverForEquipment, Y as compactImportSummary, Z as recordImportRun } from '../../../../../nitro/nitro.mjs';
import { b as syncDasanOnusToFtth } from '../../../../../_/import-service.mjs';
import 'zod';
import 'drizzle-orm';
import 'node:child_process';
import 'node:fs/promises';
import 'node:path';
import 'ssh2';
import 'node:net';
import 'drizzle-orm/pg-core';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'ioredis';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'consola';

const handler = defineEventHandler(async (event) => {
  const equipmentId = getRouterParam(event, "equipmentId");
  if (!equipmentId) throw createError({ statusCode: 400, statusMessage: "Brak equipmentId" });
  const body = await readBody(event).catch(() => ({}));
  const { mode, activeOnly, limit, rangeFrom, rangeTo } = importModeSchema.parse(body || {});
  const effectiveMode = mode === "dryRun" ? "preview" : mode;
  const { driver, driverCode } = await getDriverForEquipment(equipmentId);
  const onus = await driver.getOnus({ activeOnly, limit, rangeFrom, rangeTo });
  const actions = await syncDasanOnusToFtth(equipmentId, onus, effectiveMode);
  const compactSummary = compactImportSummary({ mode: effectiveMode, onus: onus.length, actions });
  const summary = {
    ...compactSummary,
    progress: {
      activeOnly,
      totalKnownOnus: onus.length,
      selectedOnus: onus.length,
      processedOnus: onus.length,
      rangeFrom,
      rangeTo,
      completed: true,
      currentOnu: null
    }
  };
  await recordImportRun(equipmentId, driverCode, "dasan-onus", effectiveMode, summary);
  return { success: true, data: summary };
});

export { handler as default };
